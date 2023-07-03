// import all Squeleto modules required
import { Scene } from "../../_Squeleto/SceneManager";
import { Chiptune } from "../../_Squeleto/Chiptune";
import { Signal } from "../../_Squeleto/Signals";
import { SFX } from "../../_Squeleto/Sound API";
import { GameRenderer, RenderState, RendererConfig } from "../../_Squeleto/Renderer";
import { Assets } from "@peasy-lib/peasy-assets";

//import game objects
import { Player } from "../Game Objects/Player";
import { Target } from "../Game Objects/Target";

//import maps, UI's, and any custom plugins
import { myMap } from "../Maps/myMap";
import { HUD } from "../UI/hud";

// all Squeleto Scenes extend the Scene Class
export class Game extends Scene {
  bgm: any; // this will be the background music Chiptune object
  timerrunning: Boolean = true; // flag for stopping the end of game timer
  targetSignal = new Signal("targethit"); // Signal system - this get's the message when a target is hit by bullet
  gameOverSignal = new Signal("gameover");
  renderer = GameRenderer; // Game renderer... required
  gameover: Boolean = false; // this is the boolean flag to signal the game's over
  renderState = RenderState; // this is the gameengine state values
  sm = undefined; // storyflag manager, not used in the demo 2

  // This is the HUD ui state, HUD.ts has bindings tied to this
  ui = {
    timer: 45,
    score: 0,
    showGameOver: false,
  };

  /**
   * plug-ins and UI elements are inserted after the renderer, in this case HUD.template
   * recommend NOT touching the scene-layer params
   */
  public template = `
  <scene-layer class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    ${this.renderer.template}
    ${HUD.template}
  </scene-layer>`;

  // Scenes have an init() method that is called when the scene is entered
  // This can be used for all Scene initializations
  public async init() {
    // Peasy-assets is used for Asset management, this caches
    // all images, audio files, and custom fonts for the game
    // Loading Assets
    Assets.initialize({ src: "../src/Assets/" });
    await Assets.load([
      "fire.wav",
      "hit.wav",
      "jump.wav",
      "land.wav",
      "mybgnd.png",
      "mytiles.png",
      "mm.png",
      "bullet.png",
      "gameover.mp3",
    ]);

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
    this.renderer.createMap([await myMap.create(Assets)]);
    this.renderer.changeMap("myMap");

    // Load Objects
    // This demo has three objects used at the start of the game
    // 2 targets and the player
    // Target has a special create method that allows it to parse the Aseprite file prior to loading
    // Otherwise, like player, you could just pass `new ObjectName()` to the objConfig
    const newTarget1 = await Target.targetCreate(this.renderState.camera.shake, 1, 30);
    const newTarget2 = await Target.targetCreate(this.renderState.camera.shake, -1, 500);
    let objConfig = [new Player(Assets, this.renderer.createObject, this.renderer.destroyObject), newTarget1, newTarget2];
    //@ts-ignore
    this.renderer.createObject(objConfig);

    // Import Chiptune
    // Chiptune is infite 8-bit playing module designed around
    // Autotracker project, attribution in the source and docs
    // You pass it some seed string and it will play continuously until
    // stopped
    this.bgm = new Chiptune("0x0001007000D94B7F0D");

    // SFX for the gameover tune
    // for SFX and BGM modules you need to register the asset in the library
    // prior to playing it
    SFX.register({ name: "gameover", src: Assets.audio("gameover").src });

    // Set Camera
    // this tells the camera to follow the player object, but...
    // it locks the y axis so it only follows the x axis of the player
    this.renderer.cameraFollow("Player", { lockY: true, lockYval: 45 });

    // START your engines!
    // this.renderer.showCollisionBodies(true);  // this is for diagnostics only, shows the collision bodies
    // the renderer.engineStart() method initiates the gameloop
    this.renderer.engineStart();

    // UI logic
    // this set's up the signal listener, so that when target.ts fires off the
    // signal that its been hit, game.ts can update the UI, which is
    // part of the ui state, and the HUD.ts will automaticaly display the updated
    // value
    this.targetSignal.listen((e: any) => {
      if (e.detail.who == "target" && !this.gameover) this.ui.score += 1;
    });

    // Game Timer
    // if game is active, this is the 1 second countdown timer
    // modifies the ui state timer value that's displayed
    // when it hits zero,
    // set's the gameover flag, and broadcasts the gameover signal
    // also turns off the chiptune music, plays the gameover tune
    // and disables the timer
    setInterval(() => {
      if (!this.timerrunning) return;
      if (!this.gameover) this.ui.timer -= 1;

      if (this.ui.timer == 0) {
        this.gameover = true;
        this.ui.showGameOver = true;
        this.gameOverSignal.send();
        this.bgm.mute();
        this.bgm = null;
        SFX.play("gameover");
        this.timerrunning = false;
      }
    }, 1000);
  }
  // all scenes have an exit method
  // this is the function that runs on transition to another scene
  // use is for any teardown code you need to run
  public exit() {}
}
