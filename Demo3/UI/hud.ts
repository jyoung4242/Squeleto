/**
 * Very simple HUD display that is used in the demo
 * 2 parts to this file
 * the styling and the custom html elements in the template
 *
 * the static template is what is used in the scene file after the
 * renderer template to ensure it is overlayed on top of the game
 */

/**
 * this uses peasy-ui for ui binding
 * so the binding templates are here and tied to the 
 * ui property of the scene state:
 * <hud-display>
    <score-display>\${ui.score}</score-display> // ui.score is changed in game.ts (scene) when target hit
    <time-remaining>\${ui.timer}</time-remaining> //ui.timer is changed in game.ts in the game timer
    <sub-title>SQUELETO DEMO No. 2</sub-title>  //general text
    <game-over \${===ui.showGameOver}>GAME OVER</game-over> // this is the GAME OVER indicator, and is bound 
    // with a boolean rendering flag, when ui.showGameOver is false, this isn't rendered
   </hud-display>
 */

export class HUD {
  static template = `
  <style>
  hud-display{
    position: fixed;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
  }
  score-display{
    position: fixed;
    top:5px;
    left:5px;
    width: 25px;
    height: 10px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    font-size: large;
    text-align: center
  }
  time-remaining{
    position: fixed;
    top:5px;
    left:50%;
    transform: translateX(-50%);
    width: 75px;
    height: 10px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    font-size: xx-large;
    text-align: center;
  }
  sub-title{
    position: fixed;
    bottom:10px;
    left:50%;
    transform: translateX(-50%);
    width: 100%;
    height: 10px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    font-size: x-small;
    text-align: center;
  }
  game-over{
    position: fixed;
    top:50%;
    left:50%;
    transform: translate(-50%,-50%);
    width: auto;
    height:auto;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    font-size: xx-large;
    color: red;
  }
  </style>
  <hud-display>
    <score-display>\${ui.score}</score-display>
    <time-remaining>\${ui.timer}</time-remaining>
    <sub-title>SQUELETO DEMO No. 2</sub-title>
    <game-over \${===ui.showGameOver}>GAME OVER</game-over>
  </hud-display>
  `;
}
