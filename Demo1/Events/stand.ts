/*****************************************************************************
 * Event: Stand
 * Components Required: VelocityComponent,SpriteSheetComponent,PositionComponent
 *
 * Signals: none
 *
 * Parameters:
 * [0]- <string> - this.direction - string designating which direction to walk
 * [1]- <number> - this.duration - number that dictates how long to wait
 *
 * Description:
 * based on the parameters passed on the creation of Event, allows the entity to
 * face a direction for a period of time and then resolves after said duration
 ******************************************************************************/

import { GameEvent } from "../Systems/Events";
import { Entity } from "../../_Squeleto/entity";
import { direction } from "./walk";

export class StandEvent extends GameEvent {
  direction: direction;
  duration: number;

  constructor(who: Entity | null, params: [...any]) {
    super(who, params);
    this.direction = params[0];
    this.duration = params[1];
  }

  init(): Promise<void> {
    this.eventStatus = "running";
    return new Promise(resolve => {
      //@ts-ignore
      if (this.who && Object.hasOwn(this.who, "spritesheet")) {
        //@ts-ignore
        this.who.spritesheet[1].currentSequence = `idle-${this.direction}`;
      }

      setTimeout(() => {
        this.eventStatus = "complete";
        resolve();
      }, this.duration);
    });
  }
}
