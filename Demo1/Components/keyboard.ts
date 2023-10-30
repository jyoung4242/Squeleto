import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface IKeyboardComponent {
  data: KeyboardType;
}
export type KeyboardType = boolean;

// this is the exported interface that is used in systems modules
export interface KeyboardComponent {
  keyboard: KeyboardComp;
}

// classes should have:
// if UI element, a template property with the peasy-ui template literal
// if no UI aspect to the system, do not define a template
// a 'value' property that will be attached to the entity
export class KeyboardComp extends Component {
  public direction: "right" | "left" | "up" | "down" = "down";
  public state: "idle" | "walk" = "idle";
  // UI template string literal with UI binding of value property
  public template = ``;

  //setting default value
  public value: KeyboardType = false;
  public constructor() {
    //@ts-ignore
    super("keyboard", KeyboardComp, false);
  }

  public define(data: IKeyboardComponent): void {
    if (data == null) {
      return;
    }
    this.value = data.data;
  }
}
