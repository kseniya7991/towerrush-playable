import { Container, Sprite, Assets } from "pixi.js";

export class City extends Container {
    static TEXTURE = "city";

    constructor() {
        super();
        this.init();
    }

    async init() {
        const texture = Assets.get(City.TEXTURE);
        this.sprite = new Sprite(texture);

        this.addChild(this.sprite);

        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(1.01);

        this.baseWidth = this.sprite.texture.width;
        this.baseHeight = this.sprite.texture.height;
    }

    getCityScale(width, height) {
        const scaleByMinHeight = 500 / this.baseHeight;
        const scaleByWidth = width / this.baseWidth;
        const scale = Math.max(scaleByMinHeight, scaleByWidth);
        return scale;
    }

    hide() {
        if (!this.parent) return;
        this.removeFromParent();
    }

    show(parent) {
        if (this.parent) return;
        parent.addChild(this);
    }

    destroy() {
        super.destroy({ children: true, texture: false });
        this.sprite = null;
    }
}
