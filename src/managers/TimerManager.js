export class TimerManager {
    constructor() {
        this.timers = new Map();
    }

    set(name, callback, delay) {
        this.clear(name);
        const timerId = setTimeout(() => {
            callback();
        }, delay);
        this.timers.set(name, timerId);
    }

    clear(name) {
        if (this.timers.has(name)) {
            clearTimeout(this.timers.get(name));
            this.timers.delete(name);
        }
    }

    clearAll() {
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();
    }

    isActive(name) {
        return this.timers.has(name);
    }

    destroy() {
        this.clearAll();
    }
}
