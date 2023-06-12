import { GameObject, GameObjectConfig } from "../../_Squeleto/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";

export class Counter extends GameObject {
  constructor(assets: any, StoryFlags: StoryFlagManager) {
    let config: GameObjectConfig = {
      name: "Counter",
      startingMap: "kitchen",
      initX: 112,
      initY: 96,
      width: 32,
      height: 32,
      sprites: [new Sprite(assets.image("counter").src)],
      collisionBody: {
        width: 30,
        height: 24,
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
