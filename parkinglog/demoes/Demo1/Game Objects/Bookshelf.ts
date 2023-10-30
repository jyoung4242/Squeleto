import { GameObject, GameObjectConfig } from "../../parkinglog/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";
import { DialogManager } from "../PlugIns/DialogueManager";
import { bookcasePopup } from "../Dialogue/bookcasepopup";
import { DialogEvent } from "../Events/dialogue";
import { particleEvent } from "../Events/particleEvent";
import { ParticleSystem } from "../PlugIns/Particles";
import { Camera } from "../../parkinglog/Camera";
import { playSFX } from "../Events/sfx";
import { SFX } from "../../_Squeleto/Sound API";
import { WaitEvent } from "../Events/wait";

/**
 * Bookshelf GameObject
 * static Sprite is used
 * uses StoryFlags and the Dialogue Plug-in
 * 2 Interaction events depending on SF
 */

export class Bookshelf extends GameObject {
  dm;
  ps;
  cm;
  constructor(assets: any, StoryFlags: StoryFlagManager, dm: DialogManager, camera: Camera, ps: ParticleSystem) {
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
    this.cm = camera;
    this.SM = StoryFlags;
    this.ps = ps;

    // Sound Effect Registration
    SFX.register({ name: "spark", src: assets.audio("spark").src });

    this.interactionEvents = [
      {
        conditions: { metBookcase: false },
        content: [
          new playSFX("spark"),
          new particleEvent(ps),
          new WaitEvent(500),
          new DialogEvent(new bookcasePopup(this), this.dm, "Bookshelf", this.SM),
        ],
      },
      {
        conditions: { metBookcase: true },
        content: [
          new playSFX("spark"),
          new particleEvent(ps),
          new WaitEvent(500),
          new DialogEvent(new bookcasePopup(this), this.dm, "Bookshelf", this.SM),
        ],
      },
    ];
  }

  update(deltaTime: number): boolean {
    this.ps.moveSystem(Camera.xPos + this.xPos, Camera.yPos + this.yPos);
    this.ps.update(deltaTime, performance.now());
    return true;
  }
  physicsUpdate(): boolean {
    return true;
  }
}
