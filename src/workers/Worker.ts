export abstract class Worker {
    public start() {

    }

    protected sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
}