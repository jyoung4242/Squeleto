import { Scene } from "../../_Squeleto/SceneManager";
import { GameRenderer, RenderState, RendererConfig } from "../../_Squeleto/Renderer";
import { Assets } from "@peasy-lib/peasy-assets";
import { Kitchen } from "../Maps/kitchen";
import { Player } from "../Game Objects/Player";
import { Counter } from "../Game Objects/Counter";
import { Bookshelf } from "../Game Objects/Bookshelf";
import { NPC1 } from "../Game Objects/npc1";
import { OutsideMap } from "../Maps/outside";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";
import { DialogManager } from "../PlugIns/DialogueManager";
import { Planter } from "../Game Objects/planter";
import { PizzaThingy } from "../Game Objects/pizzathingy";

export class Game extends Scene {
  renderer = GameRenderer;

  //****************************************** */
  //dm name here is critical for peasy bindings
  //when using plugins, be very careful how you access them
  //****************************************** */
  dm = new DialogManager();

  renderState = RenderState;
  storyFlags = {
    someCondition: false,
    metBookcase: false,
    threat: false,
    meek: false,
    deaf: false,
    angry: false,
  };
  sm = new StoryFlagManager(this.storyFlags);

  /**
   * plug-ins are inserted after the renderer
   */
  public template = `<scene-layer class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    ${this.renderer.template}
    ${this.dm.template}
  </scene-layer>`;

  public async init() {
    //Loading Assets
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
    ]);

    //Initialize Renderer
    const renderConfig: RendererConfig = {
      state: this.renderState,
      storyFlags: this.sm,
      viewportDims: { width: 400, aspectratio: 3 / 2 },
      objectRenderOrder: 2,
      physicsFPS: 30,
      renderingFPS: 60,
    };
    this.renderer.initialize(renderConfig);

    //Load Maps
    this.renderer.createMap([new Kitchen(Assets), new OutsideMap(Assets)]);
    this.renderer.changeMap("kitchen");

    //Load Objects
    let objConfig = [
      new Player(Assets, this.sm, this.dm),
      new Counter(Assets, this.sm),
      new Bookshelf(Assets, this.sm, this.dm),
      new NPC1(Assets, this.sm, this.dm),
      new Planter(Assets, this.sm),
      new PizzaThingy(Assets, this.sm),
    ];
    this.renderer.createObject(objConfig);

    //Set Camera
    this.renderer.cameraFollow("Player");

    //START your engines!
    //this.renderer.showCollisionBodies(true);
    this.renderer.engineStart();
  }
  public exit() {}
}
