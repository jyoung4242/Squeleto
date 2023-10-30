/*****************************************************************************
 * System: CameraFollow
 * Components Required: CameraFollowComponent, PositionComponent,SizeComponent
 * Signals: none
 *
 * Description:
 * on update this calculates the cameras position with respect to the entity
 * that is slated to be followed
 ******************************************************************************/

import { SceneManager } from "../../_Squeleto/Scene";
import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { CameraFollowComponent } from "../Components/cameraFollow";
import { PositionComponent } from "../Components/positionComponent";
import { SizeComponent } from "../Components/sizeComponent";

export type CameraFollowEntity = Entity & CameraFollowComponent & PositionComponent & SizeComponent;

export class CameraFollowSystem extends System {
  public constructor() {
    super("cameraFollow");
  }

  public processEntity(entity: CameraFollowEntity): boolean {
    return entity.camerafollow == true && entity.position != null && entity.size != null;
  }

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: CameraFollowEntity[]): void {
    entities.forEach(entity => {
      if (!this.processEntity(entity)) {
        return;
      }

      this.cameraLerp(entity);
    });
  }

  cameraLerp(entity: CameraFollowEntity) {
    let offsetX = 0;
    let offsetY = 0;
    SceneManager.viewport.camera.x = entity.position.x - offsetX + entity.size.x / 2;
    SceneManager.viewport.camera.y = entity.position.y - offsetY + entity.size.y / 2;
    SceneManager.viewport.update();
  }
}
