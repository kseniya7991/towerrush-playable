export class TickerManager {
    constructor(ticker) {
        this.ticker = ticker;
        this.list = new Map();
        this.enabled = true;
    }

    start(name, callback) {
        this.stop(name);

        const wrapped = (ticker) => {
            if (!this.enabled) return;
            callback(ticker);
        };

        this.list.set(name, wrapped);
        this.ticker.add(wrapped);
    }

    stop(name) {
        if (!this.list.has(name)) return;
        this.ticker.remove(this.list.get(name));
        this.list.delete(name);
    }

    isActive(name) {
        return this.list.has(name);
    }

    pauseAll() {
        this.enabled = false;
    }

    resumeAll() {
        this.enabled = true;
    }

    clearAll() {
        this.list.forEach((callback) => this.ticker.remove(callback));
        this.list.clear();
    }

    destroy() {
        this.clearAll();
        this.ticker = null;
    }
}
