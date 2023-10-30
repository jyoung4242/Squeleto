/*****************************************************************************
 * Component: position
 * Parameters on entity:
 *  position: <Vector> ,
 *
 * Description:
 * based on the parameters set on entity create method
 * this Vector controls the overall position of the entity, creates an x/y value
 ***************************************************************************** */

import { Component } from "../../_Squeleto/component";
import { Vector } from "../../_Squeleto/Vector";

export interface IPosition {
  x: number;
  y: number;
  z?: number;
}
export interface IPositionComponent {
  position: IPosition;
}

export type PositionType = Vector;

export interface PositionComponent {
  position: PositionType;
}

export class Position extends Component {
  public value = new Vector();
  public constructor() {
    //@ts-ignore
    super("position", Position, true);
  }

  public define(data: IPosition | number[]): void {
    if (data == null) {
      return;
    }
    if (Array.isArray(data)) {
      this.value.x = data[0];
      this.value.y = data[1];
      this.value.z = data[2] ?? 0;
    } else {
      this.value.x = data.x;
      this.value.y = data.y;
      this.value.z = data.z ?? 0;
    }
  }
}
