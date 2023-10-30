/*****************************************************************************
 * Component: entitymap
 * Parameters on entity:
 *  camerafollow: { data: <'mapname'> },
 *
 * Description:
 * based on the parameters set on entity create method
 * the string mapname to the entity for which the entity exists on
 ***************************************************************************** */

import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface IMapComponent {
  Map: MapType;
}
export type MapType = string;

// this is the exported interface that is used in systems modules
export interface MapComponent {
  map: MapType;
}

// classes should have:
// if UI element, a template property with the peasy-ui template literal
// if no UI aspect to the system, do not define a template
// a 'value' property that will be attached to the entity
export class MapComp extends Component {
  //setting default value
  public value: MapType = "";
  public constructor() {
    //@ts-ignore
    super("map", MapComp, true);
  }

  public define(data: string): void {
    if (data == null) {
      return;
    }
    this.value = data;
  }
}
