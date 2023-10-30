import { SceneManager } from "./SceneManager";

export class Viewport {
  static template: string = `
  <style>
      :root {
        --pixel-size: 2.5;
        --aspectRatio: 3/2;
        --vpWidth: 400px;
        --vpColor: black;
        --bRadius: 5px;
        --bThickness: 3px;
        --bColor: white;
        --bodyColor: rgb(23, 23, 23);
      }

      @media (max-width: 1100px) {
        :root {
          --pixel-size: 1.5;
        }
      }

      @media (max-width: 675px) {
        :root {
          --pixel-size: 0.75;
        }
      }
      body {
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        background-color: var(--bodyColor,rgb(23, 23, 23));
      }
      .scene{
        position: absolute;
        top: 0;
        left:0;
        width: 100%;
        height: 100%;
      }
      .Transition{
          position: absolute;
          z-index: 99999;
          width: 100%;
          height: 100%;
          background-color: transparent;
          transition: background-color 0.25s;
          pointer-events: none;
      }
      .hide_transition{
          background-color: white;
      }
      #Viewport {
        position: var(--position, relative);
        top:50%;
        left:50%;
        transform: translate(-50%,-50%) scale(var(--pixel-size));
        width: var(--vpWidth, 400px);
        aspect-ratio: var(--aspectRatio, 3/2);
        background-color: black;
        border-style: solid;
        border-color: var(--bColor, white);
        border-width: var(--bThickness, 3px);
        border-radius: var(--bRadius, 5px);
        overflow: hidden;
      }

  </style>
  <div id="Viewport" style="--aspectRatio: \${viewport.aspectRatio}; --vpWidth: \${viewport.width}px;" >
      <div class="Transition \${transitionManager.stylestring}"></div>
  </div>`;
  static state: any;

  constructor(state: any, scenes: any, width?: number, aspectRatio?: string) {}

  static initialize(state: any, scenes: any, width?: number, aspectRatio?: string) {
    Viewport.state = state;
    Viewport.state.sceneManager = new SceneManager();
    Viewport.state.sceneManager.scenes = [...scenes];
    Viewport.state.sceneManager.register(...scenes);
  }

  static setScene = (sceneIndex: number) => {
    Viewport.state.sceneManager.currentScene = Viewport.state.sceneManager.scenes[sceneIndex];
    Viewport.state.sceneManager.set(this.state.sceneManager.currentScene, null, Viewport.state, Viewport.setScene);
  };
}
