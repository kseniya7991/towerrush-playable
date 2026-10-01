import { Container } from "pixi.js";
import { createSpineFromData } from "../utils/createSpineFromData";
import { SPINE_ASSETS } from "../assets";

export class DropSmoke extends Container {
    static TEXTURE = "trAllTexture";
    static MAGIC_HEIGHT = 270;
    static ANIMATION_ID = "drop_smoke";
    constructor() {
        super();
        this.visible = false;
        this.spine = null;
        this.init();
    }

    init() {
        this.spine = createSpineFromData(SPINE_ASSETS.dropSmoke, DropSmoke.TEXTURE);
        this.spine.skeleton.setSkinByName("default");
        this.spine.skeleton.setToSetupPose();
        this.spine.scale.set(1.5);

        this.spine.state.addListener({
            complete: (entry) => {
                if (entry.animation.name === DropSmoke.ANIMATION_ID) {
                    this.visible = false;
                }
            },
        });

        this.addChild(this.spine);
    }

    playSmoke(x, y) {
        if (!this.spine) return;
        //? Magic height fixed disposition of smoke
        this.position.set(x, y - DropSmoke.MAGIC_HEIGHT);
        this.visible = true;
        this.spine.state.setAnimation(0, DropSmoke.ANIMATION_ID, false);
    }

    destroy() {
        super.destroy({ children: true, texture: false });
        this.spine = null;
    }
}
