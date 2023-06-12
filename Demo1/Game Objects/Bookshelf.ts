import { GameObject, GameObjectConfig } from "../../_Squeleto/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";
import { DialogManager } from "../PlugIns/DialogueManager";
import { bookcasePopup } from "../Dialogue/bookcasepopup";
import { DialogEvent } from "../Events/dialogue";

export class Bookshelf extends GameObject {
  dm;
  constructor(assets: any, StoryFlags: StoryFlagManager, dm: DialogManager) {
    let config: GameObjectConfig = {
      name: "Bookshelf",
      startingMap: "kitchen",
      initX: 48,
      initY: 48,
      width: 32,
      height: 26,
      sprites: [new Sprite(assets.image("bookshelf").src)],
      collisionBody: {
        width: 30,
        height: 10,
        offsetX: 0,
        offsetY: 16,
        color: "cyan",
      },
    };
    super(config);
    this.dm = dm;
    this.SM = StoryFlags;
    this.interactionEvents = [
      { conditions: { metBookcase: false }, content: [new DialogEvent(new bookcasePopup(this), this.dm, this.SM)] },
      { conditions: { metBookcase: true }, content: [new DialogEvent(new bookcasePopup(this), this.dm, this.SM)] },
    ];
  }

  update(): boolean {
    return true;
  }
  physicsUpdate(): boolean {
    return true;
  }
}
