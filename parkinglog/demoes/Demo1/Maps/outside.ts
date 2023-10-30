import { GameMap, MapConfig } from "../../parkinglog/MapManager";
import { ChangeMap } from "../../parkinglog/Renderer";
import { StandEvent } from "../Events/stand";

/**************************************
 * Outside Map
 * ---------------------------------
 *
 * passes two layers of images from Scene
 *
 * 2 significant parameters in constructor is
 * walls[] and triggers []
 * bunch of boundary walls
 * ONE triggers:
 * the top door, that changes the map back to kitchen
 *************************************/

export class OutsideMap extends GameMap {
  constructor(assets: any) {
    let config: MapConfig = {
      name: "outside",
      width: 256,
      height: 288,
      layers: [assets.image("outsidemod").src, assets.image("outsideUpper").src],
      walls: [
        {
          x: 20,
          y: 125,
          w: 10,
          h: 120,
          color: "red",
        },
        {
          x: 225,
          y: 110,
          w: 10,
          h: 130,
          color: "red",
        },
        {
          x: 30,
          y: 240,
          w: 200,
          h: 8,
          color: "red",
        },
        {
          x: 20,
          y: 120,
          w: 42,
          h: 8,
          color: "red",
        },
        {
          x: 54,
          y: 90,
          w: 8,
          h: 30,
          color: "red",
        },
        {
          x: 64,
          y: 76,
          w: 44,
          h: 18,
          color: "red",
        },
        {
          x: 129,
          y: 76,
          w: 43,
          h: 18,
          color: "red",
        },
        {
          x: 175,
          y: 80,
          w: 8,
          h: 30,
          color: "red",
        },
        {
          x: 185,
          y: 102,
          w: 42,
          h: 8,
          color: "red",
        },
      ],
      triggers: [
        {
          x: 110,
          y: 75,
          w: 16,
          h: 5,
          color: "yellow",
          actions: [new ChangeMap("kitchen", 32, 64), new StandEvent("down", 100)],
        },
      ],
    };
    super(config);
  }
}
