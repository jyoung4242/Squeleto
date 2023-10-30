//**************************************
// * Kitchen Map
// * ---------------------------------
// * 2 significant parameters in map data is
// * walls[] and triggers []
//**************************************
import { Vector } from "../../_Squeleto/Vector";
import { ChangeMap } from "../Events/ChangeMap";
import { DialogEvent } from "../Events/dialogEvent";
import { StoryFlagSystem } from "../Systems/StoryFlags";

export class Kitchen {
  static name = "kitchen";
  static upper = "DemoUpper";
  static lower = "lower";
  static width = 192;
  static height = 192;
  static walls = [
    {
      x: 10,
      y: 64,
      w: 5,
      h: 96,
      color: "red",
    },
    {
      x: 10,
      y: 162,
      w: 66,
      h: 14,
      color: "red",
    },
    {
      x: 100,
      y: 162,
      w: 75,
      h: 14,
      color: "red",
    },
    {
      x: 175,
      y: 64,
      w: 5,
      h: 96,
      color: "red",
    },
    {
      x: 78,
      y: 178,
      w: 18,
      h: 5,
      color: "red",
    },
    {
      x: 144,
      y: 55,
      w: 30,
      h: 5,
      color: "red",
    },
    {
      x: 130,
      y: 36,
      w: 10,
      h: 42,
      color: "red",
    },
    {
      x: 98,
      y: 36,
      w: 10,
      h: 42,
      color: "red",
    },
    {
      x: 110,
      y: 36,
      w: 18,
      h: 5,
      color: "red",
    },
    {
      x: 16,
      y: 55,
      w: 76,
      h: 5,
      color: "red",
    },
  ];
  static triggers = [
    {
      x: 112,
      y: 48,
      w: 14,
      h: 5,
      color: "yellow",
      id: "kitchen top closet",
      mode: "latch",
      actionStatus: "idle",
      actions: [
        {
          condition: true,
          actions: [
            DialogEvent.create(null, [
              {
                template: "basic",
                content: "You've entered the bathroom, what do you do?",
                buttonContent: "NEXT",
                showButton: true,
                shortcut: true,
              },
            ]),
            DialogEvent.create(null, [
              {
                template: "center",
                shortcut: false,
                content: "What do you do?",
                options: ["1. Hold your breath", "2. Leave Screaming", "3. Light a match"],
                callback: (choice: number) => StoryFlagSystem.setStoryFlagValue("bathroom", choice),
                showbutton: false,
              },
            ]),
          ],
        },
      ],
    },

    {
      x: 79,
      y: 172,
      w: 16,
      h: 5,
      id: "kitchen bottom door",
      color: "yellow",
      actionStatus: "idle",
      mode: "latch",
      actions: [{ condition: true, actions: [ChangeMap.create("hero", ["outside", new Vector(105, 75)])] }],
    },
  ];
}
