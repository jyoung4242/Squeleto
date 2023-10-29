import { Entity } from "../../_Squeleto/entity";
import { GameEvent } from "../../_Squeleto/event";

export class MyEvent extends GameEvent {
  param1: any;
  param2: any;

  constructor(who: Entity | string | null, params: [...any]) {
    super(who, params);
    this.event = "myEvent";
    this.param1 = params[0];
    this.param2 = params[1];
  }

  static create(who: Entity | string | null, params: [...any]): MyEvent {
    return new MyEvent(who, params);
  }

  init(entities: Entity[]): Promise<void> {
    this.eventStatus = "running";
    return new Promise(resolve => {
      //do something here
      this.eventStatus = "complete";
      resolve();
    });
  }
}
