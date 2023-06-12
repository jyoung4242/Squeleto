import { direction } from "../../_Squeleto/CollisionManager";
import { GameEvent } from "../../_Squeleto/EventManager";
import { GameObject } from "../../_Squeleto/GameObject";

export class StandEvent extends GameEvent {
  who: GameObject | undefined;
  direction: direction;
  duration: number;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(direction: direction, duration: number) {
    super("stand");
    this.who = undefined;
    this.direction = direction;
    this.duration = duration;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      document.addEventListener("standCompleted", this.completeHandler);
      this.who = who;
      this.who.startBehavior("stand", this.direction, this.duration);
      this.resolution = resolve;
    });
  }

  completeHandler = (e: any) => {
    if (e.detail === this.who) {
      document.removeEventListener("standCompleted", this.completeHandler);
      if (this.resolution) this.resolution();
    }
  };
}
