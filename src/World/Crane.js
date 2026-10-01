import { Container, Sprite, Assets } from "pixi.js";

export class Crane extends Container {
    static TEXTURE = "globalJson";

    constructor(screen, tickerManager) {
        super();
        this.screen = screen;
        this.tickerManager = tickerManager;

        this.lastContainerHeight = 0;

        this.centerX = this.screen.width / 2;
        this.topY = -this.screen.height;

        // State
        this.verticalOffset = 0;
        this.angle = 0;
        this.time = 0;
        this.cableRotation = 0;
        this.attachedBlock = null;

        // Animation settings
        this.radiusSize = 0.15;
        this.radius = (this.screen.width / 2) * this.radiusSize;
        this.swingSpeed = 3.15;
        this.swingAmplitude = Math.PI * 0.35;
        this.edgeHeightFactor = 0.8;

        this.init();
    }

    async init() {
        const textures = Assets.get(Crane.TEXTURE).textures;

        this.spriteHook = new Sprite(textures["hook"]);
        this.spriteHook.anchor.set(0.5, 0.5);

        this.cableContainer = new Container();
        this.spriteCable = new Sprite(textures["hook-cable"]);
        this.spriteCable.anchor.set(0.5, 0);
        this.spriteCable.scale.set(1.3);

        const hookBounds = this.spriteHook.getBounds();
        this.cableContainer.position.set(2, hookBounds.height / 2 - 8);
        this.cableContainer.addChild(this.spriteCable);

        this.addChild(this.spriteHook, this.cableContainer);
        this.updatePosition();
    }

    play() {
        this.stop();
        this.tickerManager.start("crane.swing", (ticker) => {
            const deltaSec = ticker.deltaMS / 1000;
            this.time += deltaSec * this.swingSpeed;

            const prevAngle = this.angle;
            this.angle = Math.PI / 2 + Math.cos(this.time) * this.swingAmplitude;

            const angularVelocity = (this.angle - prevAngle) / deltaSec;
            const targetTilt = -angularVelocity * 0.03;

            this.cableRotation += (targetTilt - this.cableRotation) * 5 * deltaSec;

            this.updatePosition();
        });
    }

    stop() {
        this.tickerManager.stop("crane.swing");
    }

    goUp(onComplete) {
        const SPEED = 1000;
        const TARGET_Y = -this.height - 350;
        const CONTAINER_HEIGHT = this.height + 20;
        const START_Y = this.y;

        this.tickerManager.start("crane.goUp", (ticker) => {
            const dt = ticker.deltaMS / 1000;
            this.verticalOffset -= SPEED * dt;

            if (START_Y - CONTAINER_HEIGHT > this.y) {
                this.tickerManager.stop("crane.goUp");
                this.verticalOffset = TARGET_Y;

                requestAnimationFrame(() => onComplete?.());
            }
        });
    }

    goDown(onComplete) {
        const SPEED = 1000;
        const TARGET = 0;

        this.tickerManager.start("crane.goDown", (ticker) => {
            const dt = ticker.deltaMS / 1000;
            this.verticalOffset += SPEED * dt;

            if (this.verticalOffset >= TARGET) {
                this.verticalOffset = TARGET;
                this.tickerManager.stop("crane.goDown");
                onComplete?.();
            }
        });
    }

    spawnFromTopRight() {
        this.angle = Math.PI * 0.2;
        this.time = 0;
    }

    updatePosition() {
        const x = this.centerX + Math.cos(this.angle) * this.radius;
        const currentSin = Math.sin(this.angle);
        const adjustableSin = 1 - (1 - currentSin) * this.edgeHeightFactor;

        const verticalDrop = adjustableSin * this.radius * 0.3;
        const y = this.topY + verticalDrop + this.verticalOffset;

        this.position.set(x, y);
        this.cableContainer.rotation = this.cableRotation;
    }

    attachBlock(blockSprite) {
        this.attachedBlock = blockSprite;
        this.cableContainer.addChild(blockSprite);

        this.lastContainerHeight = this.height;
        blockSprite.position.set(0, this.spriteCable.height + blockSprite.height);
    }

    reset() {
        this.detachBlock();
        this.verticalOffset = -this.height - 350;
    }

    detachBlock() {
        if (!this.attachedBlock) return;

        const blockSprite = this.attachedBlock;
        this.attachedBlock = null;
        const blockPosition = blockSprite.getGlobalPosition();
        this.cableContainer.removeChild(blockSprite);
        return { position: blockPosition, rotation: this.cableContainer.rotation };
    }

    updateCableScale(scale) {
        this.cableContainer.scale.set(scale);
    }

    resize(width, height) {
        this.radius = (width / 2) * 0.15;
        this.centerX = width / 2;
        this.topY = -height;
        this.updatePosition();
    }

    destroy() {
        super.destroy(options || { children: true, texture: false });
        this.sprite = null;
    }
}
