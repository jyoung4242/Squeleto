// Import all your Squeleto and Peasy Modules
import { Scene, SceneManager } from "../../_Squeleto/Scene";
import { Assets } from "@peasy-lib/peasy-assets";
import { Audio } from "@peasy-lib/peasy-audio";
import { Engine } from "@peasy-lib/peasy-engine";
import { Chiptune } from "../Systems/Chiptune";
import { State } from "@peasy-lib/peasy-states";
import { UI } from "@peasy-lib/peasy-ui";
import { Vector } from "../../_Squeleto/Vector";
import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { Signal } from "../../_Squeleto/Signals";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "../main";

// Next import your specific game content (Maps,etc...)
import { Kitchen } from "../Maps/kitchen";
import { OutsideMap } from "../Maps/outside";

// Import your entities
import { HeroEntity } from "../Entities/hero";
import { bookshelfEntity } from "../Entities/bookshelf";
import { CounterEntity } from "../Entities/counter";
import { NPCEntity } from "../Entities/npc2";
import { PlanterEntity } from "../Entities/planter";
import { PizzaSignEntity } from "../Entities/pizzasign";

// Finally Import your systems
import { CameraFollowSystem } from "../Systems/CameraFollow";
import { MovementSystem } from "../Systems/movement";
import { KeyboardSystem } from "../Systems/keyboard";
import { AnimatedSpriteSystem } from "../Systems/animatedSprite";
import { ColliderEntity, CollisionDetectionSystem } from "../Systems/collisionDetection";
import { RenderSystem } from "../Systems/Rendering";
import { EventSystem } from "../Systems/Events";
import { StoryFlagSystem } from "../Systems/StoryFlags";
import { interactionSystem } from "../Systems/Interactions";
import { Dialogue } from "../Systems/dialog";

// All Squeleto Scenes are an extension of the Scene Class
export class Game extends Scene {
  name: string = "Game";

  // **************************************
  // Loading Signals
  // **************************************
  pauseSignal: Signal = new Signal("pauseEngine");

  entities: Entity[] = [];
  Systems: System[] = [];

  public template = `
  <scene-layer class="scene" style="width: 100%; height: 100%; position: relative; top: 0; left:0; color: white;">
    < \${ System === } \${ System <=* Systems }>
  </scene-layer>`;

  bgm: Chiptune | undefined | null;

  public async enter(previous: State | null, ...params: any[]): Promise<void> {
    // **************************************
    // Loading Audio
    // **************************************
    Audio.initialize({ listener: { position: { x: SceneManager.viewport.half.x, y: SceneManager.viewport.half.y } } });

    // **************************************
    // Loading Assets
    // **************************************
    Assets.initialize({ src: "../src/Assets/" });
    await Assets.load([
      "lower.png",
      "DemoUpper.png",
      "hero.png",
      "shadow.png",
      "counter.png",
      "bookshelf.png",
      "npc2.png",
      "outsideUpper.png",
      "outsidemod.png",
      "planter.png",
      "pizzazone.png",
      "step.wav",
      "error.wav",
      "door.mp3",
      "spark.png",
      "spark.mp3",
      "npcAvatar.png",
      "heroAvatar.png",
      { name: "charge", src: "charge.wav" },
      { name: "walk", src: "walk.wav" },
    ]);

    // *************************************
    // Setup Viewport Layers
    // this uses the peasy-ui UI.create() method
    // *************************************

    SceneManager.viewport.addLayers([
      {
        name: "maplower",
        parallax: 0,
        image: Assets.image(Kitchen.lower).src,
        size: { x: 192, y: 192 },
        position: { x: 192 / 2, y: 192 / 2 },
      },
      { name: "game", parallax: 0, size: { x: 0, y: 0 } },
      {
        name: "mapupper",
        parallax: 0,
        image: Assets.image(Kitchen.upper).src,
        size: { x: 192, y: 192 },
        position: { x: 192 / 2, y: 192 / 2 },
      },

      {
        name: "dialog",
        size: { x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT },
      },
    ]);
    let layers = SceneManager.viewport.layers;

    const game = layers.find(lyr => lyr.name == "game");
    if (game) this.view = UI.create(game.element as HTMLElement, this, this.template);
    if (this.view) await this.view.attached;

    const dialog = layers.find(lyr => lyr.name == "dialog");
    if (dialog) UI.create(dialog.element, new Dialogue(), Dialogue.template);

    // **************************************
    // Load Entities
    // **************************************
    this.entities.push(bookshelfEntity.create(new Vector(48, 48)));
    this.entities.push(CounterEntity.create(new Vector(112, 96)));
    let hero = HeroEntity.create(new Vector(60, 60));
    this.entities.push(hero);
    this.entities.push(NPCEntity.create(new Vector(32, 96)));
    this.entities.push(PlanterEntity.create(new Vector(112, 128)));
    this.entities.push(PizzaSignEntity.create(new Vector(144, 156)));

    // **************************************
    // setup collision system defaults
    // **************************************
    const dc = new CollisionDetectionSystem([Kitchen, OutsideMap], "kitchen", false);
    dc.loadEntities(this.entities as ColliderEntity[]);

    // **************************************
    // Load Systems into systems array
    // **************************************
    this.Systems.push(
      new CameraFollowSystem(),
      dc,
      new MovementSystem(),
      new KeyboardSystem(),
      new AnimatedSpriteSystem(),
      new RenderSystem("kitchen"),
      new EventSystem(),
      new interactionSystem()
    );

    // **************************************
    // Load BGM
    // **************************************
    this.bgm = new Chiptune("0x090100700135583f70");
    this.bgm.attenuate(0.002); //.1 is max, 0 is mute

    // ***********************************************************
    // Define initial storyflags for quests and event conditions
    // ***********************************************************
    StoryFlagSystem.setStoryFlagValue("startOfGame", true);

    // **************************************
    // START your engines!
    // **************************************
    const engine = Engine.create({ started: true, fps: 60, callback: this.update });
    this.pauseSignal.listen(() => {
      console.log("pausing");
      engine.pause();
    });
  }

  update = (deltaTime: number) => {
    this.Systems.forEach(sys => sys.update(deltaTime, performance.now(), this.entities));
    Audio.update();
  };

  public exit() {}
}
