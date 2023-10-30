/*****************************************************************************
 * Component: cameraFollow
 * Parameters on entity:
 *  camerafollow: { data: true },
 *
 * Description:
 * based on the parameters set on entity create method
 * addes the camerafollow property on the entity which is boolean
 ***************************************************************************** */

import { Component } from "../../_Squeleto/component";

// you can define the incoming types when the component is created
export interface ICameraFollowComponent {
  data: CameraFollowType;
}
export type CameraFollowType = boolean;

// this is the exported interface that is used in systems modules
export interface CameraFollowComponent {
  camerafollow: CameraFollowType;
}

export class CameraFollowComp extends Component {
  //setting default value
  public value: CameraFollowType = false;
  public constructor() {
    //@ts-ignore
    super("camerafollow", CameraFollowComp, true);
  }

  public define(data: ICameraFollowComponent): void {
    if (data == null) {
      return;
    }
    this.value = data.data;
  }
}
