export class Logger {
    public static log(message: string, data?: any) {
        if(data == undefined) console.log(this.prefix() + message);
        else console.log(this.prefix() + message, data);
    }
    public static error(message: string, data?: any) {
        if(data == undefined) console.error(this.prefix()+ message);
        else console.error(this.prefix() + message, data);
    }
    public static warn(message: string, data?: any) {
        if(data == undefined) console.warn(this.prefix()+ message);
        else console.warn(this.prefix() + message, data);
    }
    public static info(message: string, data?: any) {
        if(data == undefined) console.info(this.prefix()+ message);
        else console.info(this.prefix() + message, data);
    }

    private static prefix() {
        return "[FCK-PAYMENT] ";
    }
}