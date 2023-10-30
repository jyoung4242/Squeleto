import { Conversation, DialogSnapshot } from "../PlugIns/DialogueManager";
import hero from "../../src/Assets/heroAvatar.png";
import npc from "../Assets/npcAvatar.png";
import { GameObject } from "../../parkinglog/GameObject";

/**
 * This is a content component of the custom plug in DialogManager that was created
 * More complex popup that's tied to several SF settings, depending on choices made
 * StoryFlag prereqs set a flag if you've checked the bookcase once, then the message changes
 * Mulitple messages, and some have back and forth dialog
 * 2nd conversation after the not nice greeting demonstrates options, and SF's are set
 * based on selection, which then branches off the different diaglog trees
 * Also demonstrates the use of different layouts with avatars as well...
 */

const snapshot1: DialogSnapshot = {
  conditions: {
    threat: false,
    meek: false,
    deaf: false,
    angry: false,
  },
  content: [
    {
      type: "left",
      speed: 40,
      message: "Get out of my way, ... PUNK!",
      avatar: [npc],
    },
    {
      type: "right",
      speed: 80,
      message: "...",
      avatar: [hero],
      end: true,
      flags: { threat: true },
    },
  ],
};

const snapshot2: DialogSnapshot = {
  conditions: {
    threat: true,
    meek: false,
    deaf: false,
    angry: false,
  },
  content: [
    {
      type: "left",
      speed: 75,
      message: "I said.... GET OUT OF MY WAY!",
      avatar: [npc],
    },
    { type: "left", speed: 50, message: "ARE YOU DEAF !?!?!?!", avatar: [npc] },
    {
      type: "right_interact",
      options: [
        { message: "I'm so sorry...", flags: { meek: true }, speed: 200 },
        { message: "Huh...? Wha....?", flags: { deaf: true }, speed: 350 },
        { message: "NOW YOU DIE!!!!", flags: { angry: true }, speed: 50 },
      ],
      avatar: [hero],
      end: true,
    },
  ],
};

const snapshot3: DialogSnapshot = {
  conditions: {
    threat: true,
    meek: true,
    deaf: false,
    angry: false,
  },
  content: [
    {
      type: "left",
      speed: 110,
      message: "Yeah.. that's what I thought",
      avatar: [npc],
      end: true,
    },
  ],
};

const snapshot4: DialogSnapshot = {
  conditions: {
    threat: true,
    meek: false,
    deaf: true,
    angry: false,
  },
  content: [{ type: "left", speed: 75, message: "...", avatar: [npc], end: true }],
};

const snapshot5: DialogSnapshot = {
  conditions: {
    threat: true,
    meek: false,
    deaf: false,
    angry: true,
  },
  content: [
    { type: "left", speed: 70, message: "GWAAAAAaaaaa.... ", avatar: [npc] },
    {
      type: "left",
      speed: 40,
      message: "MOMMY......",
      avatar: [npc],
      end: true,
    },
  ],
};

const defaultSnapshot: DialogSnapshot = {
  conditions: "default",
  content: [{ type: "left", speed: 70, message: ".... ", avatar: [npc], end: true }],
};

export class testConversation extends Conversation {
  constructor(who: GameObject) {
    super(who);
    this.who = who;
    this.messageSnapshots = [snapshot1, snapshot2, snapshot3, snapshot4, snapshot5, defaultSnapshot];
  }
}
