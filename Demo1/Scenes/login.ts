/*
DEFAULT LOGIN SCREEN FOR DEMO
applies a anchor tag in middle to start the game scene
*/

import { UI } from "@peasy-lib/peasy-ui";
import { Scene, SceneManager } from "../../_Squeleto/Scene";

export class Login extends Scene {
  name: string = "Login";
  start = () => {
    this.states.set("Game");
  };
  public template = `
  <scene-layer class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    <div style="position:absolute; top:50%; left: 50%; transform: translate(-50%,-50%); font-size: xx-large;">
      <a href="#" \${click@=>start}>Start Demo</a>
    </div>
  </scene-layer>`;
  public async enter(): Promise<void> {
    //Viewport Layer Control
    SceneManager.viewport.addLayers([{ name: "game", parallax: 0 }]);
    let layers = SceneManager.viewport.layers;
    const game = layers.find(lyr => lyr.name == "game");
    if (game) this.view = UI.create(game.element as HTMLElement, this, this.template);
    if (this.view) await this.view.attached;
  }
}
