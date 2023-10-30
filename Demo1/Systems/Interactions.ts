/*****************************************************************************
 * System: Interactions
 * Components Required: InteractionComponent
 * Signals: interactTrigger, sendEventSignal
 *
 * Description:
 * This checks the interaction flag that is set/cleared by signals to see if a
 * cutscene should be fired based on the actions array for each entity
 ******************************************************************************/

import { Signal } from "../../_Squeleto/Signals";
import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { InteractionComponent } from "../Components/interactions";

// type definition for ensuring the entity template has the correct components
// ComponentTypes are defined IN the components imported
export type InteractionEntity = Entity & InteractionComponent;

export class interactionSystem extends System {
  isCutscenePlaying: boolean = false;
  interactTrigger = new Signal("interact");
  sendEventSignal = new Signal("Event");
  isCutScenePlayingSignal = new Signal("cutscene");
  checkInteraction: boolean;
  public constructor() {
    super("interactions");
    this.checkInteraction = false;
    this.isCutScenePlayingSignal.listen((signalData: CustomEvent) => {
      this.isCutscenePlaying = signalData.detail.params[0];
      if (!this.isCutscenePlaying) this.checkInteraction = false;
    });
    this.interactTrigger.listen(() => {
      if (!this.checkInteraction) this.checkInteraction = true;
    });
  }

  public processEntity(entity: InteractionEntity): boolean {
    return entity.interactions.isEnabled;
  }

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: InteractionEntity[]): void {
    entities.forEach(entity => {
      if (!this.processEntity(entity)) {
        return;
      }

      if (this.isCutscenePlaying) return;
      if (this.checkInteraction && entity.interactions && entity.interactions.isActive) {
        let actions = entity.interactions.actions;

        //depending on the types of actions listed i.e. storyflags and such...
        for (let action of actions) {
          //if the condition for selecting that action is met...
          if (action.condition) {
            //run cutscene
            this.sendEventSignal.send([action.actions]);
            return;
          }
        }
      }
    });
  }
}
