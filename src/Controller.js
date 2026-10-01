// Controllers
const CONTROL_ITEM_SELECTOR = ".js-game__control-item";
const CONTROLLER_MINUS_SELECTOR = ".js-game__controller-minus";
const CONTROLLER_PLUS_SELECTOR = ".js-game__controller-plus";
const CONTROLLER_INPUT_SELECTOR = ".js-game__controller-input";

const CONTROLLER_ALL_IN_SELECTOR = ".js-game__controller-all";
const CONTROLLER_X2_SELECTOR = ".js-game__controller-x2";

const MAX_VALUE_ATTR = "data-max";
const MIN_VALUE_ATTR = "data-min";

// BTN PHASES
const BTN_BET_PHASE = "bet";

// Other
const MAX_VALUE = 100000;
const MIN_VALUE = 90;

export class Controller {
    constructor() {
        this.el = document.querySelector(CONTROL_ITEM_SELECTOR);

        // Common
        this.minus = this.el.querySelector(CONTROLLER_MINUS_SELECTOR);
        this.plus = this.el.querySelector(CONTROLLER_PLUS_SELECTOR);
        this.betInput = this.el.querySelector(CONTROLLER_INPUT_SELECTOR);

        this.maxValue = Number(this.betInput?.getAttribute(MAX_VALUE_ATTR)) || MAX_VALUE;
        this.minValue = Number(this.betInput?.getAttribute(MIN_VALUE_ATTR)) || MIN_VALUE;

        // Bets
        this.allInBtn = this.el.querySelector(CONTROLLER_ALL_IN_SELECTOR);
        this.x2Btn = this.el.querySelector(CONTROLLER_X2_SELECTOR);

        // Other
        this.currentBtnPhase = BTN_BET_PHASE;
        this.currentBet = this.betInput.value;
        this.nextBet = 0;

        this.init();
    }

    init = () => {
        this.bindEvents();
    };

    updateMaxValue(value) {
        this.maxValue = value;
    }

    bindEvents() {
        this.allInBtn?.addEventListener("click", () => {
            this.setInputValue(this.maxValue);
        });
        this.x2Btn?.addEventListener("click", () => {
            this.setInputValue(this.currentBet * 2);
        });

        this.minus?.addEventListener("click", () => this.changeInputByStep(-90));
        this.plus?.addEventListener("click", () => this.changeInputByStep(90));

        this.betInput?.addEventListener("blur", this.onBetInputBlur);
        this.betInput?.addEventListener("input", this.onBetInput);
    }

    // Input handlers
    onBetInput = () => {
        const cleanedValue = this.cleanValue(this.betInput.value);
        this.betInput.value = this.formatWithSpaces(cleanedValue);
    };

    onBetInputBlur = () => {
        this.setInputValue(this.betInput.value);
    };

    // Betting
    resetCurrentBet() {
        this.currentBet = 0;
    }

    getCurrentBet() {
        return this.currentBet;
    }

    resetBets() {
        this.currentBet = 0;
        this.nextBet = 0;
    }

    setInputValue(value) {
        const cleanedValue = this.cleanValue(value);
        const clampedValue = this.clampValue(cleanedValue);
        this.currentBet = clampedValue;
        this.betInput.value = this.formatWithSpaces(clampedValue);
    }

    getBetInputValue() {
        return Number(this.cleanValue(this.betInput.value));
    }

    changeInputByStep(step) {
        let currentValue = parseFloat(this.cleanValue(this.betInput.value));
        let newValue = this.addStep(currentValue, step);
        this.setInputValue(newValue);
    }

    cleanValue(value) {
        const cleaned = value.toString().replace(/[^0-9.]/g, "");

        const firstDotIndex = cleaned.indexOf(".");
        const normalized =
            firstDotIndex === -1
                ? cleaned
                : cleaned.slice(0, firstDotIndex + 1) +
                  cleaned.slice(firstDotIndex + 1).replace(/\./g, "");

        const [int = ""] = normalized.split(".");
        const intPart = int.slice(0, 6);

        return intPart;
    }

    addStep(value, step) {
        const decimalPlaces = (value.toString().split(".")[1] || "").length;
        const newValue = parseFloat((value + step).toFixed(decimalPlaces + 1));
        return newValue;
    }

    formatWithSpaces(value) {
        return new Intl.NumberFormat("ru-RU").format(value);
    }

    clampValue(value = 0, min = this.minValue || 0.1, max = this.maxValue || 150) {
        return Math.max(min, Math.min(value, max));
    }
}
