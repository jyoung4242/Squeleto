import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_Squeleto/entity";
import { Assets } from "@peasy-lib/peasy-assets";
import { Vector } from "../../_Squeleto/Vector";

export class PizzaSignEntity {
  static create(startingVector: Vector) {
    const id = uuidv4();
    const myMap = "outside";
    return Entity.create({
      id: id,
      components: {
        name: "pizzasign",
        position: startingVector,
        zindex: 0,
        size: { data: [28, 22] },
        opacity: 1,
        render: true,
        sprites: {
          data: [{ src: Assets.image("pizzazone").src, offset: { x: 0, y: 0 }, size: { x: 28, y: 22 } }],
        },
        map: myMap,
        interactions: {
          data: { isEnabled: false, isActive: false, color: "transparent", radius: 1, blur: 10, conditions: {}, actions: [] },
        },
        collider: {
          data: {
            id: id,
            startingPosition: startingVector,
            size: new Vector(28, 17),
            offset: new Vector(0, 5),
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
