import { Container } from "pixi.js";
import { City } from "../World/City";
import { Sky } from "../World/Sky";
import { Clouds } from "../World/Clouds";
import { Sun } from "../World/Sun";
import { Crane } from "../World/Crane";
import { NewBlock } from "../World/NewBlock";
import { Tower } from "../World/Tower";
import { ScrollableContainer } from "../World/ScrollableContainer";
import { DropSmoke } from "../Effects/DropSmoke";
import { ResultSmoke } from "../Effects/ResultSmoke";

export class WorldManager {
    constructor(screen, tickerManager, app) {
        this.screen = screen;
        this.tickerManager = tickerManager;
        this.app = app;

        this.objects = [];
        this.gameContainer = null;
        this.skyScrollable = null;
        this.gameScrollable = null;
    }

    createObjects() {
        this.city = new City();
        this.sky = new Sky();
        this.clouds = new Clouds(this.screen, this.tickerManager);
        this.sun = new Sun(this.tickerManager);
        this.crane = new Crane(this.screen, this.tickerManager);
        this.newBlock = new NewBlock(this.screen, this.tickerManager);
        this.tower = new Tower(this.screen);
        this.dropSmoke = new DropSmoke();
        this.resultSmoke = new ResultSmoke(this.screen);

        this.objects = [
            this.sky,
            this.sun,
            this.city,
            this.clouds,
            this.crane,
            this.newBlock,
            this.tower,
            this.dropSmoke,
            this.resultSmoke,
        ];
    }

    setupContainers(rootContainer) {
        this.gameContainer = new Container();
        this.gameContainer.sortableChildren = true;
        this.gameContainer.y = this.screen.height;

        this._setupZIndex();

        this.gameContainer.addChild(this.sun, this.city, this.tower, this.dropSmoke);

        const { skyScrollable, gameScrollable } = this.createScrollableContainers();

        this.skyScrollable = skyScrollable;
        this.gameScrollable = gameScrollable;

        this.skyScrollable.addChild(this.sky);
        this.gameScrollable.addChild(this.clouds, this.gameContainer);

        rootContainer.addChild(
            this.skyScrollable,
            this.gameScrollable,
            this.crane,
            this.resultSmoke,
        );
    }

    _setupZIndex() {
        const layers = { sun: 1, city: 2, tower: 3, dropSmoke: 4 };
        Object.entries(layers).forEach(([key, index]) => {
            const obj = this[key];
            const target = obj instanceof Container ? obj : obj.container;
            if (target) target.zIndex = index;
        });
    }

    createScrollableContainers() {
        const skyScrollable = new ScrollableContainer(
            {
                getMaxY: (screenHeight) => this.sky.sprite.height - screenHeight,
                persistPosition: true,
            },
            this.sky,
        );
        const gameScrollable = new ScrollableContainer({ persistFromBottom: true }, {});
        return { skyScrollable, gameScrollable };
    }

    shake(intensity = 10, duration = 0.25) {
        this.tickerManager.stop("world.shake");

        let timeLeft = duration;
        const centerX = this.screen.width / 2;

        this.tickerManager.start("world.shake", (ticker) => {
            const dt = ticker.deltaMS / 1000;
            timeLeft -= dt;

            if (timeLeft <= 0) {
                this.gameContainer.position.set(centerX, 0);
                this.tickerManager.stop("world.shake");
                return;
            }

            const progress = timeLeft / duration;
            const currentIntensity = intensity * progress;

            const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
            const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

            this.gameContainer.position.set(centerX + offsetX, offsetY);
        });
    }

    resize() {
        const { width, height } = this.screen;
        this.updateGameScale(width, height);

        if (this.gameContainer) {
            this.gameContainer.position.set(width / 2, 0);
        }

        this.objects.forEach((obj) => {
            if (typeof obj.resize === "function") {
                obj.resize(width, height);
            }
        });
    }

    checkVisibility() {
        this.objects.forEach((obj) => {
            const target = obj instanceof Container ? obj : obj.container;
            if (target && typeof obj.hide === "function") {
                const bounds = target.getBounds();
                const isVisible = bounds.bottom > 0 && bounds.top < this.screen.height;
                if (!isVisible) {
                    obj.hide();
                }
            }
        });
    }

    resetWorld() {
        this.resize();
        this.objects.forEach((obj) => {
            const target = obj instanceof Container ? obj : obj.container;
            if (target && typeof obj.show === "function") {
                obj.show(this.gameContainer);
            }
            if (obj && typeof obj.play === "function") {
                obj.play();
            }
        });
    }

    updateGameScale(width, height) {
        const cityScale = this.city.getCityScale(width, height);

        this.gameContainer?.scale.set(cityScale);
        this.gameScrollable?.updatePositionOnResize(height, cityScale);
        this.skyScrollable?.updatePositionOnResize(height, cityScale);
        this.crane?.updateCableScale(cityScale);
    }

    changePhase(phase) {
        this.objectsWithPhase.forEach((obj) => {
            if (obj && typeof obj.changePhase === "function") {
                obj.changePhase(phase);
            }
        });
    }

    destroy() {
        this.objects.forEach((obj) => {
            if (obj && typeof obj.destroy === "function") {
                try {
                    obj.destroy();
                } catch (e) {
                    console.warn("Error destroying object:", obj, e);
                }
            }
        });

        const containers = [this.gameScrollable, this.skyScrollable, this.gameContainer];
        containers.forEach((c) => c?.destroy({ children: false, texture: false }));

        this.objects = [];
        const keys = [
            "city",
            "sky",
            "clouds",
            "sun",
            "crane",
            "newBlock",
            "tower",
            "dropSmoke",
            "resultSmoke",
            "gameContainer",
            "skyScrollable",
            "gameScrollable",
        ];
        keys.forEach((key) => (this[key] = null));
    }
}
