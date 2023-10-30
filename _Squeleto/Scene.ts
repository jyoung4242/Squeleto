import { State, States } from "@peasy-lib/peasy-states";
import { UI, UIView } from "@peasy-lib/peasy-ui";
import { System } from "./system";
import { Viewport } from "@peasy-lib/peasy-viewport";

export class SceneManager extends States {
  public static viewport: Viewport;
}

export class Scene extends State {
  public view: UIView | undefined = undefined;
  public template: string = "";
  public stateData: any;
  public storyFlags = {};
  public setScene: any;
  public params: Array<any> = [];
  systems: Array<System> = [];

  public async enter(previous: State | null, ...params: any[]) {}

  public leave() {
    this.view?.destroy();
    SceneManager.viewport.removeLayers();
  }

  public initialize() {}
}
