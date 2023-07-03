import { TileMap, TileMapConfig, Tile } from "../../_Squeleto/LevelEditor";

//all level editor files are an extention of the TileMap class
export class mainMap extends TileMap {
  constructor(config: TileMapConfig, assets: any) {
    super(config);
    /* //set background
    if you wanted to embed a background image into the level editor
    this is the call you would make, but in this demo, the background
    is added independently
    this.backgroundImage = assets.image("mybgnd"); 
    */

    // Load Tiles, two ways for this to be done, as individual images, in which tere's not offset parameters
    // or as one image, in this case, and you tell the level editor which tiles to grab via the offset
    let TileT1 = new Tile({ src: assets.image("mytiles"), tileWidth: 16, tileHeight: 16, offsetX: 0, offsetY: 0 });
    let TileT2 = new Tile({ src: assets.image("mytiles"), tileWidth: 16, tileHeight: 16, offsetX: 16, offsetY: 0 });
    let TileT3 = new Tile({ src: assets.image("mytiles"), tileWidth: 16, tileHeight: 16, offsetX: 32, offsetY: 0 });
    let TileT4 = new Tile({ src: assets.image("mytiles"), tileWidth: 32, tileHeight: 16, offsetX: 48, offsetY: 0 });

    // Assign Tiles
    // this is the magic, this association let's the tilemap editor
    // know how to paint what ascii characters in the map with which tiles
    // and if you want a wall created with that tile, set that flag
    // if wall is false, then no wall collision body will be added
    let assignmentMap = new Map<string, { tile: Tile; wall: boolean }>();
    assignmentMap.set("#", { tile: TileT1, wall: true }); //wall
    assignmentMap.set("0", { tile: TileT2, wall: true }); //brick1
    assignmentMap.set("@", { tile: TileT3, wall: true }); //brick2
    assignmentMap.set("=", { tile: TileT4, wall: true }); //platform

    // passing the assignment map to the tileeditor
    this.setTileMapConfig(assignmentMap);
  }

  static async create(assets: any) {
    // the map is the ascii representation of the level to be created
    // these ascii characters will be replaced by tiles in the image
    let map = [
      "#                                  #",
      "#                                  #",
      "#                                  #",
      "#                                  #",
      "#       =        =       =         #",
      "#                                  #",
      "#   =       =        =       =     #",
      "#                                  #",
      "#       =                =         #",
      "#                                  #",
      "0@0@0@0@0@0@0@0@0@0@0@0@0@0@0@0@0@0@",
    ];

    // set's up the dims of the level
    let config: TileMapConfig = {
      template: map,
      tileSize: 16,
      rows: 11,
      cols: 36,
    };

    // creates new map level, AND triggers async initialization
    // which generates the map.image for the map object
    const mymap = new mainMap(config, assets);
    await mymap.initialize();
    return mymap;
  }
}
