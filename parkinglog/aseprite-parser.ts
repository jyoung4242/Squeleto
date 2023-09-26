import { inflate } from "pako";

/* Aseprite-parser.ts - 6/30/2023 - version 1.0.8
Author: Justin Young

exported types:
AsepriteHeader, AsepriteFrame, AspriteTag, SpriteSheetOptions

exported class AsepriteModule{}

constructor
@params -> either the relative path to an *.Aseprite or *.ase file, or passing the file itself

usage:
const myAsepriteFile = new AsepriteModule(myasefile);
await myAsepriteFile.initialize()

... then you can call one of several methods
getTags(), getPalette(), getTaggedAnimation(), getFrames(), getSpriteSheet(), getImage()

*/

export interface AsepriteHeader {
  fileSize: number;
  imageWidth: number;
  imageHeight: number;
  frameCount: number;
  colorDepth: number;
}

export interface AsepriteFrame {
  layers: Array<FrameLayer>;
  duration: number;
  image: HTMLImageElement;
}

export interface AsepriteLayer {
  layerID: number;
  layerName: string;
}

export interface AsepriteTag {
  startIndex: number;
  endIndex: number;
  tagName: string;
}

interface FrameLayer {
  layerID: number;
  position: { x: number; y: number };
  size: { w: number; h: number };
  imageData: Uint8Array;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface SpriteSheetOptions {
  /**
   * Frames: Array<number>
   */
  frames: Array<number> | "all";
  /**
   *rows: number - number of rows in spritesheet
   */
  rows: number;
  /**
   *cols: number - number of columns in spritesheet
   */
  cols: number;
}

enum chunktype {
  OldPalletChunk1 = 0x4,
  OldPalletChunk2 = 0x11,
  LayerChunk = 0x2004,
  CelChunk = 0x2005,
  CelExtraChunk = 0x2006,
  ColorProfileChunk = 0x2007,
  ExternalFilesChunk = 0x2008,
  MaskChunk = 0x2016,
  TagsChunk = 0x2018,
  PalletChunk = 0x2019,
  UserDataChunk = 0x2020,
  SliceChunk = 0x2022,
  TileSetChunk = 0x2023,
}

export class AsepriteParser {
  //Properties
  file: File | undefined;
  filepath: string = "";
  reader: FileReader;
  public loaded: boolean = false;
  public header: AsepriteHeader | undefined;
  public frames: Array<AsepriteFrame>;
  public tags: Array<AsepriteTag>;
  public layers: Array<AsepriteLayer>;
  public palette: Array<string>;

  /*Public Methods */
  constructor(file: File | string) {
    if (typeof file == "string") {
      this.filepath = file;
      this.file = undefined;
    } else {
      this.file = file;
      this.filepath = "";
    }

    this.reader = new FileReader();
    this.tags = [];
    this.palette = [];
    this.layers = [];
    this.frames = [];
  }

  /**
   * initialize - requiired call prior to making other calls
   * reads in and parses asepreite or ase file
   * Asynchronous function
   * @returns Promise<boolean>
   */

  async initialize(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      //do stuff with class

      if (this.filepath !== "") {
        let response = await fetch(this.filepath);
        let data = await response.blob();
        this.file = new File([data], "");
      }

      this.reader.onload = async event => {
        if (!event.target || !event.target.result) {
          throw new Error("Failed to read file.");
        }

        const fileData = new Uint8Array(event.target.result as ArrayBuffer);
        this.header = await this._parseHeader(fileData);
        this.frames = await this._parseFrames(fileData);

        if (!this.header || !this.frames) reject(this.loaded);
        if ((this.header as AsepriteHeader).fileSize != 0 && (this.frames as Array<AsepriteFrame>).length != 0) {
          this.loaded = true;
        }
        resolve(this.loaded);
      };

      this.reader.onerror = event => {
        throw new Error("Failed to read file.");
      };
      this.reader.readAsArrayBuffer(this.file as File);
    });
  }

  /**
   * getTags() returns the parsed animation tags from the Aseprite file
   * @returns Array<AsepriteTag>
   */

  getTags(): Array<AsepriteTag> {
    if (!this.loaded) throw new Error("Aseprite file not loaded");
    return this.tags as Array<AsepriteTag>;
  }

  /**
   * getPalette - returns the array of colors that are in the aseprite file
   * @returns Array<string>
   */

  getPalette() {
    if (!this.loaded) throw new Error("Aseprite file not loaded");
    return this.palette as Array<string>;
  }

  /**
   * getTaggedAnimation - finds the animation tag from aseprite and uses the frame indexes associated
   * to return either the spritesheet or an array of images associated with that tag, throws error
   * if it cannot find that tag
   * Asynchronous function
   * @param {string} tag - the string text that is listed in the aseprite file for a collection of frames
   * @param {boolean} split  - the boolean flag to return a spritesheet (false), or an array of images (true)
   * @returns {HTMLImageElement|Array<HTMLImageElement>}
   */

  async getTaggedAnimation(tag: string, split: boolean = true): Promise<Array<HTMLImageElement> | HTMLImageElement> {
    if (!this.loaded) throw new Error("Aseprite file not loaded");
    //find tag

    const foundTag = this.tags.findIndex(tagstring => tag == tagstring.tagName);
    if (foundTag == -1) throw new Error("tagname not found");
    //tagindex found
    const result = await this.getFrames(this.tags[foundTag].startIndex, this.tags[foundTag].endIndex, split);
    return result;
  }

  /**
   * getFrames - returns specific frame content as spritesheet or array of images
   * Asynchronous function
   * @param {number} from - starting index for retrieving image frames
   * @param {number} to - ending index for retrieving image frames
   * @param {boolean} split - the boolean flag to return a spritesheet (false), or an array of images (true)
   * @returns {HTMLImageElement|Array<HTMLImageElement>}
   */
  async getFrames(from: number, to: number, split: boolean = true): Promise<Array<HTMLImageElement> | HTMLImageElement> {
    if (!this.loaded) throw new Error("Aseprite file not loaded");
    if (split) {
      let tempArray: Array<HTMLImageElement> = [];
      for (let index = from; index <= to; index++) {
        tempArray.push(this.frames[index].image);
      }
      return tempArray;
    } else {
      let tempArray: Array<number> = [];
      //console.log(from, to);
      for (let index = from; index <= to; index++) {
        tempArray.push(index);
      }
      //console.log(tempArray);
      const tempImage = await this._makeSpriteSheet(tempArray, 1, tempArray.length);
      return tempImage;
    }
  }

  /**
   * getSpriteSheet - returns a spritesheet based on options parameters
   * Asynchronous function
   * @param {SpriteSheetOptions} options - frames, rows, cols
   * @returns {HTMLImageElement}
   */
  async getSpriteSheet(options: SpriteSheetOptions): Promise<HTMLImageElement> {
    if (!this.loaded) throw new Error("Aseprite file not loaded");
    const tempImage = await this._makeSpriteSheet(options.frames, options.rows, options.cols);
    return tempImage;
  }

  /**
   * getImage - pulls the image element for given frame
   * @param {number} frame - number representing the index of the frame to pull image from
   * @returns {HTMLIFrameElement}
   */
  getImage(frame: number): HTMLImageElement | undefined {
    this._loadCheck();
    if (!this.frames) return undefined;
    return this.frames[frame].image;
  }

  /*Private Methods */
  private async _parseHeader(fileData: Uint8Array): Promise<AsepriteHeader> {
    return new Promise((resolve, reject) => {
      //isolate Aseprite Header
      const headerBytes = fileData.slice(0, 128);
      // Parse the header fields
      const fileSize = new DataView(headerBytes.buffer).getUint32(0, true);
      const frameCount = new DataView(headerBytes.buffer).getUint16(6, true);
      const imageWidth = new DataView(headerBytes.buffer).getUint16(8, true);
      const imageHeight = new DataView(headerBytes.buffer).getUint16(10, true);
      const colorDepth = new DataView(headerBytes.buffer).getUint16(12, true);
      resolve({ fileSize, imageWidth, imageHeight, colorDepth, frameCount });
    });
  }

  private _parseFrames = async (fileData: Uint8Array): Promise<Array<AsepriteFrame>> => {
    return new Promise(async (resolve, reject) => {
      let numBytesinFrame = 0;
      let magicWord = 0;
      let oldChunks, newChunks, numChunks;
      let frameDuration: number = 0;
      let newPalletChunk = false;
      let framelayers = <any>[];

      //remove Aseprite Header
      const frameBytes = fileData.slice(128);
      let fileCursor = 0;
      const tempFrames = <any>[];

      for (let frameIndex = 0; frameIndex < (this.header as AsepriteHeader).frameCount; frameIndex++) {
        numBytesinFrame = new DataView(frameBytes.buffer).getUint32(fileCursor, true);
        magicWord = new DataView(frameBytes.buffer).getUint16(fileCursor + 4, true);
        oldChunks = new DataView(frameBytes.buffer).getUint16(fileCursor + 6, true);
        frameDuration = new DataView(frameBytes.buffer).getUint16(fileCursor + 8, true);
        newChunks = new DataView(frameBytes.buffer).getUint32(fileCursor + 12, true);
        numChunks = newChunks === 0 ? oldChunks : newChunks;

        fileCursor += 16;
        //iterate over chunks
        framelayers = [];
        for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
          //Chunk Parsing
          let chunkSize = new DataView(frameBytes.buffer).getUint32(fileCursor, true);
          const chunkStartIndex = fileCursor;
          let chunkType: chunktype = new DataView(frameBytes.buffer).getUint16(fileCursor + 4, true);

          switch (chunkType) {
            case chunktype.OldPalletChunk1:
              if (newPalletChunk) break;
              break;
            case chunktype.OldPalletChunk2:
              if (newPalletChunk) break;
              break;
            case chunktype.LayerChunk:
              this._readLayersChunk(fileCursor, frameBytes.buffer);
              break;
            case chunktype.CelChunk:
              let frameLayer = this._readCelChunk(fileCursor, frameBytes, chunkSize, chunkStartIndex);
              framelayers.push(frameLayer);
              break;
            case chunktype.CelExtraChunk:
              break;
            case chunktype.ColorProfileChunk:
              break;
            case chunktype.ExternalFilesChunk:
              break;
            case chunktype.MaskChunk:
              break;
            case chunktype.TagsChunk:
              this._readTagsChunk(fileCursor, frameBytes);
              break;
            case chunktype.PalletChunk:
              this._readPalletChunk(fileCursor, frameBytes);
              break;
            case chunktype.UserDataChunk:
              break;
            case chunktype.SliceChunk:
              break;
            case chunktype.TileSetChunk:
              break;
          }
          fileCursor += chunkSize;

          //Last Chunk, build out frame data
          if (chunkIndex == numChunks - 1) {
            let myCanvas = document.createElement("canvas");
            myCanvas.width = this.header?.imageWidth as number;
            myCanvas.height = this.header?.imageHeight as number;
            let ctx = myCanvas.getContext("2d");
            ctx?.clearRect(0, 0, this.header?.imageWidth as number, this.header?.imageHeight as number);

            //build out frame entry in array
            framelayers.forEach((frame: any) => {
              let myClampedArray = new Uint8ClampedArray(frame?.imageData as Uint8Array);
              const newImageData = new ImageData(myClampedArray, frame?.size.w as number, frame?.size.h as number);
              let tempCanvas = document.createElement("canvas");
              tempCanvas.width = frame.size.w;
              tempCanvas.height = frame.size.h;
              let tempctx = tempCanvas.getContext("2d");
              tempctx?.putImageData(newImageData, 0, 0);
              ctx?.drawImage(tempCanvas, frame.position.x, frame.position.y, frame.size.w, frame.size.h);
            });
            //all imagedata is drawn to canvas
            //grab canvas image and set frame image to that
            let frameImage = new Image(this.header?.imageWidth, this.header?.imageHeight);
            await this._asyncLoadImageSrc(frameImage, myCanvas.toDataURL());

            tempFrames.push({
              layers: framelayers as Array<FrameLayer>,
              duration: frameDuration as number,
              image: frameImage,
            });
          }
        }
      }

      resolve(tempFrames);
    });
  };

  private _convertRGBAtoHexSTring(color: Color): string {
    function padTo2(str: string): string {
      return str.padStart(2, "0");
    }
    const hexR = padTo2(color.r.toString(16));
    const hexG = padTo2(color.g.toString(16));
    const hexB = padTo2(color.b.toString(16));
    const hexA = padTo2(color.a.toString(16));
    return `#${hexR}${hexG}${hexB}${hexA}`;
  }

  private async _makeSpriteSheet(frames: Array<number> | "all", rows: number, cols: number): Promise<HTMLImageElement> {
    if (!this.loaded) throw new Error("Aseprite file not loaded");
    let tempFrames = [];
    let rowIndex = 0;
    let colIndex = 0;
    let ssWidth = 0;
    let ssHeight = 0;
    if (this.header) {
      ssWidth = this.header.imageWidth * cols;
      ssHeight = this.header.imageHeight * rows;
    }
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = ssWidth;
    tempCanvas.height = ssHeight;
    let tempCtx = tempCanvas.getContext("2d");
    let tempImage = new Image(ssWidth, ssHeight);
    let imageIndex = 0;
    if (frames === "all") {
      //console.log(this.header?.frameCount);

      if (this.header)
        for (let index = 0; index < this.header?.frameCount; index++) {
          //console.log("loop index: ", index);
          tempFrames.push(index);
        }
    } else {
      tempFrames = [...frames];
    }
    //console.log(tempFrames);

    tempFrames.forEach(frame => {
      colIndex = imageIndex % cols;
      rowIndex = Math.floor(imageIndex / cols);
      let drawX, drawY;
      if (this.header) drawX = colIndex * this.header?.imageWidth;
      if (this.header) drawY = rowIndex * this.header?.imageHeight;
      //console.log(rowIndex, colIndex, drawX, drawY);

      tempCtx?.drawImage(this.frames[frame].image, drawX as number, drawY as number);
      imageIndex++;
    });

    await this._asyncLoadImageSrc(tempImage, tempCanvas.toDataURL());
    return tempImage;
  }

  private _readByteString(frameBuffer: ArrayBuffer, startingIndex: number, length: number): string {
    const myStringArray = new Uint8Array(length);
    for (let i = 0; i < myStringArray.length; i++) {
      myStringArray[i] = new DataView(frameBuffer).getUint8(startingIndex + i);
    }
    let decoder = new TextDecoder();
    return decoder.decode(myStringArray);
  }

  private _getBytes(n: number, start: number, buffer: Uint8Array) {
    return new Uint8Array(buffer.slice(start, start + n));
  }

  private _readLayersChunk(cursor: number, buffer: ArrayBuffer) {
    let layerCursor = cursor + 6;
    let layerNameLength = new DataView(buffer).getInt16(layerCursor + 16, true);
    layerCursor += 18;
    let layerName = this._readByteString(buffer, layerCursor, layerNameLength);
    let layerID = this.layers?.length;
    this.layers?.push({ layerID: layerID as number, layerName: layerName });
  }

  private _readTagsChunk(cursor: number, parentbuffer: Uint8Array) {
    let tagsChunkOffsetCursor = cursor + 6;

    let buffer = parentbuffer.buffer;
    let numTags = new DataView(buffer).getUint16(tagsChunkOffsetCursor, true);

    tagsChunkOffsetCursor += 10;
    for (let index = 0; index < numTags; index++) {
      let fromIndex = new DataView(buffer).getUint16(tagsChunkOffsetCursor, true);
      let toIndex = new DataView(buffer).getUint16(tagsChunkOffsetCursor + 2, true);
      tagsChunkOffsetCursor += 17;
      let nameLength = new DataView(buffer).getUint16(tagsChunkOffsetCursor, true);
      tagsChunkOffsetCursor += 2;
      let tagName = this._readByteString(buffer, tagsChunkOffsetCursor, nameLength);
      tagsChunkOffsetCursor += nameLength;
      this.tags?.push({
        startIndex: fromIndex,
        endIndex: toIndex,
        tagName: tagName,
      });
    }
  }

  private _readPalletChunk(cursor: number, parentbuffer: Uint8Array) {
    let palletCursor = cursor + 6;
    let buffer = parentbuffer.buffer;
    let newPalletSize = new DataView(buffer).getUint32(palletCursor, true);
    palletCursor += 20;
    for (let index = 0; index < newPalletSize; index++) {
      let red = new DataView(buffer).getUint8(palletCursor + 2);
      let green = new DataView(buffer).getUint8(palletCursor + 3);
      let blue = new DataView(buffer).getUint8(palletCursor + 4);
      let alpha = new DataView(buffer).getUint8(palletCursor + 5);
      let colorstring = this._convertRGBAtoHexSTring({ r: red, g: green, b: blue, a: alpha });
      this.palette?.push(colorstring);
    }
  }

  private _readCelChunk(cursor: number, parentbuffer: Uint8Array, size: number, startIndex: number): FrameLayer | undefined {
    let celCursor = cursor + 6;
    let buffer = parentbuffer.buffer;
    let framelayers = [];
    let layer = new DataView(buffer).getUint16(celCursor, true);
    let xpos = new DataView(buffer).getInt16(celCursor + 2, true);
    let ypos = new DataView(buffer).getInt16(celCursor + 4, true);
    let opacity = new DataView(buffer).getUint8(celCursor + 6);
    let celType = new DataView(buffer).getUint16(celCursor + 7, true);
    let zindex = new DataView(buffer).getInt16(celCursor + 9, true);
    let pixelWidth, pixelHeight;

    celCursor += 16;
    switch (celType) {
      case 0:
        //raw image
        break;
      case 1:
        //linked cell
        break;
      case 2:
        //compressed image
        pixelWidth = new DataView(buffer).getUint16(celCursor, true);
        pixelHeight = new DataView(buffer).getUint16(celCursor + 2, true);
        celCursor += 4;
        const bytesToRead = size - (celCursor - startIndex);
        let compressedArray = this._getBytes(bytesToRead, celCursor, parentbuffer);
        let decompressedArray;
        try {
          decompressedArray = inflate(compressedArray);
        } catch (error) {
          throw new Error("Error unpacking compressed Image");
        }
        return {
          layerID: layer,
          position: { x: xpos, y: ypos },
          size: { w: pixelWidth, h: pixelHeight },
          imageData: decompressedArray as Uint8Array,
        };
        break;

      case 3:
        //compressed tilemap
        break;
    }
  }

  private _loadCheck() {
    if (!this.loaded) throw new Error("Aseprite file not loaded");
  }

  private _asyncLoadImageSrc(image: HTMLImageElement, src: any): Promise<void> {
    return new Promise((resolve, reject) => {
      image.onload = () => {
        resolve();
      };
      image.onerror = () => {
        reject();
      };
      image.src = src;
    });
  }
}
