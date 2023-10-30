import { GameEvent } from "../../parkinglog/EventManager";
import { GameObject } from "../../parkinglog/GameObject";
import { ParticleSystem, EmitterConfig } from "../PlugIns/Particles";

/**
 * This is a event for the asynchronous console logging
 * this makes the call to console log for diagnostic purposes
 * this event resolves after the log, and is intended for usage
 * during development as to track cutscene execution
 */

export class particleEvent extends GameEvent {
  who: GameObject | undefined;
  ps: ParticleSystem;

  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(ps: ParticleSystem) {
    super("particle");
    this.who = undefined;
    this.ps = ps;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      console.log("init event: ", this.who, this.ps);

      this.ps.startEvent();
      resolve();
    });
  }
}
