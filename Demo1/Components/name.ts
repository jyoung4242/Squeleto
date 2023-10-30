/*****************************************************************************
 * Component: name
 * Parameters on entity:
 *  name: <'enity name'>,
 *
 * Description:
 * based on the parameters set on entity create method
 * a name property to the entity, useful if you have to find enitty in array
 ***************************************************************************** */
import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface INameComponent {
  data: NameType;
}
export type NameType = string;

// this is the exported interface that is used in systems modules
export interface NameComponent {
  name: NameType;
}

// classes should have:
// if UI element, a template property with the peasy-ui template literal
// if no UI aspect to the system, do not define a template
// a 'value' property that will be attached to the entity
export class NameComp extends Component {
  // UI template string literal with UI binding of value property

  //setting default value
  public value: NameType = "";
  public constructor() {
    //@ts-ignore
    super("name", NameComp, true);
  }

  public define(data: string): void {
    if (data == null) {
      return;
    }
    this.value = data;
  }
}
