import { UIView } from "@peasy-lib/peasy-ui";
import { GameEvent } from "../../_Squeleto/EventManager"; //"../../src/components/EventManager";
import { GameObject } from "../../_Squeleto/GameObject"; //../../src/components/GameObject";
import { Conversation, DialogManager } from "../PlugIns/DialogueManager";

export class DialogEvent extends GameEvent {
  who: GameObject | undefined;
  message: Conversation;
  dm: any;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(message: Conversation, dm: DialogManager, sf: any) {
    super("dialog");
    this.who = undefined;
    this.message = message;
    this.dm = dm;
    (this.dm as DialogManager).configureStoryFlags(sf);
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      document.addEventListener("dialogComplete", this.completeHandler);
      this.resolution = resolve;
      this.dm.configureNarrative(this.message);
      this.dm.runNarrative();
    });
  }

  completeHandler = (e: any) => {
    if ("isCutscenePlaying" in e.detail) {
      e.detail.isCutscenePlaying = false;
    }
    document.removeEventListener("dialogComplete", this.completeHandler);
    if (this.resolution) this.resolution();
  };
}
