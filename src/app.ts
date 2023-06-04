import * as process from "process";
import {mnemonicToWalletKey} from "ton-crypto";
import {WalletContractV4} from "ton";
import {Logger} from "./Logger.js";
import {PaymentProcessorWorker} from "./workers/PaymentProcessorWorker.js";
import {WebhookExecutor} from "./executors/WebhookExecutor.js";
import {PaymentLogExecutor} from "./executors/PaymentLogExecutor.js";

const mnemonic = process.env.MNEMONICS;
let wallet: WalletContractV4;
if (mnemonic && mnemonic !== "word1 word2 ...") {
  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
} else {
  Logger.error("Please, specify mnemonics of WalletV4 in .env!");
  process.exit(400);
}

Logger.log("Deposit wallet: " + wallet.address.toString());


const webhookExecutor = new WebhookExecutor();
const logExecutor = new PaymentLogExecutor();

const worker = new PaymentProcessorWorker(wallet.address);
//worker.addExecutor(webhookExecutor);
worker.addExecutor(logExecutor);
worker.start();