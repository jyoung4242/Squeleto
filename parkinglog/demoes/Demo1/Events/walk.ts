import { direction } from "../../parkinglog/CollisionManager";
import { GameEvent } from "../../parkinglog/EventManager";
import { GameObject } from "../../parkinglog/GameObject";
import { Signal } from "../../_Squeleto/Signals";

/**
 * This is a event for the asynchronous 'walking' of the player or NPC
 * this event engages a native 'startBehavior' method of the GameObject
 * and passes the 'walk' string as the behavior parameter, and a distance number (pixels)
 * this resolves from a Signal from the gameobject that the 'walkCompleted'
 * has been completed
 */

export class WalkEvent extends GameEvent {
  who: GameObject | undefined;
  direction: direction;
  distance: number;
  walkSignal: Signal | null;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(direction: direction, distance: number) {
    super("walk");
    this.who = undefined;
    this.direction = direction;
    this.distance = distance;
    this.walkSignal = null;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.walkSignal = new Signal("walkCompleted");
      this.walkSignal.listen(this.completeHandler);
      this.who = who;
      this.who.startBehavior("walk", this.direction, this.distance);
      this.resolution = resolve;
    });
  }

  completeHandler = (e: any) => {
    if (e.detail.who === this.who?.id) {
      if (this.walkSignal) this.walkSignal.stopListening;
      this.walkSignal = null;
      if (this.resolution) this.resolution();
    }
  };
}
