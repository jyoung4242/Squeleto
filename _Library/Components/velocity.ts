/*****************************************************************************
 * Component: velocity
 * Parameters on entity:
 *  velocity: <Vector> ,
 *
 * Description:
 * based on the parameters set on entity create method
 * this Vector controls the overall velocity of the entity, creates an x/y value as a vector
 * for velocity, and this is used in movement system
 ***************************************************************************** */

import { Vector } from "../../_Squeleto/Vector";
import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface IVelocityComponent {
  data: VelocityType;
}
export type VelocityType = Vector;

// this is the exported interface that is used in systems modules
export interface VelocityComponent {
  velocity: VelocityType;
}

export class VelocityComp extends Component {
  //setting default value
  public value: VelocityType = new Vector();
  public constructor() {
    //@ts-ignore
    super("velocity", VelocityComp, true);
  }

  public define(data: IVelocityComponent): void {
    if (data == null) {
      return;
    }
    if (Array.isArray(data)) {
      this.value.x = data[0];
      this.value.y = data[1];
      this.value.z = data[2] ?? 0;
    } else {
      this.value.x = data.data.x;
      this.value.y = data.data.y;
      this.value.z = data.data.z ?? 0;
    }
  }
}
