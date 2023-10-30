import { Conversation, DialogSnapshot } from "../PlugIns/DialogueManager";
import { GameObject } from "../../parkinglog/GameObject";

/**
 * This is a content component of the custom plug in DialogManager that was created
 * Simple popup that's tied to a storyflag setting
 * StoryFlag prereqs set a flag if you've checked the bookcase once, then the message changes
 * Two messages, but only one will fire at a time, but the content switches from
 * snapshot 1 to 2 after the first check
 */

const snapshot1: DialogSnapshot = {
  conditions: {
    metBookcase: false,
  },
  content: [{ type: "none", speed: 70, message: "just a boring bookcase!!! ", avatar: [], end: true, flags: { metBookcase: true } }],
};
const snapshot2: DialogSnapshot = {
  conditions: {
    metBookcase: true,
  },
  content: [{ type: "none", speed: 70, message: "still a boring bookcase ", avatar: [], end: true }],
};

export class bookcasePopup extends Conversation {
  constructor(who: GameObject) {
    super(who);
    this.who = who;
    this.messageSnapshots = [snapshot1, snapshot2];
  }
}
