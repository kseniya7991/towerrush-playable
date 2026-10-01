import "@esotericsoftware/spine-pixi-v8";
import { Application, Assets, Container } from "pixi.js";
import { STATIC_ASSETS, SPRITE_ASSETS, SPINE_ASSETS, AUDIO_DATA } from "./assets.js";
import { Controller } from "./Controller.js";
import { TimerManager } from "./managers/TimerManager.js";
import { RoundManager } from "./managers/RoundManager.js";
import { WorldManager } from "./managers/WorldManager.js";
import { TickerManager } from "./managers/TickerManager.js";
import { UIManager } from "./managers/UIManager.js";
import { GameController } from "./GameController.js";
import { FinancialManager } from "./managers/FinancialManager";
import { AudioManager } from "./AudioManager";
import { createSpritesheetFromData } from "./utils/createSpritesheetFromData.js";

const PREDICTOR_SELECTOR = ".js-game";
const GAME_CANVAS_SELECTOR = ".js-game__canvas";
const GAME_PLAY_SELECTOR = ".js-game__play";
const GAME_BUILD_SELECTOR = ".js-game__build";
const GAME_WRAP_SELECTOR = ".js-game__wrap";
const GAME_CASHOUT_SELECTOR = ".js-game__cashout";

// Phases
export const GAME_PHASES = {
    WAITING: "waiting",
    PLAYING: "playing",
    FINISHING: "finishing",
};

// Other
const FINISHING_DURATION = 3000;
const INITIAL_BALANCE = 100000;
const TARGET_RATIO = 1;
const DELAY_ATTR = "data-delay";

const initGame = () => {
    document.querySelectorAll(PREDICTOR_SELECTOR).forEach((el) => new Game(el));
};

class Game {
    constructor(el) {
        this.el = el;
        this._initDOMElements();

        // Other
        this.currentPhase = GAME_PHASES.WAITING;
        this.cashoutStage = false;

        this.gameIsOver = false;

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.handlePlayAgainClick = this.handlePlayAgainClick.bind(this);

        this.init();
    }

    _initDOMElements() {
        this.gameWrap = this.el.querySelector(GAME_WRAP_SELECTOR);
        this.canvasContainer = this.el.querySelector(GAME_CANVAS_SELECTOR);
        this.playAgainBtn = this.el.querySelector(GAME_PLAY_SELECTOR);
        this.buildBtn = this.el.querySelector(GAME_BUILD_SELECTOR);
        this.cashoutBtn = this.el.querySelector(GAME_CASHOUT_SELECTOR);

        const delay = this.el.getAttribute(DELAY_ATTR);
        this.el.style.setProperty("--delay", delay);
    }

    async init() {
        try {
            await this.initManagers();
            this.ui = new UIManager(this.timerManager);
            this.betController = new Controller();

            await this.initPixiApp();
            await this.loadAssets();

            this.initGameManagers();

            this.ui.hideMainPreloader();
            this.audio.init();
            this.createWorld();

            this.gameController = new GameController(this.worldManager);
            this.gameController.onReadyChange = (isReady) => {
                this.updatePanelAvailability(isReady);
            };

            this.handleWindowResize();
            this._initEventListeners();
            this.setWaitingPhase();
        } catch (error) {
            console.error("Game initialization failed:", error);
        }
    }

    _initEventListeners() {
        window.addEventListener("resize", this.handleWindowResize);
        this.app.renderer.on("resize", this.handleRendererResize);

        this.cashoutBtn?.addEventListener("click", () => this.handleCashoutClick());
        this.buildBtn?.addEventListener("click", () => this.buildTower());
        this.playAgainBtn?.addEventListener("click", this.handlePlayAgainClick);
    }

    async initPixiApp() {
        this.app = new Application();
        await this.app.init({
            resizeTo: this.canvasContainer || window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: true,
        });
        this.canvasContainer?.appendChild(this.app.canvas);
    }

    async loadAssets() {
        await Assets.load(STATIC_ASSETS, (progress) => {
            const percentage = Math.round(progress * 100);
            this.ui.updateMainPreloaderProgress(percentage);
        });
        await Assets.load({ alias: "globalTexture", src: SPRITE_ASSETS.global.texture });
        await Assets.load({ alias: "trAllTexture", src: SPINE_ASSETS.trAll.texture });
        await createSpritesheetFromData(SPRITE_ASSETS.global.json, "globalTexture", "globalJson");
    }

    createWorld() {
        this.worldManager.createObjects();
        this.createContainers();
    }

    createContainers() {
        this.container = new Container();
        this.container.y = this.app.screen.height;
        this.app.stage.addChild(this.container);
        this.worldManager.setupContainers(this.container);
    }

    handleWindowResize() {
        const winHeight = window.innerHeight;
        const winWidth = window.innerWidth;
        const ratio = winWidth / winHeight;

        if (ratio > 1.7) {
            let newHeight = winHeight;
            let newWidth = newHeight * TARGET_RATIO;

            this.gameWrap.style.width = `${newWidth}px`;
            this.gameWrap.style.height = `${newHeight}px`;
            this.gameWrap.style.maxWidth = "none";
            this.el.classList.add("vert");
            document.documentElement.style.setProperty("font-size", "14px");
        } else {
            this.gameWrap.style.width = "";
            this.gameWrap.style.height = "";
            this.gameWrap.style.maxWidth = "";
            this.el.classList.remove("vert");
            document.documentElement.removeAttribute("style");
        }

        this.app?.resize();
    }

    initGameManagers() {
        this.tickerManager = new TickerManager(this.app.ticker);
        this.worldManager = new WorldManager(this.app.screen, this.tickerManager, this.app);
    }
    async initManagers() {
        this.financialManager = new FinancialManager(INITIAL_BALANCE);
        this.timerManager = new TimerManager();
        this.roundManager = new RoundManager();
        this.audio = await new AudioManager(AUDIO_DATA);
    }

    setWaitingPhase() {
        if (this.gameIsOver) return;
        this.tickerManager.clearAll();

        this.changePhase(GAME_PHASES.WAITING);
        this.roundManager.startNextRound();
        this.financialManager.handleLoss();

        this.ui.updateBalance(this.financialManager.getBalance());
        this.ui.setWaitingPhase();

        this.gameController.startRound();
        this.betController.updateMaxValue(this.financialManager.getBalance());
    }

    buildTower() {
        if (!this.gameController.isReady) return;

        if (this.roundManager.isFirstBlock()) {
            const bet = this.betController.getBetInputValue();
            const canBet = this.financialManager.placeBet(bet);
            if (!canBet) return;

            this.ui.updateBalance(this.financialManager.getBalance());
            this.setPlayingPhase();
        }

        this.roundManager.incrementCounter();

        if (this.roundManager.isLastClick()) {
            this.setFinishPhase();
        } else {
            const mult = this.financialManager.generateRandomMultiplier();
            this.gameController.dropBlock(false);
            this.audio.playSoundWithId("floorDrop");
            this.setMultiplier(mult);
        }
    }

    setPlayingPhase() {
        this.changePhase(GAME_PHASES.PLAYING);
    }

    updatePanelAvailability(state) {
        this.ui.updatePanelActivity(state);
    }

    setMultiplier(mult) {
        this.ui.showFloatingMultiplier(mult);
        this.worldManager.resultSmoke.playSmoke();
        const cashoutSum = this.financialManager.applyMultiplier(mult);
        this.ui.updateCashoutValues(mult, cashoutSum);
    }

    setFinishPhase() {
        this.changePhase(GAME_PHASES.FINISHING);
        this.gameController.dropBlock(true);
        this.audio.playSoundWithId("floorFail");
        this.setMultiplier(0);

        if (this.roundManager.isLastRound()) {
            this.audio.playSoundWithId("bigWin");
            this.ui.showFinalModal();
            this.gameIsOver = true;
        } else {
            this.timerManager.set("finishTimer", () => this.setWaitingPhase(), FINISHING_DURATION);
        }
    }

    handleCashoutClick() {
        if (this.currentPhase !== GAME_PHASES.PLAYING) return;

        if (this.roundManager.isLastRound()) {
            this.ui.showFinalModal();
            this.audio.playSoundWithId("bigWin");
            this.gameIsOver = true;
        } else {
            this.ui.showCashoutModal();
            this.audio.playSoundWithId("win");
            this.updatePanelAvailability(false);
        }
    }

    handlePlayAgainClick = () => {
        this.setWaitingPhase();
    };

    handleRendererResize = () => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.container.y = this.app.screen.height;
            this.worldManager.resize();
        }, 0);
    };

    changePhase(phase) {
        this.currentPhase = phase;
        this.el.dataset.phase = phase;
    }

    destroy() {
        window.removeEventListener("resize", this.handleWindowResize);
        this.playAgainBtn?.removeEventListener("click", this.handlePlayAgainClick);

        this.timerManager.destroy();
        this.tickerManager.destroy();
        this.worldManager.destroy();
        this.gameController.destroy();
        this.roundManager.destroy();
        this.app.destroy(true, { children: true, texture: false });
    }
}

window.addEventListener("load", () => initGame());
