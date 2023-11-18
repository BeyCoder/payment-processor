import {Transaction} from "@fck-foundation/ton/dist/blockchain/transactions/Transaction";
import {Address} from "ton-core";
import {BlockchainNetwork, JettonTransferNotificationAction} from "@fck-foundation/ton";
import {Blockchain} from "@fck-foundation/ton/dist/blockchain/Blockchain.js";

export class Payment {
    public readonly jetton_address?: Address;
    public readonly hash: string;
    public readonly time: Date;
    public readonly who: Address;
    public readonly amount: number;
    public readonly comment: string | undefined;
    constructor(hash: string, time: Date, who: Address, amount: number, comment?: string, jetton_address?: Address) {
        this.hash = hash;
        this.time = time;
        this.who = who;
        this.amount = amount;
        this.comment = comment;
        this.jetton_address = jetton_address;
    }

    static async create(transaction: Transaction, blockchain: Blockchain) {
        let sender = transaction.in_msg?.source;
        let amount = Number(transaction.in_msg?.value);
        let jetton_address;
        if (transaction.in_msg?.action instanceof JettonTransferNotificationAction) {
            sender = transaction.in_msg.action.sender;

            //TODO: be avoid from god object, jetton parsing must be in other class
            const jetton_wallet_address = transaction.in_msg.source.address;
            const get_wallet_data = await blockchain.oldClient.runMethod(jetton_wallet_address, "get_wallet_data");

            //https://github.com/ton-blockchain/TEPs/blob/master/text/0074-jettons-standard.md#get-methods
            let balance = get_wallet_data.stack.readNumber();
            let owner = get_wallet_data.stack.readAddress();
            jetton_address = get_wallet_data.stack.readAddress();
            amount = Number(transaction.in_msg.action.amount);
        }

        if(sender)
            return new Payment(
                transaction.hash,
                transaction.time,
                sender.address,
                amount,
                transaction.in_msg?.comment,
                jetton_address
            );
        else
            throw new Error("Sender is not specified!");
    }

    isJettonPayment(): boolean {
        return !!this.jetton_address;
    }
}