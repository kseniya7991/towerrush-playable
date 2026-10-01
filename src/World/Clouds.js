import { Container, Sprite, Assets } from "pixi.js";

export class Clouds extends Container {
    static TEXTURE = "globalJson";
    constructor(screen, tickerManager) {
        super();
        this.screen = screen;
        this.tickerManager = tickerManager;
        this.clouds = [];

        this.init();
    }

    async init() {
        const textures = Assets.get(Clouds.TEXTURE).textures;
        this.createCloud(textures["cloud-1"], 0.1, 60, 0);
        this.createCloud(textures["cloud-2"], 0.3, 100, 2000);
    }

    createCloud(texture, yPosition, speed, startDelay) {
        const cloud = new Sprite(texture);
        cloud.anchor.set(1, 0.5);

        this.addChild(cloud);

        const cloudData = {
            sprite: cloud,
            yPosition,
            speed,
            startDelay,
            timer: null,
            started: false,
            waiting: false,
            baseWidth: texture.width,
            baseHeight: texture.height,
        };

        this.clouds.push(cloudData);

        setTimeout(() => {
            cloudData.started = true;
        }, startDelay);
    }

    play() {
        this.stop();
        this.tickerManager.start("clouds.move", (ticker) => {
            const defaultSpeed = 100;
            const deltaSec = ticker.deltaMS / 1000;
            const screenWidth = screen.width;

            this.clouds.forEach((cloudData) => {
                if (!cloudData.started || cloudData.waiting) return;

                const speed = cloudData.speed || defaultSpeed;

                cloudData.sprite.x += speed * deltaSec;
                const cloudWidth = cloudData.sprite.width;

                if (cloudData.sprite.x >= screenWidth + cloudWidth) {
                    cloudData.waiting = true;

                    const randomDelay = 2000 + Math.random() * 3000;

                    cloudData.timer = setTimeout(() => {
                        cloudData.sprite.x = -cloudWidth / 2;
                        cloudData.waiting = false;
                    }, randomDelay);
                }
            });
        });
    }

    stop() {
        this.tickerManager.stop("clouds.move");
        this.clouds.forEach((cloudData) => {
            clearTimeout(cloudData.timer);
        });
    }

    resize(width, height) {
        this.position.set(0, -height);

        this.clouds.forEach((cloudData) => {
            const scale = (width * 0.5) / cloudData.baseWidth;
            cloudData.sprite.scale.set(scale);
            let yPosition = 0;

            yPosition = height * cloudData.yPosition;
            cloudData.sprite.y = yPosition;
        });
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
        this.clouds = [];
    }
}
