import { Howl, Howler } from "howler";
const GAME_SOUND_CONTROL_SELECTOR = ".js-game__sound-control";
const DISABLED_CLASS = "disabled";
const STORAGE_MUTE_KEY = "game_sound_is_muted";
export class AudioManager {
    constructor(audioData) {
        this.audioData = audioData || null;
        this.isMusicStarted = false;

        this.sounds = null;
        this.musicId = null;

        const storedMute = localStorage.getItem(STORAGE_MUTE_KEY);
        this.isMuted = storedMute !== null ? storedMute === "true" : true;

        this.activeSounds = {};

        this.controller = document.querySelector(GAME_SOUND_CONTROL_SELECTOR);

        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    async init() {
        if (!this.audioData) {
            console.error("No audio data provided!");
            return false;
        }

        const loadPromises = [];

        if (this.audioData.sounds) {
            const soundsPromise = new Promise((resolve) => {
                this.sounds = new Howl({
                    src: [this.audioData.sounds.src],
                    sprite: this.audioData.sounds.json.sprite,
                    volume: 0.8,
                    preload: true,
                    format: ["mp3"],
                    onload: () => resolve(true),
                    onloaderror: () => resolve(false),
                });
            });
            loadPromises.push(soundsPromise);
        }

        if (this.audioData.music) {
            const musicPromise = new Promise((resolve) => {
                this.music = new Howl({
                    src: [this.audioData.music.src],
                    loop: true,
                    volume: 0.5,
                    preload: true,
                    format: ["mp3"],
                    html5: true,
                    onload: () => resolve(true),
                    onloaderror: () => {
                        console.error("Music Load Error:", err);
                        resolve(false);
                    },
                });
            });
            loadPromises.push(musicPromise);
        }

        const results = await Promise.all(loadPromises);
        this.setupListeners();
        return results.every((res) => res === true);
    }

    setupListeners() {
        if (this.isMuted) {
            this.mute(true);
            this.controller.classList.add(DISABLED_CLASS);
        } else {
            this.mute(false);
            this.controller.classList.remove(DISABLED_CLASS);
        }

        document.addEventListener("visibilitychange", this.handleVisibilityChange);

        this.controller?.addEventListener("click", () => {
            this.toggleMute();
        });

        window.addEventListener("click", this.handleWindowClick, { once: true });
    }

    handleWindowClick = () => {
        if (!this.isMuted) {
            if (!this.isMusicStarted) this.startMusic();
        }
    };

    startMusic() {
        if (this.music && !this.isMusicStarted) {
            if (!this.isMuted) {
                Howler.mute(false);
                this.music.play();
                this.isMusicStarted = true;
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAllGlobally();
        } else {
            this.resumeAllGlobally();
        }
    }

    pauseAllGlobally() {
        Howler.mute(true);
    }

    resumeAllGlobally() {
        if (!this.isMuted) {
            Howler.mute(false);
        }
    }

    playSoundWithId(name, options = {}) {
        if (!this.sounds || (this.isMuted && !options.ignoreMute)) return null;

        const id = this.sounds.play(name);

        if (options.volume !== undefined) {
            this.sounds.volume(options.volume, id);
        }

        if (options.loop !== undefined) {
            this.sounds.loop(options.loop, id);
        }

        if (options.rate !== undefined) {
            this.sounds.rate(options.rate, id);
        }

        this.activeSounds[name] = id;

        this.sounds.once(
            "end",
            () => {
                if (this.activeSounds[name] === id) {
                    delete this.activeSounds[name];
                }
            },
            id,
        );

        return id;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem(STORAGE_MUTE_KEY, this.isMuted);

        if (this.isMuted) {
            this.mute(true);
            this.controller.classList.add(DISABLED_CLASS);
        } else {
            this.mute(false);
            this.controller.classList.remove(DISABLED_CLASS);
            if (!this.isMusicStarted) this.startMusic();
        }

        return this.isMuted;
    }

    stopSoundByName(name) {
        const id = this.activeSounds[name];
        if (id !== undefined) {
            this.sounds.stop(id);
            delete this.activeSounds[name];
        }
    }

    stopAllSounds() {
        if (this.sounds) {
            this.sounds.stop();
        }
        this.activeSounds = {};
    }

    mute(value) {
        this.isMuted = value;
        Howler.mute(value);
    }

    destroy() {
        window.removeEventListener("click", this.handleWindowClick);
        document.removeEventListener("visibilitychange", this.handleVisibilityChange);
        this.stopAllSounds();
        if (this.sounds) {
            this.sounds.unload();
        }
    }
}
