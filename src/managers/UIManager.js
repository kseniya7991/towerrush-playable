const MAIN_PRELOADER_SELECTOR = ".js-preloader";
const MAIN_PRELOADER_PROGRESS_SELECTOR = ".js-preloader__progress";

const GAME_FINAL_MODAL_SELECTOR = ".js-game__final";
const CASHOUT_MODAL_SELECTOR = ".js-game__cashout-modal";
const CASHOUT_MULT_SELECTOR = ".js-game__cashout-mult";
const CASHOUT_RESULT_SELECTOR = ".js-game__cashout-result";
const BALANCE_SELECTOR = ".js-game__balance";

const MULTIPLIER_FLY_SELECTOR = ".js-multiplier-fly";
const MULTIPLIER_SIDEBAR_SELECTOR = ".js-multiplier-sidebar";
const MULTIPLIER_LIST_SELECTOR = ".js-multiplier-list";

const GAME_PANEL_SELECTOR = ".js-game__panel";

const ACTIVE_CLASS = "active";
const HIDING_CLASS = "hiding";
const DISABLED_CLASS = "disabled";
const ZERO_CLASS = "zero";
const MULTIPLIER_ITEM_CLASS = "multiplier-item";

export class UIManager {
    constructor(timerManager) {
        this.timerManager = timerManager;
        this._initializeElements();
    }

    _initializeElements() {
        this.dom = {
            preloader: document.querySelector(MAIN_PRELOADER_SELECTOR),
            progress: document.querySelector(MAIN_PRELOADER_PROGRESS_SELECTOR),
            balance: document.querySelector(BALANCE_SELECTOR),
            panelEl: document.querySelector(GAME_PANEL_SELECTOR),

            // Modals
            finalModal: document.querySelector(GAME_FINAL_MODAL_SELECTOR),
            cashoutModal: document.querySelector(CASHOUT_MODAL_SELECTOR),
            cashoutMult: document.querySelector(CASHOUT_MULT_SELECTOR),
            cashoutResults: document.querySelectorAll(CASHOUT_RESULT_SELECTOR),

            // Multiplier-fly & sidebar
            flyEl: document.querySelector(MULTIPLIER_FLY_SELECTOR),
            listEl: document.querySelector(MULTIPLIER_LIST_SELECTOR),
            sidebarEl: document.querySelector(MULTIPLIER_SIDEBAR_SELECTOR),
        };
    }

    showFloatingMultiplier(value) {
        const el = this.dom.flyEl;
        if (!el) return;

        this.timerManager.clear("flyTimer");
        el.classList.remove(HIDING_CLASS, ACTIVE_CLASS, ZERO_CLASS);
        el.textContent = `x${value}`;

        if (Number(value) === 0) {
            el.classList.add(ZERO_CLASS);
        }

        requestAnimationFrame(() => el.classList.add(ACTIVE_CLASS));
        if (value > 0) {
            this.timerManager.set("flyTimer", () => this.handleFlyToSidebar(value), 500);
        }
    }

    handleFlyToSidebar(value) {
        this.dom.flyEl?.classList.remove(ACTIVE_CLASS);
        this.addMultiplierToList(value);
    }

    addMultiplierToList(value) {
        const { listEl, sidebarEl, flyEl } = this.dom;

        if (!listEl) return;

        flyEl.classList.add(HIDING_CLASS);

        const item = document.createElement("div");
        item.className = MULTIPLIER_ITEM_CLASS;
        item.textContent = `x${value}`;

        if (listEl.children.length === 0) {
            sidebarEl?.classList.add(ACTIVE_CLASS);
        }

        listEl.prepend(item);
        if (listEl.parentElement) {
            listEl.parentElement.scrollTop = 0;
        }
    }

    clearMultiplierList() {
        this.timerManager.clear("flyTimer");
        const { flyEl, sidebarEl, listEl } = this.dom;

        if (flyEl) {
            flyEl.classList.remove(ZERO_CLASS, ACTIVE_CLASS, HIDING_CLASS);
            flyEl.textContent = "";
        }
        if (sidebarEl) sidebarEl.classList.remove(ACTIVE_CLASS);
        if (listEl) listEl.innerHTML = "";
    }

    // Progress
    updateBalance(value) {
        if (this.dom.balance) {
            this.dom.balance.textContent = value;
        }
    }

    updateMainPreloaderProgress(progress) {
        if (this.dom.progress) {
            this.dom.progress.style.width = `${progress}%`;
        }
    }

    hideMainPreloader() {
        this.dom.preloader?.classList.remove(ACTIVE_CLASS);
    }

    // States

    showCashoutState(mult, sum, isLastRound) {
        this.ui.updateCashoutValues(mult, sum);

        if (isLastRound) {
            this.toggleModal(this.dom.finalModal, true);
        } else {
            this.toggleModal(this.dom.cashoutModal, true);
        }
    }

    setWaitingPhase() {
        this.toggleModal(this.dom.cashoutModal, false);
        this.clearMultiplierList();
    }

    // Modals
    toggleModal(el, show = true) {
        if (!el) return;
        el.classList.toggle(ACTIVE_CLASS, show);
    }

    showFinalModal() {
        this.toggleModal(this.dom.finalModal, true);
    }

    showCashoutModal() {
        this.toggleModal(this.dom.cashoutModal, true);
    }

    updateCashoutValues(mult, sum) {
        if (this.dom.cashoutMult) {
            this.dom.cashoutMult.textContent = mult;
        }
        this.dom.cashoutResults.forEach((el) => (el.textContent = sum));
    }

    // Panel
    updatePanelActivity(isActive) {
        this.dom.panelEl?.classList.toggle(DISABLED_CLASS, !isActive);
    }
}
