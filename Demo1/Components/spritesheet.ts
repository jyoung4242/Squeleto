/*****************************************************************************
 * Component: spritesheet
 * Parameters on entity:
 *  spritesheet: {
          data: [
            {
              src: Assets.image("shadow").src,
              offset: { x: 0, y: 0 },
              size: { x: 32, y: 32 },
              framesize: { x: 32, y: 32 },
            },
            {
              src: Assets.image("hero").src,
              offset: { x: 0, y: 0 },
              size: { x: 128, y: 128 },
              framesize: { x: 32, y: 32 },
              animation: heroAnimation,
            },
          ],
        },
 *
 * Description:
 * based on the parameters set on entity create method
 * let's the spritesheet property get attached to entity, which controls # of sprites
 * the order they're rendered
 * and attaches an animation sequence to any/all layers
 * 
 * example animation sequence: (coordinates are pixel positions of frame)
 * const heroAnimation = {
  frameRate: 8, --> how fast animation runs
  default: "idle-down",   --> default sequence to run on startup
  sequences: {  -->lookup list of different animation sequences in spritesheet
    "idle-right": [[0, 32]],
    "idle-left": [[0, 96]],
    "idle-up": [[0, 64]],
    "idle-down": [[0, 0]],
    "walk-right": [
      [0, 32],
      [32, 32],
      [64, 32],
      [96, 32],
    ],
    ...
  },
};
 ***************************************************************************** */

import { Vector } from "../../_Squeleto/Vector";
import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface ISpriteSheetComponent {
  data: SpriteSheetType;
}
export type SpriteSheetType = Array<{
  src: string;
  offset: Vector;
  size: Vector;
  animation: any;
  framePosition: Vector;
  animationTik?: number;
  currentFrameIndex: number;
  currentSequence: string;
}>;

// this is the exported interface that is used in systems modules
export interface SpriteSheetComponent {
  spritesheet: SpriteSheetType;
}

export class SpriteSheetComp extends Component {
  // UI template string literal with UI binding of value property
  public template = `
  <style>
    spritesheet-object{
          display: block;
          position: absolute;
          top:0;
          left:0;
          image-rendering: pixelated;
          background-repeat: no-repeat;
      }
  </style>
  <spritesheet-layer class="sprite-component">
      <spritesheet-object \${sprite<=*value} style="background-size: \${sprite.size.x}px \${sprite.size.y}px; background-position: -\${sprite.framePosition.x}px -\${sprite.framePosition.y}px;background-image: url(\${sprite.src}); width: \${sprite.framesize.x}px;height: \${sprite.framesize.y}px; transform: translate3d(\${sprite.offset.x}px, \${sprite.offset.y}px,0px);"></spritesheet-object>
  </spritesheet-layer>
  `;

  //setting default value
  public value: SpriteSheetType = [];
  public constructor() {
    //@ts-ignore
    super("spritesheet", SpriteSheetComp, true);
  }

  public define(data: ISpriteSheetComponent): void {
    if (data == null) {
      return;
    }
    this.value = data.data;
    this.value.forEach(sprite => {
      if (sprite.animation) {
        Object.assign(sprite, {
          framePosition: new Vector(0, 0),
          animationTik: 0,
          currentFrameIndex: 0,
          currentSequence: sprite.animation.default,
        });
      } else {
        Object.assign(sprite, {
          framePosition: new Vector(0, 0),
        });
      }
    });
  }
}
