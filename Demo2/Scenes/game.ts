import { Scene } from "../../_Squeleto/SceneManager";
import { GameRenderer, RenderState, RendererConfig } from "../../_Squeleto/Renderer";
import { Assets } from "@peasy-lib/peasy-assets";
import { Player } from "../Game Objects/Player";
import { myMap } from "../Maps/myMap";

export class Game extends Scene {
  renderer = GameRenderer;
  renderState = RenderState;
  sm = undefined;
  /**
   * plug-ins are inserted after the renderer
   */
  public template = `<scene-layer class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    ${this.renderer.template}
  </scene-layer>`;

  public async init() {
    //Loading Assets
    Assets.initialize({ src: "../src/Assets/" });
    await Assets.load(["damage.wav", "fire.wav", "hit.wav", "jump.wav", "land.wav", "mybgnd.png", "mytiles.png", "mm.png"]);

    //Initialize Renderer
    const renderConfig: RendererConfig = {
      state: this.renderState,
      storyFlags: this.sm,
      viewportDims: { width: 500, aspectratio: 3 / 2 },
      objectRenderOrder: 2,
      physicsFPS: 30,
      renderingFPS: 60,
    };
    this.renderer.initialize(renderConfig);

    //Load Maps
    this.renderer.createMap([await myMap.create(Assets)]);
    this.renderer.changeMap("myMap");

    //Load Objects
    let objConfig = [new Player(Assets)];
    this.renderer.createObject(objConfig);

    //Set Camera
    this.renderer.cameraFollow("Player");

    //START your engines!
    //this.renderer.showCollisionBodies(true);
    this.renderer.engineStart();
  }
  public exit() {}
}
