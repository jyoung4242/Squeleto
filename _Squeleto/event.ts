import { Entity } from "./entity";

export class GameEvent {
  eventStatus: "idle" | "running" | "complete";
  who: Entity | string | null = null;
  event: string = "event";

  constructor(who: Entity | string | null, params: [...any]) {
    this.who = who;
    this.eventStatus = "idle";
  }

  init(entities?: Entity[]): Promise<void> {
    return new Promise(resolve => {
      //do eventcode here
      resolve();
    });
  }

  reset() {
    this.eventStatus = "idle";
  }

  update() {}

  static create(who: Entity | null, params: [...any]): GameEvent {
    return new GameEvent(who, params);
  }
}
