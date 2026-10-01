import city from "../public/background-front.webp?url";
import sky from "../public/background-back.webp?url";
import base from "../public/basis-tower.webp?url";
import globalJson from "../public/global.json";
import globalTexture from "../public/global.webp?url";

import trAllAtlas from "../public/tr_all.atlas?raw";
import trAllTexture from "../public/tr_all.webp?url";
import trDropSmokeJson from "../public/tr_drop_smoke.json";
import trResultSmokeJson from "../public/tr_result_smoke.json";

// AUDIO
import audioJson from "../public/sound.json";
import audioSrc from "../public/sounds.mp3?url";
import musicSrc from "../public/background.mp3?url";

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
