import { GameEvent } from "../../parkinglog/EventManager";
import { GameObject } from "../../parkinglog/GameObject";
import { SFX } from "../../_Squeleto/Sound API";

/**
 * This is a event for the asynchronous playing of a sound effect(SFX)
 * this makes the call to the SFX module to play a string passed in with the event
 * this event resolves after the sound is played, but doesn't wait
 */

export class playSFX extends GameEvent {
  who: GameObject | undefined;
  sound: string;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(sound: string) {
    super("playSFX");
    this.who = undefined;
    this.sound = sound;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      console.log(this.who, this.sound);

      SFX.play(this.sound);
      resolve();
    });
  }
}
