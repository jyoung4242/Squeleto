import { collisionBody } from "./MapManager";

export type TileConfig = {
  src: HTMLImageElement;
  tileWidth: number;
  tileHeight: number;
  offsetX?: number;
  offsetY?: number;
};

export type TileSetConfig = {
  src: HTMLImageElement;
  tileSetWidth: number;
  tileSetHeight: number;
  rows: number;
  cols: number;
};

export type TileMapConfig = {
  template: Array<string>;
  tileSize: number;
  rows: number;
  cols: number;
};

export class Tile {
  asset;
  x;
  y;
  w;
  h;
  constructor(config: TileConfig) {
    this.asset = config.src;
    this.w = config.tileWidth;
    this.h = config.tileHeight;
    config.offsetX ? (this.x = config.offsetX) : (this.x = null);
    config.offsetY ? (this.y = config.offsetY) : (this.y = null);
  }
}

export class TileSet {
  src;
  w;
  h;
  rows;
  cols;
  constructor(config: TileSetConfig) {
    this.src = config.src;
    this.w = config.tileSetWidth;
    this.h = config.tileSetHeight;
    this.rows = config.rows;
    this.cols = config.cols;
  }
}

export class TileMap {
  template: Array<string>;
  tilesize: number = 16;
  numColumns: number = 8;
  numRows: number = 8;
  mappedTiles = new Map<string, { tile: Tile; wall: boolean }>();
  tileMapImage = new Image();
  backgroundImage: HTMLImageElement | undefined;
  walls: Array<collisionBody> = [];

  constructor(config: TileMapConfig) {
    //grab data
    this.tilesize = config.tileSize;
    this.numColumns = config.cols;
    this.numRows = config.rows;
    this.template = config.template;
  }

  setTileMapConfig(map: Map<string, { tile: Tile; wall: boolean }>) {
    this.mappedTiles = map;
  }

  setBackground(bgnd: HTMLImageElement) {
    this.backgroundImage = bgnd;
  }

  async initialize(): Promise<void> {
    //setup virtual canvas
    const virtualCanvas = new OffscreenCanvas(this.tilesize * this.numColumns, this.tilesize * this.numRows);
    const vCtx = virtualCanvas.getContext("2d");
    //applying background image
    if (this.backgroundImage instanceof HTMLImageElement && vCtx) vCtx.drawImage(this.backgroundImage, 0, 0);
    //setup x,y locations of each tile spot
    let tileLocations: any = {};
    const numTiles = this.numColumns * this.numRows;
    for (let index = 0; index < numTiles; index++) {
      const myX = index % this.numColumns;
      const myY = Math.floor(index / this.numColumns);
      tileLocations[`${myX}-${myY}`] = {
        x: (index % this.numColumns) * this.tilesize,
        y: Math.floor(index / this.numColumns) * this.tilesize,
      };
    }

    //start parsing template and drawing tile at designated location
    this.template.forEach((row, rowIndex) => {
      const parsedChars = [...row];
      parsedChars.forEach((char, colIndex) => {
        if (char == " ") return;

        const nextTile = this.mappedTiles.get(char);

        const tileLocation = tileLocations[`${colIndex}-${rowIndex}`];
        if (nextTile?.wall) {
          this.walls.push({
            w: nextTile.tile.w,
            h: nextTile.tile.h,
            x: tileLocation.x,
            y: tileLocation.y,
            color: "red",
          });
        }
        if (nextTile && (nextTile.tile.x == null || nextTile.tile.y == null)) {
          if (vCtx)
            vCtx.drawImage(
              nextTile.tile.asset as HTMLImageElement,
              nextTile.tile.x as number,
              nextTile.tile.y as number,
              nextTile.tile.w,
              nextTile.tile.h,
              tileLocation.x,
              tileLocation.y,
              nextTile.tile.w,
              nextTile.tile.h
            );
        } else if (nextTile && vCtx) {
          vCtx.drawImage(nextTile.tile.asset as HTMLImageElement, tileLocation.x, tileLocation.y);
        }
      });
    });

    const myBlob: Blob = await virtualCanvas.convertToBlob();
    const myImageURl = await this.blobToDataUrl(myBlob);
    this.tileMapImage.src = myImageURl;
  }

  async blobToDataUrl(blob: Blob) {
    return new Promise(r => {
      let a = new FileReader();
      a.onload = r;
      a.readAsDataURL(blob);
    }).then((e: any) => e.target.result);
  }
}
