import {Executor} from "./Executor.js";
import {Payment} from "../Payment.js";
import * as process from "process";
import axios from "axios";
import {Logger} from "../Logger.js";

export class WebhookExecutor extends Executor<Payment>{
    private readonly webhook_uri: string;
    private readonly webhook_token: string;

    constructor() {
        super();
        const webhook_uri = process.env.WEBHOOK_URI;
        const webhook_token = process.env.WEBHOOK_TOKEN;

        if(!webhook_uri || webhook_uri === "https://your.api/with/endpoint") {
            Logger.error("Webhook URI is not set in .env!");
            process.exit(400);
        }
        if(!webhook_token || webhook_token === "your webhook token") {
            Logger.error("Webhook token is not set in .env!");
            process.exit(400);
        }

        this.webhook_uri = webhook_uri;
        this.webhook_token = webhook_token;
    }

    async execute(data: Payment): Promise<void> {
        const request_data = this.prepareWebhookData(data);
        return axios.post(this.webhook_uri, request_data, {
            headers: {
                Authorization: "Bearer " + this.webhook_token,
                Accept: "application/json"
            }
        })
    }

    private prepareWebhookData(payment: Payment) {
        return {
            payment: {
                jetton_address: payment.jetton_address?.toRawString(),
                hash: payment.hash,
                time: payment.time.getTime() / 1000,
                who: payment.who.toString(),
                amount: payment.amount,
                comment: payment.comment,
            }
        };
    }
}