/*****************************************************************************
 * Component: sprite
 * Parameters on entity:
 *  sprites: {
          data: [{ src: Assets.image(<'image name'>).src, offset: { x: 0, y: 0 }, size: { x: 32, y: 32 } }],
        },
 *
 * Description:
 * based on the parameters set on entity create method
 * this property renders a sprite-object layer onto the entity for a static image
 ***************************************************************************** */

import { Vector } from "@peasy-lib/peasy-viewport";
import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface ISpriteComponent {
  data: SpriteType;
}
export type SpriteType = Array<{
  src: string;
  offset: Vector;
  size: Vector;
}>;

// this is the exported interface that is used in systems modules
export interface SpriteComponent {
  sprites: SpriteType;
}

export class SpriteComp extends Component {
  // UI template string literal with UI binding of value property
  public template = `
    <style>
        sprite-object{
            display: block;
            position: absolute;
            top:0;
            left:0;
            image-rendering: pixelated;
        }
    </style>
    <sprites-layer class="sprite-component">
        <sprite-object \${sprite<=*value} style="background-image: url(\${sprite.src}); width: \${sprite.size.x}px;height: \${sprite.size.y}px; transform: translate3d(\${sprite.offset.x}px, \${sprite.offset.y}px,0px);"></sprite-object>
    </sprites-layer>
    `;

  //setting default value
  public value: SpriteType = [];
  public constructor() {
    //@ts-ignore
    super("sprites", SpriteComp, true);
  }

  public define(data: ISpriteComponent): void {
    if (data == null) {
      return;
    }
    this.value = data.data;
  }
}
