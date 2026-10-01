import { Container, Sprite, Assets } from "pixi.js";

export class Sun extends Container {
    static TEXTURE = "globalJson";
    constructor(tickerManager) {
        super();
        this.tickerManager = tickerManager;
        this.clouds = [];
        this.sprite = null;

        this.init();
    }

    async init() {
        const texture = Assets.get(Sun.TEXTURE).textures["sun"];
        this.sprite = new Sprite(texture);
        this.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.y = -500;
    }

    play() {
        this.stop();
        this.tickerManager.start("sun.rotate", (ticker) => {
            const speed = 0.6;
            const deltaSec = ticker.deltaMS / 1000;
            this.sprite.rotation += speed * deltaSec;
        });
    }

    stop() {
        this.tickerManager.stop("sun.rotate");
    }

    hide() {
        if (!this.parent) return;
        this.stop();
        this.removeFromParent();
    }

    show(parent) {
        if (this.parent) return;
        this.play();
        parent.addChild(this);
    }

    destroy() {
        super.destroy({ children: true, texture: false });
        this.sprite = null;
    }
}
