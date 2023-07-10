// Import all your Squeleto Modules
import { Scene } from "../../_Squeleto/SceneManager";
import { GameRenderer, RenderState, RendererConfig } from "../../_Squeleto/Renderer";
import { Assets } from "@peasy-lib/peasy-assets";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";
import { Chiptune } from "../../_Squeleto/Chiptune";
import { ParticleSystem } from "../PlugIns/Particles";

// Next import your specific game content (Objects, Maps,etc...)
import { Kitchen } from "../Maps/kitchen";
import { OutsideMap } from "../Maps/outside";

import { Player } from "../Game Objects/Player";
import { Counter } from "../Game Objects/Counter";
import { Bookshelf } from "../Game Objects/Bookshelf";
import { NPC1 } from "../Game Objects/npc1";
import { Planter } from "../Game Objects/planter";
import { PizzaThingy } from "../Game Objects/pizzathingy";
import { bookCaseParticleSystem } from "../Particles/bookcaseParticles";

// Finally Import your custom plug-ins
import { DialogManager } from "../PlugIns/DialogueManager";

// All Squeleto Scenes are an extension of the Scene Class
export class Game extends Scene {
  // The one thing that separates a normal scene from a game
  // scene is using the Squeleto renderer
  // The brings in your camera, ECS, and gameloop
  renderer = GameRenderer;
  renderState = RenderState;

  //****************************************** */
  // dm name here is critical for peasy bindings, cause they have to match what's in the plugin
  // when using plugins, be very careful how you access them
  //****************************************** */
  dm = new DialogManager();

  psystems = new bookCaseParticleSystem(Assets);

  // StoryFlag system uses a default set of conditions that gets passed around
  // If larger, this can be brought in from its own module
  storyFlags = {
    someCondition: false,
    metBookcase: false,
    threat: false,
    meek: false,
    deaf: false,
    angry: false,
    bathroom: false,
  };
  sm = new StoryFlagManager(this.storyFlags);

  /****************************************************
   * plug-ins are inserted after the renderer to ensure
   * they render on top of the game
   ****************************************************/
  public template = `<scene-layer class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    ${this.renderer.template}
    ${this.dm.template}
    ${this.psystems.template}

  </scene-layer>`;

  bgm: Chiptune | undefined | null;

  public async init() {
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
    ]);

    // **************************************
    // Initialize Renderer
    // **************************************
    const renderConfig: RendererConfig = {
      state: this.renderState,
      storyFlags: this.sm,
      viewportDims: { width: 400, aspectratio: 3 / 2 },
      objectRenderOrder: 2,
      physicsFPS: 30,
      renderingFPS: 60,
    };
    this.renderer.initialize(renderConfig);

    // **************************************
    // Load Maps
    // **************************************
    this.renderer.createMap([new Kitchen(Assets, this.dm, this.storyFlags), new OutsideMap(Assets)]);
    this.renderer.changeMap("kitchen");

    // **************************************
    // Load Objects
    // **************************************
    let objConfig = [
      new Player(Assets, this.sm, this.dm),
      new Counter(Assets, this.sm),
      new Bookshelf(Assets, this.sm, this.dm, this.renderState.camera, this.psystems),
      new NPC1(Assets, this.sm, this.dm),
      new Planter(Assets, this.sm),
      new PizzaThingy(Assets, this.sm),
    ];
    this.renderer.createObject(objConfig);

    // **************************************
    // Set Camera
    // **************************************
    this.renderer.cameraFollow("Player");

    // Turn on BGM
    this.bgm = new Chiptune("0x090100700135583f70");

    // **************************************
    // START your engines!
    // this.renderer.showCollisionBodies(true);
    // **************************************
    this.renderer.engineStart();
  }
  public exit() {}
}
