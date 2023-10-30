import { Conversation, DialogSnapshot } from "../PlugIns/DialogueManager";
import { GameObject } from "../../parkinglog/GameObject";
import { collisionBody } from "../../parkinglog/MapManager";

/**
 * This is a content component of the custom plug in DialogManager that was created
 * Very basic dialog popup box
 * No StoryFlag prereqs due to this being tied to a map trigger in the kitchen
 * One message, fires everytime you step on the trigger
 */

const snapshot1: DialogSnapshot = {
  conditions: {},
  content: [{ type: "none", speed: 70, message: "The bathroom is busy!", avatar: [], end: true }],
};

export class bathroomPopup extends Conversation {
  constructor() {
    super();
    this.who = "BathroomTrigger";
    this.messageSnapshots = [snapshot1];
  }
}
