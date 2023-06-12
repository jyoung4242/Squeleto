import { Conversation, DialogSnapshot } from "../PlugIns/DialogueManager";
import { GameObject } from "../../src/components/GameObject";

const snapshot1: DialogSnapshot = {
  conditions: {
    metBookcase: false,
  },
  content: [
    { type: "none", speed: 70, message: "just a boring bookcase!!! ", avatar: [], end: true, flags: { metBookcase: true } },
  ],
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
