/*****************************************************************************
 * Component: size
 * Parameters on entity:
 *  size: <Vector> ,
 *
 * Description:
 * based on the parameters set on entity create method
 * this Vector controls the overall size of the enity, has an x/y value, for width/height
 ***************************************************************************** */
import { Vector } from "../../_Squeleto/Vector";
import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface ISizeComponent {
  data: SizeType | Array<number>;
}
export type SizeType = Vector;

// this is the exported interface that is used in systems modules
export interface SizeComponent {
  size: SizeType;
}

// classes should have:
// if UI element, a template property with the peasy-ui template literal
// if no UI aspect to the system, do not define a template
// a 'value' property that will be attached to the entity
export class SizeComp extends Component {
  //setting default value
  public value: SizeType = new Vector(0, 0);
  public constructor() {
    //@ts-ignore
    super("size", SizeComp, true);
  }

  public define(data: ISizeComponent): void {
    if (data == null) {
      return;
    }

    if (Array.isArray(data.data)) {
      this.value.x = data.data[0];
      this.value.y = data.data[1];
    } else {
      this.value.x = data.data.x;
      this.value.y = data.data.y;
    }
  }
}
