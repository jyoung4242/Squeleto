import { Assets } from "@peasy-lib/peasy-assets";
import { TileMap, TileMapConfig, Tile } from "../../_Squeleto/LevelEditor";

//content
export class mainMap extends TileMap {
  constructor(config: TileMapConfig, assets: any) {
    super(config);
    //set background
    this.backgroundImage = assets.image("mybgnd");

    //Load Tiles
    let TileT1 = new Tile({ src: assets.image("mytiles"), tileWidth: 16, tileHeight: 16, offsetX: 0, offsetY: 0 });
    let TileT2 = new Tile({ src: assets.image("mytiles"), tileWidth: 16, tileHeight: 16, offsetX: 16, offsetY: 0 });
    let TileT3 = new Tile({ src: assets.image("mytiles"), tileWidth: 16, tileHeight: 16, offsetX: 32, offsetY: 0 });
    let TileT4 = new Tile({ src: assets.image("mytiles"), tileWidth: 32, tileHeight: 16, offsetX: 48, offsetY: 0 });

    //Assign Tiles
    let assignmentMap = new Map<string, { tile: Tile; wall: boolean }>();
    assignmentMap.set("#", { tile: TileT1, wall: true }); //wall
    assignmentMap.set("0", { tile: TileT2, wall: true }); //brick1
    assignmentMap.set("@", { tile: TileT3, wall: true }); //brick2
    assignmentMap.set("=", { tile: TileT4, wall: true }); //platform
    this.setTileMapConfig(assignmentMap);
  }

  static async create() {
    let map = [
      "#          #",
      "#          #",
      "#          #",
      "#    =     #",
      "#          #",
      "#          #",
      "#          #",
      "0@0@0@0@0@0@",
    ];
    let config: TileMapConfig = {
      template: map,
      tileSize: 16,
      rows: 8,
      cols: 12,
    };

    const mymap = new mainMap(config, Assets);
    await mymap.initialize();
    return mymap;
  }
}
