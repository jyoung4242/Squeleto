import { State, States } from "@peasy-lib/peasy-states";
import { UI, UIView } from "@peasy-lib/peasy-ui";
import { System } from "./system";

export class SceneManager extends States {}

export class Scene extends State {
  public view: UIView | undefined = undefined;
  public template: string = "";
  public stateData: any;
  public storyFlags = {};
  public setScene: any;
  public params: Array<any> = [];
  systems: Array<System> = [];

  public async enter(previous: State | null, ...params: any[]) {
    this.view = UI.create(document.body as HTMLElement, this, this.template);
    await this.view.attached;
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
