import { State, States } from "@peasy-lib/peasy-states";
import { UI, UIView } from "@peasy-lib/peasy-ui";
import { System } from "./system";
import { Viewport } from "@peasy-lib/peasy-viewport";

export class SceneManager extends States {
  public static viewport: Viewport;
  constructor() {
    super();
  }
}

export class Scene extends State {
  public view: UIView | undefined = undefined;
  public template: string = "";
  public stateData: any;
  public storyFlags = {};
  public setScene: any;
  public params: Array<any> = [];
  systems: Array<System> = [];

  public async enter(previous: State | null, ...params: any[]) {
    let layers = SceneManager.viewport.layers;
    const game = layers.find(lyr => lyr.name == "game");
    if (game) this.view = UI.create(game.element as HTMLElement, this, this.template);
    if (this.view) await this.view.attached;
    this.setScene = params[1];
    this.params = [...params];
    this.init();
  }

  public init() {}
  public exit() {}
  public leave() {
    this.exit();
    this.view?.destroy();
  }

  public initialize() {}
}
