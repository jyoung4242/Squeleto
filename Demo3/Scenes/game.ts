// import all Squeleto modules required
import { Scene } from "../../_Squeleto/SceneManager";
import { GameRenderer, RenderState, RendererConfig } from "../../_Squeleto/Renderer";
import { Assets } from "@peasy-lib/peasy-assets";

// all Squeleto Scenes extend the Scene Class
export class Game extends Scene {
  renderer = GameRenderer; // Game renderer... required
  renderState = RenderState; // this is the gameengine state values
  sm = undefined; // storyflag manager, not used in the demo 2

  /**
   * plug-ins and UI elements are inserted after the renderer, in this case HUD.template
   * recommend NOT touching the scene-layer params
   */
  public template = `
  <scene-layer class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    ${this.renderer.template}
  </scene-layer>`;

  // Scenes have an init() method that is called when the scene is entered
  // This can be used for all Scene initializations
  public async init() {
    // Peasy-assets is used for Asset management, this caches
    // all images, audio files, and custom fonts for the game
    // Loading Assets
    Assets.initialize({ src: "../src/Assets/" });
    await Assets.load([]);

    // Initialize Renderer
    const renderConfig: RendererConfig = {
      state: this.renderState,
      storyFlags: this.sm,
      viewportDims: { width: 500, aspectratio: 3 / 2 },
      objectRenderOrder: 2,
      physicsFPS: 30,
      renderingFPS: 60,
    };
    this.renderer.initialize(renderConfig);

    // Load Maps
    // myMap is a map object from myMap.ts under the Maps folder
    // changeMap is called to set the default map

    /*this.renderer.createMap([await myMap.create(Assets)]);
    this.renderer.changeMap("myMap");*/

    // Load Objects
    // This demo has three objects used at the start of the game
    // 2 targets and the player
    // Target has a special create method that allows it to parse the Aseprite file prior to loading
    // Otherwise, like player, you could just pass `new ObjectName()` to the objConfig

    /*
    let objConfig = [new Player(Assets, this.renderer.createObject, this.renderer.destroyObject), newTarget1, newTarget2];
    //@ts-ignore
    this.renderer.createObject(objConfig);*/

    // Set Camera
    // this tells the camera to follow the player object, but...
    // it locks the y axis so it only follows the x axis of the player

    //this.renderer.cameraFollow("Player", { lockY: true, lockYval: 45 });

    // START your engines!
    // this.renderer.showCollisionBodies(true);  // this is for diagnostics only, shows the collision bodies
    // the renderer.engineStart() method initiates the gameloop
    this.renderer.engineStart();
  }
  // all scenes have an exit method
  // this is the function that runs on transition to another scene
  // use is for any teardown code you need to run
  public exit() {}
}
