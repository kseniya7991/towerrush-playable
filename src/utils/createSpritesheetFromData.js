import { Assets, Spritesheet } from "pixi.js";

export async function createSpritesheetFromData(json, textureAlias, cacheAlias) {
    const texture = Assets.get(textureAlias);

    if (!texture) {
        console.error(`Texture ${textureAlias} not found in cache`);
        return null;
    }

    const spritesheet = new Spritesheet(texture, json);
    await spritesheet.parse();
    Assets.cache.set(cacheAlias, spritesheet);

    return spritesheet;
}
