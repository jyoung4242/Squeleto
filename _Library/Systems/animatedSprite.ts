/*****************************************************************************
 * System: AnimatedSprite
 * Components Required: SpriteSheetComponent, KeyboardComponent
 * Signals: none
 *
 * Description:
 * each entity with Spritesheet component has an animation timer, and a
 * defined animation sequence configuration
 * this system increments the timer for each entity, and when limit hit,
 * changes the spritesheet position based on animation sequence, and restarts
 * animation timer
 ******************************************************************************/

import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { KeyboardComponent } from "../Components/keyboard";
import { SpriteSheetComponent } from "../Components/spritesheet";

export type animatedSpriteEntity = Entity & SpriteSheetComponent & KeyboardComponent;

export class AnimatedSpriteSystem extends System {
  template = ``;
  public constructor() {
    super("animatedsprite");
  }

  public processEntity(entity: animatedSpriteEntity): boolean {
    return entity.spritesheet != null;
  }

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: animatedSpriteEntity[]): void {
    entities.forEach(entity => {
      if (!this.processEntity(entity)) return;

      entity.spritesheet.forEach(spriteLayer => {
        if (!spriteLayer.animation || spriteLayer.animationTik == undefined) return;

        //get current sequence
        if (entity.keyboard) {
          spriteLayer.currentSequence = `${entity.keyboard.state}-${entity.keyboard.direction}`;
        }

        spriteLayer.animationTik++;
        if (spriteLayer.animationTik >= spriteLayer.animation.frameRate) {
          spriteLayer.animationTik = 0;
          spriteLayer.currentFrameIndex++;

          if (spriteLayer.currentFrameIndex >= spriteLayer.animation.sequences[spriteLayer.currentSequence].length) {
            //reset to beginning
            spriteLayer.currentFrameIndex = 0;
          }

          spriteLayer.framePosition.x = spriteLayer.animation.sequences[spriteLayer.currentSequence][spriteLayer.currentFrameIndex][0];
          spriteLayer.framePosition.y = spriteLayer.animation.sequences[spriteLayer.currentSequence][spriteLayer.currentFrameIndex][1];
        }
      });
    });
  }
}
