import { Howl } from "howler";

class HowlManager {
  static sounds = new Map<string, Howl>();
  static currentTrack: any;

  static register(music: { name: string; src: string; gain?: number }) {
    let gain;
    if (music.gain != undefined) gain = music.gain;
    else gain = 1;
    HowlManager.sounds.set(music.name, new Howl({ src: music.src, volume: gain }));
    return HowlManager.sounds;
  }

  static play(music: string) {
    HowlManager.currentTrack = HowlManager.sounds.get(music);
    HowlManager.currentTrack.play();
  }

  static clear() {
    HowlManager.sounds.clear();
  }
}

export class BGM extends HowlManager {
  static play(music: string) {
    if ((HowlManager.currentTrack as Howl).playing() == true) {
      (HowlManager.currentTrack as Howl).fade(1.0, 0.0, 500);
    }
    HowlManager.currentTrack = HowlManager.sounds.get(music);
    HowlManager.currentTrack.play();
  }
}

export class SFX extends HowlManager {}
