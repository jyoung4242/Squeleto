import { direction } from "../../parkinglog/CollisionManager";
import { GameEvent } from "../../parkinglog/EventManager";
import { GameObject } from "../../parkinglog/GameObject";
import { Signal } from "../../_Squeleto/Signals";

export class StandEvent extends GameEvent {
  who: GameObject | undefined;
  direction: direction;
  duration: number;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;
  signalStand: Signal | null;

  /**
   * This is a event for the asynchronous 'standing' of the player or NPC
   * this event engages a native 'startBehavior' method of the GameObject
   * and passes the 'stand' string as the behavior parameter, and a duration number (milliseconds)
   * this resolves from a Signal from the gameobject that the 'standCompleted'
   * has been completed
   */

  constructor(direction: direction, duration: number) {
    super("stand");
    this.who = undefined;
    this.direction = direction;
    this.duration = duration;
    this.signalStand = null;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      this.signalStand = new Signal("standCompleted", this.who);
      this.signalStand.listen(this.completeHandler);
      this.who.startBehavior("stand", this.direction, this.duration);
      this.resolution = resolve;
    });
  }

  completeHandler = (e: any) => {
    if (e.detail.who === this.who?.id) {
      if (this.signalStand) this.signalStand.stopListening();
      this.signalStand = null;
      if (this.resolution) this.resolution();
    }
  };
}
