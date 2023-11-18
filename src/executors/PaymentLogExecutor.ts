import {Executor} from "./Executor.js";
import {Payment} from "../Payment.js";
import {Logger} from "../Logger.js";
import axios from "axios";

export class PaymentLogExecutor extends Executor<Payment>{
    async execute(data: Payment): Promise<void> {
        let comment = "without comment";
        if(data.comment) comment = "with comment: '" + data.comment + "'";
        if(data.isJettonPayment()) {
            await axios.get("https://tonapi.io/v2/jettons/" + data.jetton_address?.toRawString()).catch(() => {}).then((resp) => {
                const metadata = resp?.data.metadata;
                if(metadata) Logger.info(`${data.who.toString()} has paid ${data.amount / (10 ** metadata.decimals)} ${metadata.symbol} ${comment} (hash: ${data.hash})`);
            })

        } else {
            Logger.info(`${data.who.toString()} has paid ${data.amount / (10 ** 9)} TON ${comment} (hash: ${data.hash})`);
        }
    }
}