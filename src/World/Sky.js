import { Container, Sprite, Assets } from "pixi.js";

export class Sky extends Container {
    static TEXTURE = "sky";
    static PARALLAX_FACTOR = 0.3;

    constructor() {
        super();
        this.sprite = null;
        this.init();
    }

    async init() {
        const texture = Assets.get(Sky.TEXTURE);
        this.sprite = new Sprite(texture);
        this.addChild(this.sprite);

        this.sprite.anchor.set(0.5, 1);

        this.baseWidth = this.sprite.texture.width;
        this.baseHeight = this.sprite.texture.height;
    }

    resize(width, height) {
        const scaleByMinHeight = height / this.baseHeight;
        const scaleByWidth = width / this.baseWidth;

        const scale = Math.max(scaleByMinHeight, scaleByWidth);
        this.sprite.scale.set(scale);

        this.position.set(width / 2, 0);
        this.isAtTop = false;
    }

    destroy() {
        super.destroy({ children: true, texture: false });
        this.sprite = null;
    }
}
