import { Sprite, Assets } from "pixi.js";

export class NewBlock {
    static TEXTURE = "globalJson";
    static SCALE = 1;
    static TEXTURE_KEYS = ["tower-1", "tower-2", "tower-3", "tower-4", "tower-5"];

    constructor(screen, tickerManager) {
        this.screen = screen;
        this.tickerManager = tickerManager;

        this.sprite = null;
        this.isFalling = false;
        this.velocity = 0;

        const asset = Assets.get(NewBlock.TEXTURE);
        this.textures = asset?.textures || {};
    }

    addBlock() {
        this.sprite = new Sprite(this.getRandomTexture());
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(NewBlock.SCALE);
        this.sprite.position.set(0);
        return this.sprite;
    }

    getSprite() {
        return this.sprite;
    }

    getRandomTexture() {
        const key = NewBlock.TEXTURE_KEYS[Math.floor(Math.random() * NewBlock.TEXTURE_KEYS.length)];
        return this.textures[key];
    }

    startFalling({ targetX, targetY }, onLanded) {
        if (!this.sprite) return;

        // this.tickerManager.stop(`block.fall`);
        this.velocity = 0;
        this.isFalling = true;

        const BASE_SPEED = 10000;
        const SNAP_FACTOR = 50;
        const ROTATION_SPEED = 5;
        const TARGET_ROTATION = 0;

        const startY = this.sprite.y;
        const startX = this.sprite.x;
        const safeTargetX = targetX !== undefined ? targetX : startX;

        const totalDistY = targetY - startY;
        const totalDistX = safeTargetX - startX;

        const fallTick = (ticker) => {
            const dt = ticker.deltaMS / 1000;

            let progress = 0;
            if (totalDistY > 0) {
                progress = (this.sprite.y - startY) / totalDistY;
                progress = Math.min(Math.max(progress, 0), 1);
            }

            const currentAcceleration = BASE_SPEED * (1 + progress * progress * SNAP_FACTOR);
            this.velocity += currentAcceleration * dt;
            this.sprite.y += this.velocity * dt;

            if (totalDistY > 0) {
                this.sprite.x = startX + totalDistX * progress;
            }

            if (Math.abs(this.sprite.rotation - TARGET_ROTATION) > 0.001) {
                this.sprite.rotation +=
                    (TARGET_ROTATION - this.sprite.rotation) * ROTATION_SPEED * dt;
            } else {
                this.sprite.rotation = TARGET_ROTATION;
            }

            if (this.sprite.y >= targetY) {
                this._finishMotion(`block.fall`, targetY, safeTargetX, TARGET_ROTATION, onLanded);
            }
        };

        this.tickerManager.start(`block.fall`, fallTick);
    }

    topple({ targetY, direction }, onFinished) {
        if (!this.sprite) return;

        this.tickerManager.stop(`block.fall`);
        this.isFalling = true;

        let velocityY = 0;
        let velocityX = 100 * direction;

        const GRAVITY = 10000;
        const MAX_ROTATION = Math.PI / 2;
        const ROT_SPEED = 4.5 * direction;
        const TARGET_ANGLE = MAX_ROTATION * direction;

        const toppleTick = (ticker) => {
            const dt = ticker.deltaMS / 1000;

            velocityY += GRAVITY * dt;
            this.sprite.y += velocityY * dt;

            this.sprite.x += velocityX * dt;

            let nextRotation = this.sprite.rotation + ROT_SPEED * dt;

            if (direction > 0) {
                this.sprite.rotation = Math.min(nextRotation, TARGET_ANGLE);
            } else {
                this.sprite.rotation = Math.max(nextRotation, TARGET_ANGLE);
            }

            if (this.sprite.y > targetY + this.sprite.height) {
                this.tickerManager.stop(`block.topple`);
                this.isFalling = false;
                onFinished?.();
            }
        };

        this.tickerManager.start(`block.topple`, toppleTick);
    }

    _finishMotion(key, y, x, rot, callback) {
        this.sprite.y = y;
        this.sprite.x = x;
        this.sprite.rotation = rot;
        this.tickerManager.stop(key);
        this.isFalling = false;
        callback?.();

        // if (this.sprite.y >= targetY) {
        //     this.sprite.y = targetY;
        //     this.sprite.x = safeTargetX;
        //     this.sprite.rotation = targetRotation;

        //     this.tickerManager.stop(`block.fall`);
        //     this.isFalling = false;

        //     if (onLanded) onLanded();
        // }
    }

    destroy() {
        this.container = null;
        this.sprite = null;
    }
}
