import { State, States } from "@peasy-lib/peasy-states";
import { UI, UIView } from "@peasy-lib/peasy-ui";

export class SceneManager extends States {}

export class Scene extends State {
  public view: UIView | undefined = undefined;
  public template: string = "";
  public stateData: any;
  public storyFlags = {};
  public setScene: any;

  public enter(previous: State | null, ...params: any[]) {
    this.view = UI.create(document.querySelector("#Viewport") as HTMLElement, this, this.template);
    this.setScene = params[1];
    this.init();
  }

  public init() {}
  public exit() {}
  public leave() {
    this.exit();
    this.view?.destroy();
  }
}
