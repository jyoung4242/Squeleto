import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_SqueletoECS/entity";
import { Vector } from "../../_SqueletoECS/Vector";

export class PlayerEntity {
  static create(name: string, position: Vector) {
    return Entity.create({
      id: uuidv4(),
      components: {
        name: name,
        position: position,
        keyboard: "",
        zindex: 1,
        barbarian: null,
      },
    });
  }
}
