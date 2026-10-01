import { Container, Sprite, Assets } from "pixi.js";

export class Tower extends Container {
    static BASE_TEXTURE = "base";
    static SCALE = 0.4;
    constructor(screen) {
        super();
        this.blocks = [];
        this.screen = screen;
        this.topY = 0;
        this.lastBlock = null;
        this.prevBlock = null;
        this.init();
    }

    async init() {
        this.addBaseBlock();
    }

    addBaseBlock() {
        const texture = Assets.get(Tower.BASE_TEXTURE);
        const baseSprite = new Sprite(texture);
        baseSprite.scale.set(Tower.SCALE);
        baseSprite.anchor.set(0.5, 1);

        this.topY = baseSprite.y;
        this.topY -= baseSprite.texture.orig.height * baseSprite.scale.y;

        this.blocks.push(baseSprite);
        this.addChild(baseSprite);
        this.position.set(0, -265);
    }

    addBlock(blockSprite, globalPos, rotation) {
        const localPos = this.toLocal(globalPos);
        blockSprite.position.set(localPos.x, localPos.y);
        blockSprite.rotation = rotation;
        this.topY -= blockSprite.texture.orig.height * blockSprite.scale.y;
        this.addChild(blockSprite);
    }

    getLastBlockHeight() {
        return this.lastBlock ? this.lastBlock.height : 0;
    }

    getTopY() {
        return this.topY + 80;
    }

    getLastBlockX() {
        return this.lastBlock ? this.lastBlock.x : 0;
    }

    registerLandedBlock(blockSprite) {
        this.prevBlock = this.lastBlock;
        this.lastBlock = blockSprite;
        this.blocks.push(blockSprite);
    }

    cleanup() {
        this.blocks.forEach((block, i) => {
            const blockBounds = block.getBounds();
            const isBlockVisible = blockBounds.bottom > 0 && blockBounds.top < this.screen.height;
            if (!isBlockVisible) block.removeFromParent();
        });
        this.blocks = this.blocks.filter((block) => block.parent);
    }

    reset() {
        this.blocks.forEach((block) => {
            block.removeFromParent();
        });
        this.blocks = [];
        this.addBaseBlock();
        this.lastBlock = null;
    }

    show(parent) {
        this.removeFromParent();
        parent.addChild(this);
    }

    destroy() {
        super.destroy({ children: true, texture: false });
        this.blocks = [];
        this.topY = 0;
        this.lastBlock = null;
        this.prevBlock = null;
    }
}
