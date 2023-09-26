import { GameObject, GameObjectConfig } from "../../parkinglog/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";

/**
 * PizzaThingy GameObject
 * static Sprite is used
 * no SF or interactions
 * just an object to walk around
 */

export class PizzaThingy extends GameObject {
  constructor(assets: any, StoryFlags: StoryFlagManager) {
    let config: GameObjectConfig = {
      name: "pizzazone",
      startingMap: "outside",
      initX: 160,
      initY: 156,
      width: 28,
      height: 22,
      sprites: [new Sprite(assets.image("pizzazone").src)],
      collisionBody: {
        width: 26,
        height: 12,
        offsetX: 0,
        offsetY: 6,
        color: "cyan",
      },
    };
    super(config);
    this.SM = StoryFlags;
  }

  update(): boolean {
    return true;
  }
  physicsUpdate(): boolean {
    return true;
  }
}
