import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_Squeleto/entity";
import { Vector } from "../../_Squeleto/Vector";
import { Assets } from "@peasy-lib/peasy-assets";
import { LogEvent } from "../Events/log";
import { DialogEvent } from "../Events/dialogEvent";
import { StoryFlagEvent } from "../Events/storyflag";
import { PlaySoundEvent } from "../Events/playSound";

export class bookshelfEntity {
  static create(startingVector: Vector) {
    const id = uuidv4();
    const myMap = "kitchen";
    return Entity.create({
      id: id,
      components: {
        name: "bookshelf",
        position: startingVector,
        zindex: 0,
        render: true,
        size: { data: [32, 26] },
        opacity: 1,
        sprites: {
          data: [{ src: Assets.image("bookshelf").src, offset: { x: 0, y: 0 }, size: { x: 32, y: 26 } }],
        },
        interactions: {
          data: {
            isEnabled: true,
            isActive: false,
            color: "transparent",
            blurradius: 1,
            w: 30,
            h: 24,
            x: 0,
            y: 0,
            radius: "1",
            blur: 3,
            conditions: {},
            actions: [
              {
                condition: "default",
                actions: [
                  PlaySoundEvent.create("bookshelf", ["charge", 3, false]),
                  DialogEvent.create("bookshelf", ["This is a bookshelf, not interesting..."]),
                  StoryFlagEvent.create("bookcase", ["bookcaseVisits", true]),
                ],
              },
            ],
          },
        },
        map: myMap,
        collider: {
          data: {
            id: id,
            type: "static",
            startingPosition: startingVector,
            size: new Vector(32, 12),
            offset: new Vector(0, 16),
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
