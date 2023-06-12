export class StateManagement {
  viewport = {
    width: 400,
    aspectRatio: "3/2",
    borderThickness: "3px",
    borderColor: "white",
    borderRadius: "5px",
  };
  sceneManager = { currentScene: "Login", Scenes: [] };
  transitionManager = {
    stylestring: "",
    get cssString() {
      return this.stylestring;
    },
  };

  public setTransition = (toggleswitch: boolean): Promise<void> => {
    return new Promise((res, rej) => {
      if (toggleswitch == true) this.transitionManager.stylestring = "hide_transition";
      else this.transitionManager.stylestring = "";
      setTimeout(() => {
        res();
      }, 250);
    });
  };

  constructor() {}
}
