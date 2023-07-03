/*
DEFAULT LOGIN SCREEN FOR DEMO
applies a anchor tag in middle to start the game scene
*/

import { Scene } from "../../_Squeleto/SceneManager";

export class Login extends Scene {
  name: string = "Login";
  start = () => {
    this.setScene(1);
  };
  public template = `
  <div class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    <div style="position:absolute; top:50%; left: 50%; transform: translate(-50%,-50%); font-size: xx-large;">
      <a href="#" \${click@=>start}>Start Demo</a>
    </div>
  </div>`;

  public init() {}
}
