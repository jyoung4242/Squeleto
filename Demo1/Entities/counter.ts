import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_Squeleto/entity";
import { Vector } from "../../_Squeleto/Vector";
import { Assets } from "@peasy-lib/peasy-assets";

export class CounterEntity {
  static create(startingVector: Vector) {
    const id = uuidv4();
    const myMap = "kitchen";
    return Entity.create({
      id: id,
      components: {
        position: startingVector,
        zindex: 0,
        size: { data: [32, 33] },
        opacity: 1,
        render: true,
        sprites: {
          data: [{ src: Assets.image("counter").src, offset: { x: 0, y: 0 }, size: { x: 32, y: 33 } }],
        },
        map: myMap,
        interactions: {
          data: { isEnabled: false, isActive: false, color: "transparent", radius: 1, blur: 10, conditions: {}, actions: [] },
        },
        collider: {
          data: {
            id: id,
            startingPosition: startingVector,
            size: new Vector(32, 24),
            offset: new Vector(0, 8),
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
