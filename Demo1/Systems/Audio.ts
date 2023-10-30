/*****************************************************************************
 * System: Audio
 * Components Required: ??????????
 * Signals: none
 *
 * Description:
 * ?????
 ******************************************************************************/

import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { actionComponent } from "../Components/actions";

export type AudioEntity = Entity & actionComponent;

export class AudioSystem extends System {
  public constructor() {
    super("Audio");
  }

  public processEntity(entity: AudioEntity): boolean {
    // return the test to determine if the entity has the correct properties
    return entity.actions != null;
  }

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: AudioEntity[]): void {
    entities.forEach(entity => {
      // This is the screening for skipping entities that aren't impacted by this system
      // if you want to impact ALL entities, you can remove this
      if (!this.processEntity(entity)) {
        return;
      }

      if (entity.actions.current == "walk") {
      }
    });
  }
}
