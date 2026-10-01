const MAX_ROUNDS = 3;
const MAX_CLICKS_PER_ROUND = {
    1: 4,
    2: 3,
    3: 6,
};

export class RoundManager {
    constructor() {
        this.currentRound = 0;
        this.counter = 0;
        this.maxClicks = MAX_CLICKS_PER_ROUND[this.currentRound] || 4;
    }

    isFirstBlock() {
        return this.counter === 0;
    }

    startNextRound() {
        this.resetCounter();
        this.currentRound += 1;
        this.maxClicks = this.getMaxClicks();
    }

    isLastRound() {
        return this.currentRound >= MAX_ROUNDS;
    }

    isLastClick() {
        return this.counter >= this.getMaxClicks() + 1;
    }

    incrementCounter() {
        this.counter += 1;
    }

    canStartNextRound() {
        return this.currentRound < MAX_ROUNDS;
    }

    // Getters
    getMaxClicks() {
        return MAX_CLICKS_PER_ROUND[this.currentRound] || 4;
    }

    getCurrentRound() {
        return this.currentRound;
    }

    getCounter() {
        return this.counter;
    }

    // Reset
    reset() {
        this.resetRound();
        this.resetMult();
        this.resetCounter();
    }
    resetRound() {
        this.currentRound = 0;
    }

    resetCounter() {
        this.counter = 0;
    }

    destroy() {
        this.reset();
    }
}
