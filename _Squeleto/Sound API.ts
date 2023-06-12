import { Howl } from "howler";

class HowlManager {
  static sounds = new Map<string, Howl>();

  static register(music: { name: string; src: string; gain?: number }) {
    let gain;
    if (music.gain != undefined) gain = music.gain;
    else gain = 1;
    HowlManager.sounds.set(music.name, new Howl({ src: music.src, volume: gain }));
    return HowlManager.sounds;
  }

  static play(music: string) {
    HowlManager.sounds.get(music)?.play();
  }

  static clear() {
    HowlManager.sounds.clear();
  }
}

export class BGM extends HowlManager {}
export class SFX extends HowlManager {}
