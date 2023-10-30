/*****************************************************************************
 * Component: zindex
 * Parameters on entity:
 *  zindex: <zindex number>,
 *
 * Description:
 * based on the parameters set on entity create method
 * let's you attach and control z-index order of an entity, useful for y-sorting
 ***************************************************************************** */

import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface IZindexComponent {
  zindex: ZindexType;
}
export type ZindexType = number;

// this is the exported interface that is used in systems modules
export interface ZindexComponent {
  zindex: ZindexType;
}

// classes should have:
// if UI element, a template property with the peasy-ui template literal
// if no UI aspect to the system, do not define a template
// a 'value' property that will be attached to the entity
export class ZindexComp extends Component {
  //setting default value
  public value: ZindexType = 0;
  public constructor() {
    //@ts-ignore
    super("zindex", ZindexComp, true);
  }

  public define(data: number): void {
    if (data == null) {
      return;
    }
    this.value = data;
  }
}
