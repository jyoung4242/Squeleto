/*****************************************************************************
 * Event: ChangeBehavior
 * Components Required: EventComponent & NameComponent
 * Signals: none
 * Parameters:
 * [0]- <string> - this.target - target entity name to change the behavior of
 * [1]- <string> - this.behavior - string key for action group to switch to
 
* Description:
 * based on the parameters passed on the creation of Event, allows the behavior
 * loops for entities to be changed
 ******************************************************************************/
import { Entity } from "../../_Squeleto/entity";
import { EventComponent } from "../Components/events";
import { NameComponent } from "../Components/name";
import { GameEvent } from "../Systems/Events";

type BehviorEntity = Entity & EventComponent & NameComponent;

export class ChangeBehaviorEvent extends GameEvent {
  behavior: string = "";
  target: string = "";

  constructor(who: Entity | null, params: [...any]) {
    super(who, params);
    this.event = "ChangeBehaviorEvent";
    this.target = params[0];
    this.behavior = params[1];
  }

  static create(who: Entity | null, params: [...any]): ChangeBehaviorEvent {
    return new ChangeBehaviorEvent(who, params);
  }

  init(entities: BehviorEntity[]): Promise<void> {
    this.eventStatus = "running";
    return new Promise(resolve => {
      if (this.target) {
        let targetEntity: BehviorEntity = entities.find(trg => trg.name == this.target) as BehviorEntity;
        targetEntity.behaviors.behaviorIndex = 0;
        targetEntity.behaviors.currentBehavior = this.behavior;
      }

      this.eventStatus = "complete";
      resolve();
    });
  }
}
