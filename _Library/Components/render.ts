/*****************************************************************************
 * Component: render
 * Parameters on entity:
 *  render: <true/false> ,
 *
 * Description:
 * based on the parameters set on entity create method
 * adds render property to entity, allows it to be y-sorted
 ***************************************************************************** */

import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface IRenderComponent {
  data: RenderType;
}
export type RenderType = boolean;

// this is the exported interface that is used in systems modules
export interface RenderComponent {
  render: RenderType;
}

// classes should have:
// if UI element, a template property with the peasy-ui template literal
// if no UI aspect to the system, do not define a template
// a 'value' property that will be attached to the entity
export class RenderComp extends Component {
  // UI template string literal with UI binding of value property

  //setting default value
  public value: RenderType = true;
  public constructor() {
    //@ts-ignore
    super("render", RenderComp, true);
  }

  public define(data: boolean): void {
    if (data == null) {
      return;
    }
    this.value = data;
  }
}
