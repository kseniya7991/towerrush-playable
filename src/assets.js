import city from "./assets/background-front.webp?url";
import sky from "./assets/background-back.webp?url";
import base from "./assets/basis-tower.webp?url";
import globalJson from "./assets/global.json";
import globalTexture from "./assets/global.webp?url";

import trAllAtlas from "./assets/tr_all.atlas?raw";
import trAllTexture from "./assets/tr_all.webp?url";
import trDropSmokeJson from "./assets/tr_drop_smoke.json";
import trResultSmokeJson from "./assets/tr_result_smoke.json";

// AUDIO
import audioJson from "./assets/sound.json";
import audioSrc from "./assets/sounds.mp3?url";
import musicSrc from "./assets/background.mp3?url";

export const STATIC_ASSETS = [
    { alias: "city", src: city },
    { alias: "sky", src: sky },
    { alias: "base", src: base },
];

export const SPRITE_ASSETS = {
    global: {
        json: globalJson,
        texture: globalTexture,
    },
};
export const SPINE_ASSETS = {
    trAll: {
        texture: trAllTexture,
    },
    dropSmoke: {
        json: trDropSmokeJson,
        atlas: trAllAtlas,
    },
    resultSmoke: {
        json: trResultSmokeJson,
        atlas: trAllAtlas,
    },
};

export const AUDIO_DATA = {
    sounds: {
        json: audioJson,
        src: audioSrc,
    },
    music: {
        src: musicSrc,
    },
};
