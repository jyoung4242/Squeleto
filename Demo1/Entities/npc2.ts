import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_Squeleto/entity";
import { Vector } from "../../_Squeleto/Vector";
import { Assets } from "@peasy-lib/peasy-assets";
import { WalkEvent } from "../Events/walk";
import { StandEvent } from "../Events/stand";
import { LogEvent } from "../Events/log";
import { WaitEvent } from "../Events/wait";
import { DialogEvent } from "../Events/dialogEvent";
import { StoryFlagSystem } from "../Systems/StoryFlags";

const npcAnimation = {
  frameRate: 8,
  default: "idle-down",
  sequences: {
    "idle-right": [[0, 32]],
    "idle-left": [[0, 96]],
    "idle-up": [[0, 64]],
    "idle-down": [[0, 0]],
    "walk-right": [
      [0, 32],
      [32, 32],
      [64, 32],
      [96, 32],
    ],
    "walk-left": [
      [0, 96],
      [32, 96],
      [64, 96],
      [96, 96],
    ],
    "walk-up": [
      [0, 64],
      [32, 64],
      [64, 64],
      [96, 64],
    ],
    "walk-down": [
      [0, 0],
      [32, 0],
      [64, 0],
      [96, 0],
    ],
  },
};
export class NPCEntity {
  static create(startingVector: Vector) {
    const id = uuidv4();
    const myMap = "kitchen";
    return Entity.create({
      id: id,
      components: {
        position: startingVector,
        name: "Larry",
        zindex: 0,
        size: { data: [32, 33] },
        opacity: 1,
        render: true,
        interactions: {
          data: {
            isEnabled: true,
            isActive: false,
            color: "transparent",
            w: 16,
            h: 8,
            x: 8,
            y: 24,
            blurradius: 3,
            radius: "50%",
            blur: 3,
            conditions: {},
            actions: [
              {
                get condition() {
                  let val = StoryFlagSystem.readStoryFlagValue("bookcaseVisits");
                  return val;
                },
                actions: [DialogEvent.create("NPC", ["Did you find what you're looking for?"])],
              },
              {
                condition: true,
                actions: [DialogEvent.create("NPC", ["Go see the bookcase frist"])],
              },
            ],
          },
        },
        spritesheet: {
          data: [
            { src: Assets.image("shadow").src, offset: { x: 0, y: 0 }, size: { x: 32, y: 32 }, framesize: { x: 32, y: 32 } },
            {
              src: Assets.image("npc2").src,
              offset: { x: 0, y: 0 },
              size: { x: 128, y: 128 },
              framesize: { x: 32, y: 32 },
              animation: npcAnimation,
            },
          ],
        },

        behaviors: {
          currentBehavior: "default",
          behaviors: {
            default: [
              [WalkEvent, ["right", 20, 0.4]],
              [WalkEvent, ["down", 20, 0.4]],
              [WalkEvent, ["left", 20, 0.4]],
              [WalkEvent, ["up", 20, 0.4]],
            ],
            standing: [
              [StandEvent, ["right", 1000]],
              [StandEvent, ["up", 1000]],
              [StandEvent, ["left", 1000]],
              [StandEvent, ["down", 1000]],
            ],
          },
        },
        map: myMap,
        collider: {
          data: {
            id: id,
            startingPosition: startingVector,
            size: new Vector(16, 8),
            offset: new Vector(8, 24),
            type: "npc",
            map: myMap,
          },
        },
      },
    });
  }
}
