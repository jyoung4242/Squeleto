import { Entity } from "../../_Squeleto/entity";
import { GameEvent } from "../Systems/Events";
import chalk from "chalk";

/**
 * This is a event for the asynchronous console logging
 * this makes the call to console log for diagnostic purposes
 * this event resolves after the log, and is intended for usage
 * during development as to track cutscene execution
 */

export class LogEvent extends GameEvent {
  message: string = "";
  color: string = "#FFFFFF";

  constructor(who: Entity | string | null, params: [...any]) {
    super(who, params);
    this.event = "LogEvent";
    this.message = params[0];
    this.color = params[1];
  }

  static create(who: Entity | string | null, params: [...any]): LogEvent {
    return new LogEvent(who, params);
  }

  init(entities: Entity[]): Promise<void> {
    this.eventStatus = "running";
    return new Promise(resolve => {
      let msgTemplate = chalk.hex(this.color);
      if (!this.who) console.log(msgTemplate(`logged: ${this.message}`));
      else console.log(msgTemplate(`${this.who} logged: ${this.message}`));
      this.eventStatus = "complete";
      resolve();
    });
  }
}
