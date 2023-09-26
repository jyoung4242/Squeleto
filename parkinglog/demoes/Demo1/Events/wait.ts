import { GameEvent } from "../../parkinglog/EventManager";
import { GameObject } from "../../parkinglog/GameObject";

/**
 * This is a event for the asynchronous delay
 * this makes the call to setTimeout, and resolves afterwards
 * during development as put time delays between asynch actions
 */

export class WaitEvent extends GameEvent {
  who: GameObject | undefined;
  time: number;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(time: number) {
    super("log");
    this.who = undefined;
    this.time = time;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      setTimeout(() => {
        resolve();
      }, this.time);
    });
  }
}
