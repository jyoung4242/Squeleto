/*****************************************************************************
 * Component: events
 * Parameters on entity:
 *  behaviors: {
          currentBehavior: "default",
          behaviors: {
            default: [
              <LIST OF EVENTS>
            ],
            <'eventname'>: [
              <LIST OF EVENTS>
            ],
            ... other loop sequences
          },
 *
 * Description:
 * based on the parameters set on entity create method
 * creates the behavior loops for each entity
 ***************************************************************************** */

import { Component } from "../../_Squeleto/component";
import { GameEvent } from "../Systems/Events";

// you can define the incoming types when the component is created
export interface IEventComponent {
  currentBehavior: string;
  behaviors: EventSequence;
}

type BehaviorLoopArray = [any, any[]];
type EventSequence = Record<string, BehaviorLoopArray[]>;

export type EventType = {
  behaviorIndex: number;
  currentBehavior: string;
  currentEvent: GameEvent | undefined;
  behaviors: EventSequence;
};

// this is the exported interface that is used in systems modules
export interface EventComponent {
  behaviors: EventType;
}

export class EventComp extends Component {
  public value: EventType = {
    currentBehavior: "default",
    currentEvent: undefined,
    behaviorIndex: 0,
    behaviors: {},
  };

  public constructor() {
    //@ts-ignore
    super("behaviors", EventComp, true);
  }

  public define(data: IEventComponent): void {
    if (data == null) {
      return;
    }
    this.value.currentBehavior = data.currentBehavior;
    this.value.behaviors = data.behaviors;
  }
}
