/*****************************************************************************
 * Event: StoryFlag
 * Components Required:none
 * Signals: none
 *
 * Parameters:
 * [0]- <string> - this.flagname - string designating which storyFlag to modify
 * [1]- <any> - this.value - any value to set the StoryFlag to
 *
 * Description:
 * based on the parameters passed on the creation of Event, allows the event to
 * modify the global storyflag value passed
 ******************************************************************************/

import { Entity } from "../../_Squeleto/entity";
import { GameEvent } from "../Systems/Events";
import { StoryFlagSystem } from "../Systems/StoryFlags";

export class StoryFlagEvent extends GameEvent {
  flagName: string = "";
  value: any;

  constructor(who: Entity | string | null, params: [...any]) {
    super(who, params);
    this.event = "StoryFlag";
    this.flagName = params[0];
    this.value = params[1];
  }

  static create(who: Entity | string | null, params: [...any]): StoryFlagEvent {
    return new StoryFlagEvent(who, params);
  }

  init(entities: Entity[]): Promise<void> {
    this.eventStatus = "running";
    return new Promise(resolve => {
      StoryFlagSystem.setStoryFlagValue(this.flagName, this.value);
      this.eventStatus = "complete";
      resolve();
    });
  }
}
