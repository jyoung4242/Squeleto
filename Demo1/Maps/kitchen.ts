import { GameObject } from "../../_Squeleto/GameObject";
import { GameMap, MapConfig } from "../../_Squeleto/MapManager";
import { ChangeMap } from "../../_Squeleto/Renderer";
import { bathroomPopup } from "../Dialogue/bathroom";
import { DialogEvent } from "../Events/dialogue";
import { playSFX } from "../Events/sfx";
import { StandEvent } from "../Events/stand";
import { WalkEvent } from "../Events/walk";

/**************************************
 * Kitchen Map
 * ---------------------------------
 *
 * passes two layers of images from Scene
 *
 * 2 significant parameters in constructor is
 * walls[] and triggers []
 * bunch of boundary walls
 * two triggers:
 * one is bathroom closet tile that triggers a sequence of events
 * the other is the bottom door, that changes the map
 *************************************/

export class Kitchen extends GameMap {
  static who: GameObject;
  dm;
  sf;
  constructor(assets: any, dm: any, sf: any) {
    let config: MapConfig = {
      name: "kitchen",
      width: 192,
      height: 192,
      layers: [assets.image("lower").src, assets.image("DemoUpper").src],
      walls: [
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
      ],
      triggers: [
        {
          x: 112,
          y: 48,
          w: 14,
          h: 5,
          color: "yellow",
          actions: [
            new WalkEvent("down", 25),
            new StandEvent("left", 500),
            new playSFX("error"),
            new DialogEvent(new bathroomPopup(), dm, "BathroomTrigger", sf),
          ],
        },
        {
          x: 79,
          y: 172,
          w: 16,
          h: 5,
          color: "yellow",
          actions: [new ChangeMap("outside", 50, 200), new StandEvent("down", 100)],
        },
      ],
    };
    super(config);
    this.dm = dm;
    this.sf = sf;
  }
}
