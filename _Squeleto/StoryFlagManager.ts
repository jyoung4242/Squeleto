import { GameEvent } from "./EventManager";
import { GameObject } from "./GameObject";

export class StoryFlagManager {
  isInitialized: boolean = false;
  StoryFlags: { [key: string]: boolean } = {};

  constructor(storyFlags: { [key: string]: boolean }) {
    Object.assign(this.StoryFlags, storyFlags);
    this.isInitialized = true;
  }

  setStoryFlagValue(sf: string, value: boolean): boolean {
    if (!this.isInitialized) return false;

    if (sf in this.StoryFlags) {
      this.StoryFlags[sf] = value;
      return true;
    } else throw new Error("invalid story flag key");
  }

  checkConditions(conditions: { [key: string]: boolean } | "default") {
    if (!this.isInitialized) return false;
    if (conditions == "default") return true;
    const conditionArray = Object.entries(conditions);
    let test_cntr = 0;

    conditionArray.forEach(cond => {
      if (this.StoryFlags[cond[0]] == cond[1]) test_cntr++;
    });
    if (test_cntr == conditionArray.length) return true;
    return false;
  }
}

export class SetStoryFlagEvent extends GameEvent {
  key: string;
  value: boolean;
  who: GameObject | undefined;
  manager: StoryFlagManager;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(manager: StoryFlagManager, key: string, value: boolean) {
    super("setStoryFlag");
    this.who = undefined;
    this.key = key;
    this.value = value;
    this.manager = manager;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      this.manager.setStoryFlagValue(this.key, this.value);
      console.log("setting storyflag: ", this.key, this.value);

      resolve();
    });
  }
}
