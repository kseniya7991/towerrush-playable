import { Container } from "pixi.js";

export class ScrollableContainer extends Container {
    constructor(options = {}, content) {
        super();
        this.content = content;
        this.getMaxY = options.getMaxY || null;
        this.persistPosition = options.persistPosition || false;
        this.persistFromBottom = options.persistFromBottom || false;
        this.isAtTop = false;
        this.positionFromTop = 0;
        this.offsetFromBottom = 0;
        this.lastScale = 1;
        this.scrollDuration = 400;

        if (content.container) {
            this.addChild(content.container);
        }
    }

    scrollStep(screenHeight, floorHeight = 200, onComplete = () => {}) {
        if (this.isAtTop) return;

        const startY = this.y;
        let endY = startY + floorHeight * this.currentCityScale;
        const startTime = Date.now();
        let reachedTop = false;

        if (this.getMaxY) {
            const maxY = this.getMaxY(screenHeight);
            if (endY >= maxY) {
                endY = maxY;
                reachedTop = true;
            }
        }

        const animate = () => {
            if (this._destroyed) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.scrollDuration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.y = startY + (endY - startY) * easeProgress;

            if (this.persistPosition && this.getMaxY) {
                this.positionFromTop = screenHeight / (this.content.sprite.height - this.y);
            }

            if (this.persistFromBottom) {
                this.offsetFromBottom = this.y;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (reachedTop) {
                    this.isAtTop = true;
                }
                onComplete();
            }
        };

        animate();
    }

    resetScroll(onComplete = () => {}) {
        const startY = this.y;
        const endY = 0;
        const startTime = Date.now();
        const duration = this.scrollDuration;

        const animate = () => {
            if (this._destroyed) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.y = startY + (endY - startY) * easeProgress;

            if (this.persistPosition && this.getMaxY) {
                this.positionFromTop = 0;
            }

            if (this.persistFromBottom) {
                this.offsetFromBottom = this.y;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isAtTop = false;
                onComplete();
            }
        };

        animate();
    }

    updatePositionOnResize(screenHeight, newScale = 1) {
        this.currentCityScale = newScale;

        if (this.persistPosition && this.getMaxY) {
            const maxY = this.getMaxY(screenHeight);
            this.y = maxY * this.positionFromTop;
            return;
        }

        if (this.persistFromBottom) {
            const scaleRatio = newScale / this.lastScale;
            this.y = this.offsetFromBottom * scaleRatio;
            this.offsetFromBottom = this.y;
            this.lastScale = newScale;
        }
    }

    destroy(options) {
        this._destroyed = true;
        this.content = null;
        this.getMaxY = null;
        super.destroy(options);
    }
}
