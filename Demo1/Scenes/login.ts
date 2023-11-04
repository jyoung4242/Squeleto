/*
DEFAULT LOGIN SCREEN FOR DEMO
applies a anchor tag in middle to start the game scene
*/

import { UI } from "@peasy-lib/peasy-ui";
import { Scene, SceneManager } from "../../_Squeleto/Scene";

export class Login extends Scene {
  public name: string = "Login";
  layers: any;
  layer: any;
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
    let start = performance.now();

    //Viewport Layer Control
    SceneManager.viewport.addLayers([{ name: "login", parallax: 0 }]);
    this.layers = SceneManager.viewport.layers;
    this.layer = this.layers.find((lyr: any) => lyr.name == "login");
    if (this.layer) this.view = UI.create(this.layer.element as HTMLElement, this, this.template);
    //if (this.view) await this.view.attached;
  }

  public exit() {
    SceneManager.viewport.removeLayers(this.layer);
  }
}
