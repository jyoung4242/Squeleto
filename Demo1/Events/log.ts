import { GameEvent } from "../../parkinglog/EventManager";
import { GameObject } from "../../parkinglog/GameObject";

/**
 * This is a event for the asynchronous console logging
 * this makes the call to console log for diagnostic purposes
 * this event resolves after the log, and is intended for usage
 * during development as to track cutscene execution
 */

export class LogEvent extends GameEvent {
  who: GameObject | undefined;
  message: string;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(message: string) {
    super("log");
    this.who = undefined;
    this.message = message;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      console.log(`${this.who.name} logged: ${this.message}`);
      resolve();
    });
  }
}
