/*****************************************************************************
 * Component: collider
 * Parameters on entity:
 *  collider: {
          data: {
            interactor: {
              radius: 12,  --> value representing the interactor property, leave off if not wanted
              offsetX: 4,  -->offset parames for interactor
              offsetY: 16,
            },
            id: id, --> the UUID for the entity for collision traceability
            startingPosition: startingVector,  --> Vector for where collider is
            size: new Vector(16, 8), --> size of collider
            offset: new Vector(8, 24), --> offset from startingVector
            type: "players", --> string designator for grouping and collision management
            map: myMap, --> map that entity is currently on
          },
 *
 * Description:
 * based on the parameters set on entity create method
 * add a collider Body from detect collisions library to the entity
 ***************************************************************************** */

import { Vector } from "../../_Squeleto/Vector";
import { Component } from "../../_Squeleto/component";
import { Body, Box } from "detect-collisions";

// you can define the incoming types when the component is created
export interface IColliderComponent {
  data: {
    interactor?: any;
    type: string;
    id: string;
    startingPosition: Vector;
    offset: Vector;
    size: Vector;
    map: string;
  };
}
export type ColliderType = {
  interactor?: {
    body: Body;
    offset: Vector;
  };
  isColliding: Vector;
  id: string;
  colliderBody: any;
  offset: Vector;
  map: string;
};

// this is the exported interface that is used in systems modules
export interface ColliderComponent {
  collider: ColliderType;
}

export class ColliderComp extends Component {
  //setting default value
  public value: ColliderType = {
    isColliding: new Vector(0, 0),
    id: "",
    colliderBody: undefined,
    offset: new Vector(),
    map: "",
  };
  public constructor() {
    //@ts-ignore
    super("collider", ColliderComp, true);
  }

  public define(data: IColliderComponent): void {
    if (data == null) {
      return;
    }
    this.value.id = data.data.id;
    this.value.offset = data.data.offset;
    const entityposition = data.data.startingPosition.add(data.data.offset);

    let thisEntity;
    switch (data.data.type) {
      case "static": //static body
        thisEntity = createStaticBody(entityposition, data.data.size, this.value.id, data.data.map);
        break;
      case "players": //players
        thisEntity = createPlayableBody(entityposition, data.data.size, this.value.id, data.data.map);
        break;
      case "npc": //npc
        thisEntity = createNPCBody(entityposition, data.data.size, this.value.id, data.data.map);
        break;
      default: //something else that shouldn't
        thisEntity = undefined;
        throw new Error("invalid layer assignement on entity");
    }
    this.value.colliderBody = thisEntity;

    //if interactor data exists
    if (data.data.interactor) {
      const interactorVector = {
        x: data.data.startingPosition.x + data.data.interactor.offsetX,
        y: data.data.startingPosition.y + data.data.interactor.offsetY,
      };

      this.value.interactor = {
        body: createInteractor(new Vector(interactorVector.x, interactorVector.y), data.data.interactor.radius),
        offset: new Vector(data.data.interactor.offsetX, data.data.interactor.offsetY),
      };
    }
  }
}

function createInteractor(position: Vector, radius: number) {
  return Object.assign(new Box({ x: position.x, y: position.y }, radius * 2, radius * 2), {
    type: "interactor",
  });
}

function createPlayableBody(position: Vector, size: Vector, id: string, map: string) {
  return Object.assign(new Box({ x: position.x, y: position.y }, size.x, size.y, {}), {
    type: "player",
    id: id,
    map: map,
  });
}

function createStaticBody(position: Vector, size: Vector, id: string, map: string) {
  return Object.assign(new Box({ x: position.x, y: position.y }, size.x, size.y, { isStatic: true }), {
    type: "static",
    id: id,
    map: map,
  });
}

function createNPCBody(position: Vector, size: Vector, id: string, map: string) {
  return Object.assign(new Box({ x: position.x, y: position.y }, size.x, size.y, {}), {
    type: "npc",
    id: id,
    map: map,
  });
}
