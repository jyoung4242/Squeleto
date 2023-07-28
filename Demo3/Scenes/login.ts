/*
DEFAULT LOGIN SCREEN FOR DEMO
applies a anchor tag in middle to start the game scene
*/

import { Scene } from "../../_Squeleto/SceneManager";
import { MultiPlayerInterface } from "../../_Squeleto/Multiplayer";

export class Login extends Scene {
  name: string = "Login";
  start = () => {
    this.setScene(1);
  };
  openGames = [];

  public template = `
  <style>
    .LoginGrid{
      display: grid;
      grid-template-columns: (10px, 1fr) 5fr (10px,1fr);
      grid-template-rows: (10px, 1fr) 5fr (10px,1fr);
    }
  </style>
  <div class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
    
    <div class="LoginGrid">
        <div class="Title">SQUELTO DEMO 3</div>
        <div class="openGames">
          <div class='opengame' \${opengame<=*openGames}></div>
        </div>
        <div class="createGame">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div class="JoinGame"></div>
    </div>
  
    
  </div>`;

  public init() {}
}
