export class EventListener<Data> {
    private handlers: Array<(data: Data) => void> = [];

    public subscribe(handler: (data: Data) => void): void {
        this.handlers?.push(handler);
    }

    public unsubscribe(handler: (data: Data) => void): void {
        this.handlers = this.handlers?.filter(h => h !== handler);
    }

    public trigger(data: Data): void {
        this.handlers?.slice(0)?.forEach(h => h(data));
    }
}