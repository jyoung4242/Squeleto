import { GameObject } from "../../_Squeleto/GameObject";
import { TileMap } from "../../_Squeleto/LevelEditor";
import { GameMap, MapConfig } from "../../_Squeleto/MapManager";
import { mainMap } from "../TileMap/myTileMap";

export class myMap extends GameMap {
  static who: GameObject;
  constructor(assets: any, level: TileMap) {
    let config: MapConfig = {
      name: "myMap",
      width: 192,
      height: 192,
      layers: [assets.image("mybgnd").src, level],
      walls: [...level.walls],
      triggers: [],
    };
    super(config);
  }

  static async create(assets: any) {
    const level = await mainMap.create();
    return new myMap(assets, level);
  }
}
