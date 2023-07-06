import { Engine } from "@peasy-lib/peasy-engine";
import { GameObject } from "./GameObject";
//library code
export type EventConfigType = "LOOP" | "CUTSCENE";

export class EventManager {
  who: GameObject;

  isCutscenePlaying: boolean = false;
  isCallBusy: boolean = false;
  eventEngine: Engine | undefined;
  mode: EventConfigType = "CUTSCENE";
  sequence: Array<GameEvent> = [];
  loopIndex: number = 0;
  cutscenePromise: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(who: GameObject, setmode: EventConfigType) {
    this.mode = setmode;
    this.loopIndex = 0;
    this.who = who;
    this.eventEngine = Engine.create({
      callback: this.behaviorLoop,
      ms: 200,
      started: false,
      resetThreshold: 10000,
      oneTime: false,
    });

    this.cutscenePromise = undefined;
  }

  loadSequence = (seq: GameEvent[]) => {
    this.sequence = [];
    this.sequence = [...seq];
  };

  pause = () => {
    if (this.eventEngine) this.eventEngine.pause();
  };

  start = (): Promise<void> | void => {
    if (this.eventEngine) this.eventEngine.start();
    if (this.mode == "CUTSCENE") {
      return new Promise(resolve => {
        this.cutscenePromise = resolve;
      });
    }
  };
  resume = () => {
    if (this.eventEngine) this?.eventEngine.start();
  };

  behaviorLoop = async (deltatime: number, now: number) => {
    if (this.isCallBusy) return;
    if (this.isCutscenePlaying) return;
    if (this.sequence.length == 0) return;
    this.isCallBusy = true;
    await this.sequence[this.loopIndex].init(this.who);
    this.isCallBusy = false;
    this.loopIndex++;

    //check for end of sequence
    if (this.loopIndex >= this.sequence.length) {
      //check mode
      if (this.mode == "CUTSCENE") {
        this.eventEngine?.stop();
        this.sequence = [];
        if (this.cutscenePromise) this.cutscenePromise();
      }
      this.loopIndex = 0;
    }
  };
}

export class GameEvent {
  public name: string;
  who: GameObject | string | undefined;
  constructor(eventName: string) {
    this.name = eventName;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      //do eventcode here
      resolve();
    });
  }
}
