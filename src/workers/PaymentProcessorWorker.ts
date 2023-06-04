import {Address} from "ton-core";
import {Worker} from "./Worker.js";
import {NewTransactionNotifier} from "../events/notifiers/NewTransactionNotifier.js";
import {Transaction} from "@fck-foundation/ton/dist/blockchain/transactions/Transaction";
import {Logger} from "../Logger.js";
import {
    BlockchainNetwork,
    Wallet,
    Blockchain,
    JettonTransferNotificationAction
} from "@fck-foundation/ton";
import {Executor} from "../executors/Executor.js";
import {Payment} from "../Payment.js";

export class PaymentProcessorWorker extends Worker{
    protected readonly address: Address;
    protected executors: Executor<Payment>[];
    private readonly maxTries: number;
    private readonly blockchain: Blockchain;
    constructor(address: Address, executors: Executor<Payment>[] = [], maxTries: number = 5)
    {
        super();
        this.address = address;
        this.executors = executors;
        this.maxTries = maxTries;
        this.blockchain = new Blockchain(BlockchainNetwork.mainnet);
        Logger.log("Worker initialized...");
    }

    public addExecutor(executor: Executor<Payment>) {
        this.executors.push(executor);
    }

    public start() {
        const account = new Wallet(this.address);

        const notifier = new NewTransactionNotifier(account, this.blockchain, 15, 500);
        notifier.subscribe(async (transaction: Transaction) => {
            let tries = this.maxTries;
            while (tries > 0) {
                try {
                    const payment = await Payment.create(transaction, this.blockchain);
                    await this.callExecutors(payment);
                    tries = 0;
                } catch (e) {
                    Logger.error("Transaction: " + transaction.hash);
                    Logger.error("Exception traceback: ", e);
                    Logger.warn(`Error detected! Trying again after 300ms... (Tries remaining: ${tries--}/15)`);
                    await this.sleep(300);
                }
            }
        })
        Logger.log(`Worker started on ${this.address.toString()}! Executors: ${this.executors.length}`);
    }

    private async callExecutors(payment: Payment) {
        for (const executor of this.executors) {
            await executor.execute(payment);
        }
    }
}