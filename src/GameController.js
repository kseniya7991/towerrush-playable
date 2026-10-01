export class GameController {
    constructor(worldManager) {
        this.screen = screen;
        this.worldManager = worldManager;

        this.crane = this.worldManager.crane;
        this.tower = this.worldManager.tower;
        this.newBlock = this.worldManager.newBlock;
        this.dropSmoke = this.worldManager.dropSmoke;
        this.skyScrollable = this.worldManager.skyScrollable;
        this.gameScrollable = this.worldManager.gameScrollable;

        this.isReady = false;
        this.onReadyChange = null;
    }

    addNewBlock() {
        if (!this.canSpawn()) return;

        this.isReady = false;

        const newElement = this.newBlock.addBlock();
        this.crane.spawnFromTopRight();
        this.crane.attachBlock(newElement);

        this.crane.goDown(() => {
            this.isReady = true;
        });
    }

    set isReady(value) {
        if (this._isReady !== value) {
            this._isReady = value;
            if (this.onReadyChange) {
                this.onReadyChange(value);
            }
        }
    }

    get isReady() {
        return this._isReady;
    }

    canSpawn() {
        return this.newBlock && this.crane;
    }

    async dropBlock(shouldFall = false, onComplete = () => {}) {
        if (!this.isReady) return;
        this.isReady = false;

        const droppedBlockData = this.crane.detachBlock();
        if (!droppedBlockData) return;

        let { position, rotation } = droppedBlockData;
        const blockSprite = this.newBlock.getSprite();

        const target = this.calcTargetPosition(blockSprite, position, shouldFall);
        this.tower.addBlock(blockSprite, position, rotation);

        const craneUpPromise = this.moveCraneUp();

        await this.fallBlock(target);

        if (shouldFall) {
            await this.handleTopple(blockSprite, target);
            this.tower.registerLandedBlock(blockSprite);
        } else {
            this.handleSuccessfulLanding(blockSprite, target);
        }

        await craneUpPromise;
        onComplete();

        if (!shouldFall) this.addNewBlock();
    }

    async handleTopple(blockSprite, target) {
        const prevBlockX = this.tower.getLastBlockX();
        const direction = target.targetX < prevBlockX ? -1 : 1;

        const floorY = this.calcFloorY(blockSprite);

        return new Promise((resolve) => {
            this.newBlock.topple(
                {
                    targetY: floorY,
                    direction,
                },
                resolve,
            );
        });
    }

    handleSuccessfulLanding(blockSprite, target) {
        this.tower.registerLandedBlock(blockSprite);
        this.dropSmoke.playSmoke(blockSprite.x, target.targetY);
        this.worldManager.shake();

        const prevBlockHeight = this.tower.getLastBlockHeight();
        this.moveScrollables(prevBlockHeight);
    }

    fallBlock(target) {
        return new Promise((resolve) => {
            this.newBlock.startFalling(target, resolve);
        });
    }

    moveCraneUp() {
        return new Promise((resolve) => {
            this.crane.goUp(resolve);
        });
    }

    calcTargetPosition(blockSprite, position, shouldFall) {
        const targetY = this.tower.getTopY();
        const targetX = this.calcTargetX(blockSprite, position, shouldFall);
        return { targetX, targetY };
    }

    calcFloorY(blockSprite) {
        const baseBlockY = 0;
        return baseBlockY - blockSprite.height - blockSprite.width / 2;
    }

    calcTargetX(blockSprite, position, shouldFall) {
        const localPoint = this.tower.toLocal(position);
        const prevBlockX = this.tower.getLastBlockX();

        const blockWidth = blockSprite.width;
        const diffX = localPoint.x - prevBlockX;
        let targetX = localPoint.x;

        if (shouldFall) {
            targetX = this.applyUnstableLogic(diffX, prevBlockX, blockWidth);
        } else {
            targetX = this.applyStableLogic(diffX, prevBlockX, blockWidth);
        }

        return targetX;
    }

    applyUnstableLogic(diffX, prevBlockX, blockWidth) {
        const UNSTABLE_OVERLAP = 0.3;
        const unstableDist = blockWidth * (1 - UNSTABLE_OVERLAP);

        if (Math.abs(diffX) < unstableDist) {
            const direction = Math.sign(diffX) || 1;
            return prevBlockX + direction * unstableDist;
        }

        return prevBlockX + diffX;
    }

    applyStableLogic(diffX, prevBlockX, blockWidth) {
        const TRIGGER_FACTOR = 0.5;
        const maxAllowedDist = blockWidth * TRIGGER_FACTOR;

        const TARGET_OVERLAP = 0.7;
        const targetDistFromCenter = blockWidth * (1 - TARGET_OVERLAP);

        if (Math.abs(diffX) > maxAllowedDist) {
            return prevBlockX + Math.sign(diffX) * targetDistFromCenter;
        }

        return prevBlockX + diffX;
    }

    moveScrollables(stepHeight) {
        this.skyScrollable.scrollStep(this.screen.height, stepHeight);
        this.gameScrollable.scrollStep(this.screen.height, stepHeight, () => {
            this.worldManager.checkVisibility();
            if (this.tower && this.tower.cleanup) {
                this.tower.cleanup();
            }
        });
    }

    startRound() {
        this.crane.reset();
        this.worldManager.resetWorld();
        this.tower.reset();
        this.skyScrollable.resetScroll();
        this.gameScrollable.resetScroll(() => {
            this.addNewBlock();
        });
    }
}
