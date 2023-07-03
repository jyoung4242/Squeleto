// import needed Squeleto modules
import { GameObject } from "../../_Squeleto/GameObject";
import { TileMap } from "../../_Squeleto/LevelEditor";
import { GameMap, MapConfig } from "../../_Squeleto/MapManager";

// bring in tilemap level editor file
import { mainMap } from "../TileMap/myTileMap";

// all maps are an extension of the GameMap object
export class myMap extends GameMap {
  static who: GameObject;
  constructor(assets: any, level: TileMap) {
    let config: MapConfig = {
      name: "myMap",
      width: 576,
      height: 176,
      // maps can be built up of many layers, in this demo, we have a
      // background image, and the 'built' image from the level editor
      layers: [assets.image("mybgnd").src, level.tileMapImage.src],
      // walls are collision bodies, but in this demo, the level editor provides
      // them automatically
      walls: [...level.walls],
      // no cutscene triggers in this demo
      triggers: [],
    };
    super(config);
  }

  static async create(assets: any) {
    // this brings the level editor into the fold
    // and lets it generate the image prior to calling the constructor
    const level = await mainMap.create(assets);
    return new myMap(assets, level);
  }
}
