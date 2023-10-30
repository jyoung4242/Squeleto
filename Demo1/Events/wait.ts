import { Entity } from "../../_Squeleto/entity";
import { GameEvent } from "../Systems/Events";

/**
 * This is a event for the asynchronous delay
 * this makes the call to setTimeout, and resolves afterwards
 * during development as put time delays between asynch actions
 */

export class WaitEvent extends GameEvent {
  duration: number = 0;
  constructor(who: Entity | null, params: [...any]) {
    super(who, params);
    this.duration = params[0];
    this.event = "WaitEvent";
  }

  static create(who: Entity | null, params: [...any]): WaitEvent {
    return new WaitEvent(who, params);
  }

  public init(): Promise<void> {
    this.eventStatus = "running";
    return new Promise(resolve => {
      setTimeout(() => {
        this.eventStatus = "complete";
        resolve();
      }, this.duration);
    });
  }
}
