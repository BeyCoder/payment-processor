import { Transaction } from "@fck-foundation/ton/dist/blockchain/transactions/Transaction";
import { EventListener } from "../EventListener.js";
import { Account } from "@fck-foundation/ton/dist/blockchain/wallets/Account";
import { JsonDB, Config } from "node-json-db";
import {
  TransactionFetcher,
} from "@fck-foundation/ton";
import { Blockchain } from "@fck-foundation/ton/dist/blockchain/Blockchain.js";
import { config } from "@fck-foundation/ton/dist/config.js";

export class NewTransactionNotifier {
  private id: string;
  private listener: EventListener<Transaction>;
  private account: Account;
  private db: JsonDB;
  private blockchain: Blockchain;
  private timeout: number;
  private last = 0;

  constructor(
    account: Account,
    blockchain: Blockchain,
    interval: number = 1,
    timeoutMS: number = 1000,
    id: string | null = null
  ) {
    this.listener = new EventListener<Transaction>();
    this.account = account;
    this.blockchain = blockchain;
    this.timeout = timeoutMS;

    if (id == null) this.id = account.address.toString();
    else this.id = id;

    this.db = new JsonDB(
      new Config("data/updatedTransactions", true, false, "/")
    );

    this.log("System initialized, interval is " + interval + " seconds");
    setInterval(this.update.bind(this), interval * 1000);
    this.update();
  }

  update() {
    this.log("Fetching...");
    const fetcher = new TransactionFetcher(
      this.account,
      this.blockchain
    );

    fetcher.fetchTransactions(100).then(async (transactions) => {
      for (const transaction of transactions.reverse()) {
        let found: boolean = true;

        try {
          const tryToFind = await this.db.getIndex(
            "/" + this.id,
            transaction.hash
          );
          if (tryToFind === -1) found = false;
        } catch (exception) {
          found = false;
        }

        if (!found) {
          this.log("Triggering transaction " + transaction.hash + " ...");
          setTimeout(() => {
            this.listener.trigger(transaction);
            this.last -= this.timeout;
          }, this.last);
          this.last += this.timeout;

          this.db.push("/" + this.id + "[]", { id: transaction.hash });
        }
      }

      this.log("Fetching completed!");
    }).catch((i) => console.error('Error', i));
  }

  private log(message: string) {
    if (config.DEBUG) console.log("Notifier(" + this.id + "): " + message);
  }

  public subscribe(callback: (Transaction) => void) {
    this.listener.subscribe(callback);
  }

  public unsubscribe(callback: (Transaction) => void) {
    this.listener.unsubscribe(callback);
  }
}
