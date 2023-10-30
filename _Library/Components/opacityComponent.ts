/*****************************************************************************
 * Component: opacity
 * Parameters on entity:
 *  opacity: <opacity value 0-1>,
 *
 * Description:
 * based on the parameters set on entity create method
 * let's you control opacity value for that entity
 ***************************************************************************** */
import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface IOpacityComponent {
  opacity: OpacityType;
}
export type OpacityType = number;

// this is the exported interface that is used in systems modules
export interface OpacityComponent {
  opacity: OpacityType;
}

// classes should have:
// if UI element, a template property with the peasy-ui template literal
// if no UI aspect to the system, do not define a template
// a 'value' property that will be attached to the entity
export class OpacityComp extends Component {
  //setting default value
  public value: OpacityType = 0;
  public constructor() {
    //@ts-ignore
    super("opacity", OpacityComp, true);
  }

  public define(data: number): void {
    if (data == null) {
      return;
    }
    this.value = data;
  }
}
