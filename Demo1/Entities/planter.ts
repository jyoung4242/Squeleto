import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_Squeleto/entity";
import { Assets } from "@peasy-lib/peasy-assets";
import { Vector } from "../../_Squeleto/Vector";

export class PlanterEntity {
  static create(startingVector: Vector) {
    const id = uuidv4();
    const myMap = "outside";
    return Entity.create({
      id: id,
      components: {
        name: "planter",
        position: startingVector,
        zindex: 0,
        size: { data: [31, 48] },
        opacity: 1,
        render: true,
        sprites: {
          data: [{ src: Assets.image("planter").src, offset: { x: 0, y: 0 }, size: { x: 32, y: 48 } }],
        },
        map: myMap,
        interactions: {
          data: { isEnabled: false, isActive: false, color: "transparent", radius: 1, blur: 10, conditions: {}, actions: [] },
        },
        collider: {
          data: {
            id: id,
            startingPosition: startingVector,
            size: new Vector(31, 40),
            offset: new Vector(0, 10),
            type: "static",
            map: myMap,
          },
        },
      },
    });
  }
}

/*
entities must have size, position, opacity, and zindex components as they are baked in properties in-line
*/
