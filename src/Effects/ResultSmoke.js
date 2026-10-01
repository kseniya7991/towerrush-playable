import { Container } from "pixi.js";
import { createSpineFromData } from "../utils/createSpineFromData";
import { SPINE_ASSETS } from "../assets";

export class ResultSmoke extends Container {
    static TEXTURE = "trAllTexture";
    static MAGIC_HEIGHT = 270;
    static ANIMATION_ID = "result_smoke";
    constructor(screen) {
        super();
        this.screen = screen;
        this.visible = false;
        this.spine = null;
        this.init();
    }

    async init() {
        this.spine = createSpineFromData(SPINE_ASSETS.resultSmoke, ResultSmoke.TEXTURE);
        this.spine.skeleton.setSkinByName("default");
        this.spine.skeleton.setToSetupPose();
        this.spine.scale.set(1);

        this.spine.state.addListener({
            complete: (entry) => {
                if (entry.animation.name === ResultSmoke.ANIMATION_ID) {
                    this.visible = false;
                }
            },
        });

        this.addChild(this.spine);
    }

    playSmoke() {
        this.position.set(this.screen.width / 2, -this.screen.height * 0.7);
        this.visible = true;
        this.spine.state.setAnimation(0, ResultSmoke.ANIMATION_ID, false);
    }

    destroy() {
        super.destroy({ children: true, texture: false });
        this.spine = null;
    }
}
