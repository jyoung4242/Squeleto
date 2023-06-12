import { Scene } from "../../_Squeleto/SceneManager";
export class Game extends Scene {
  name: string = "BoilerPlate";
  public template = `
  <div class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
  <div style="position:absolute; top:50%; left: 50%; transform: translate(-50%,-50%); font-size: large;">Welcome to Squeleto</div>
  </div>`;
}
