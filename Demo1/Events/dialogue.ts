import { GameEvent } from "../../parkinglog/EventManager"; //"../../src/components/EventManager";
import { GameObject } from "../../parkinglog/GameObject"; //../../src/components/GameObject";
import { Conversation, DialogManager } from "../PlugIns/DialogueManager";
import { Signal } from "../../_Squeleto/Signals";

/**
 * This is a content event of the custom plug in DialogManager that was created
 * this is the event that takes as a parameter when called the dialog conversation content class
 * this event resolves when the 'end' flag is hit on a conversation
 */

export class DialogEvent extends GameEvent {
  who: GameObject | string | undefined;
  message: Conversation;
  dm: any;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;
  dialogSignal;

  constructor(message: Conversation, dm: DialogManager, who: string, sf?: any) {
    super("dialog");
    this.dialogSignal = new Signal("dialogueComplete", who);
    this.who = who;
    this.message = message;
    this.dm = dm;
    (this.dm as DialogManager).configureStoryFlags(sf);
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      this.dialogSignal.listen(this.completeHandler);
      this.resolution = resolve;
      this.dm.configureNarrative(this.message);
      this.dm.runNarrative();
    });
  }

  completeHandler = (e: CustomEventInit) => {
    if (e.detail && "isCutscenePlaying" in e.detail) {
      e.detail.isCutscenePlaying = false;
    }
    this.dialogSignal.stopListening();
    if (this.resolution) this.resolution();
  };
}
