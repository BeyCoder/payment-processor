import {Logger} from "../Logger.js";

export abstract class Executor<Type> {
    public async execute(data: Type) {
        Logger.warn("Executor is not implemented!");
    }
}