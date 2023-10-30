/*****************************************************************************
 * System: Events
 * Components Required: EventComponent
 * Signals: EventSignal, cutSceneSignal
 *
 * Description:
 * there are two forms of events running, each Entity's behavior loop in the
 * EventComponent, or a cutscene that is from GameEvents listed in actions arrays
 *
 * Both execute VERY similarly, except the cutscene runs once, and the BL runs constantly
 * the event loop iterates over the actions arrays and executes the GameEvent.init()
 * method for each one, which has a status value for each event, until that
 * event status goes to complete, then it moves on to next event in array
 ******************************************************************************/

import { Signal } from "../../_Squeleto/Signals";
import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { EventComponent } from "../Components/events";

// type definition for ensuring the entity template has the correct components
// ComponentTypes are defined IN the components imported
export type EventEntity = Entity & EventComponent;

export class EventSystem extends System {
  EventSignal: Signal;
  cutSceneSignal: Signal;
  isCutsceneRunning: boolean = false;
  isBehaviorEventActive: boolean = false;
  cutsceneSequence: GameEvent[] = [];
  cutsceneIndex: number = 0;
  cutsceneCurrentEvent: GameEvent | undefined = undefined;

  constructor() {
    super("Events");
    this.EventSignal = new Signal("Event");
    this.EventSignal.listen(this.runCutscene);
    this.cutSceneSignal = new Signal("cutscene");
  }

  processEntity(entity: EventEntity): boolean {
    return entity.behaviors != null;
  }

  //Signal Handler for running cutscenes
  runCutscene = (SignalData: CustomEvent) => {
    this.cutsceneIndex = 0;
    this.cutsceneSequence = [...SignalData.detail.params[0]];
    this.isCutsceneRunning = true;
    this.cutSceneSignal.send([true]);
  };

  // update routine that is called by the gameloop engine
  update = (deltaTime: number, now: number, entities: EventEntity[]): void => {
    if (!this.isCutsceneRunning) {
      //THIS IS THE BEHAVIOR LOOPS
      entities.forEach(entity => {
        if (!this.processEntity(entity)) return;

        let { currentBehavior, behaviorIndex, behaviors, currentEvent } = entity.behaviors;

        if (currentEvent == undefined) {
          //setup current Event
          const params = behaviors[currentBehavior][behaviorIndex][1];
          entity.behaviors.currentEvent = new behaviors[currentBehavior][behaviorIndex][0](entity, [...params]);
        }

        currentEvent = entity.behaviors.currentEvent;
        if (currentEvent == undefined) return;
        if (currentEvent.eventStatus == "idle") {
          currentEvent.init(entities);
          this.isBehaviorEventActive = true;
          return;
        } else if (currentEvent.eventStatus == "running") {
          currentEvent.update();
          return;
        } else if (currentEvent.eventStatus == "complete") {
          //console.log("in completed event");

          currentEvent.reset();
          this.isBehaviorEventActive = false;

          entity.behaviors.behaviorIndex++;
          entity.behaviors.currentEvent = undefined;
          if (entity.behaviors.behaviorIndex >= behaviors[currentBehavior].length) {
            entity.behaviors.behaviorIndex = 0;
          }
          return;
        }
      });
    } else {
      if (this.cutsceneCurrentEvent == undefined) {
        //setup current Event
        this.cutsceneCurrentEvent = this.cutsceneSequence[this.cutsceneIndex];
      }

      if (this.cutsceneCurrentEvent == undefined) return;

      if (this.cutsceneCurrentEvent.eventStatus == "idle") {
        this.cutsceneCurrentEvent.init(entities);

        return;
      } else if (this.cutsceneCurrentEvent.eventStatus == "running") {
        this.cutsceneCurrentEvent.update();
        return;
      } else if (this.cutsceneCurrentEvent.eventStatus == "complete") {
        this.cutsceneCurrentEvent.reset();
        this.cutsceneIndex++;
        this.cutsceneCurrentEvent = undefined;

        if (this.cutsceneIndex >= this.cutsceneSequence.length) {
          this.cutsceneIndex = 0;
          this.isCutsceneRunning = false;
          this.cutsceneSequence = [];
          this.cutSceneSignal.send([false]);
        }
        return;
      }
    }
  };
}

export class GameEvent {
  eventStatus: "idle" | "running" | "complete";
  who: Entity | string | null = null;
  event: string = "event";

  constructor(who: Entity | string | null, params: [...any]) {
    this.who = who;
    this.eventStatus = "idle";
  }

  init(entities?: Entity[]): Promise<void> {
    return new Promise(resolve => {
      //do eventcode here
      resolve();
    });
  }

  reset() {
    this.eventStatus = "idle";
  }

  update() {}

  static create(who: Entity | null, params: [...any]): GameEvent {
    return new GameEvent(who, params);
  }
}
