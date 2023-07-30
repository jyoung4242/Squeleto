import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_SqueletoECS/entity";
import map from "../Assets/map.png";

export class MapEntity {
  static create() {
    return Entity.create({
      id: uuidv4(),
      components: {
        position: [0, 0],
        sprite: map,
        zindex: 0,
      },
    });
  }
}
