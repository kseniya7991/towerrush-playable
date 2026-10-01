export class FinancialManager {
    static CHANCES = [
        { threshold: 0.7, range: [0.1, 1.0] },
        { threshold: 0.95, range: [1.0, 3.0] },
        { threshold: 1.0, range: [3.0, 5.0] },
    ];

    constructor(initialBalance = 100000) {
        this.defaultBalance = initialBalance;
        this.balance = initialBalance;

        this.currentMult = 0;
        this.currentBet = 0;
        this.currentCashoutSum = 0;
        this.lastWin = 0;
    }

    placeBet(amount) {
        if (amount > this.balance || amount <= 0) return false;

        this.currentBet = amount;
        this.balance -= amount;
        this.currentCashoutSum = amount;
        return true;
    }

    applyMultiplier(multiplier) {
        if (multiplier <= 0) {
            this.currentCashoutSum = 0;
        } else {
            this.currentCashoutSum = parseFloat((this.currentCashoutSum * multiplier).toFixed(2));
        }
        return this.currentCashoutSum;
    }

    handleLoss() {
        this.resetRoundData();
        if (this.balance <= 0) {
            this.restoreBalance();
            return true;
        }
        return false;
    }

    generateRandomMultiplier() {
        const rand = Math.random();
        const config = FinancialManager.CHANCES.find((item) => rand < item.threshold);

        const [min, max] = config.range;
        const mult = min + Math.random() * (max - min);

        this.currentMult = Number(mult.toFixed(2));
        return this.currentMult;
    }

    restoreBalance() {
        this.balance = this.defaultBalance;
    }

    resetRoundData() {
        this.currentBet = 0;
        this.currentCashoutSum = 0;
    }

    getBalance() {
        return this.balance;
    }

    getCurrentCashout() {
        return this.currentCashoutSum;
    }
}
