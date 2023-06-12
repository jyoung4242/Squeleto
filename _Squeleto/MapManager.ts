import { v4 as uuidv4 } from "uuid";
import { EventManager } from "./EventManager";
import { GameObject } from "./GameObject";

export type collisionBody = {
  x: number;
  y: number;
  w: number;
  h: number;
  actions?: any[];
  color?: string;
};

export type MapConfig = {
  name: string;
  width: number;
  height: number;
  layers: string[];
  walls: collisionBody[];
  triggers: collisionBody[];
};

export type MapLayer = {
  name: string;
  id: string;
  class: string;
  width: number;
  height: number;
  src: string;
  zIndex: number;
  xPos: number;
  yPos: number;
  wallLayers: Array<collisionBody>;
  triggerLayers: Array<collisionBody>;
  isCollisionLayersVisible: boolean;
};

export class GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  spriteLayers = [];
  collisionLayers: Array<collisionBody> = [];
  layers: Array<MapLayer> = [];
  walls: Array<collisionBody> = [];
  triggers: Array<collisionBody> = [];

  constructor(config: MapConfig) {
    this.id = uuidv4();
    this.name = config.name;
    this.width = config.width;
    this.height = config.height;
    this.walls = [...config.walls];
    this.triggers = [...config.triggers];

    config.layers.forEach((lyr, index) => {
      const numLayers = config.layers.length;

      if (index == numLayers - 1) {
        this.layers.push({
          id: uuidv4(),
          name: this.name,
          class: "map",
          width: this.width,
          height: this.height,
          src: lyr,
          zIndex: index + 1,
          xPos: 0,
          yPos: 0,
          wallLayers: [...this.walls],
          triggerLayers: [...this.triggers],
          isCollisionLayersVisible: false,
        });
      } else {
        this.layers.push({
          id: uuidv4(),
          name: this.name,
          class: "map",
          width: this.width,
          height: this.height,
          src: lyr,
          zIndex: index + 1,
          xPos: 0,
          yPos: 0,
          wallLayers: [],
          triggerLayers: [],
          isCollisionLayersVisible: false,
        });
      }
    });
  }
  getMapSize = () => {
    return { width: this.width, height: this.height };
  };

  static create(config: MapConfig) {
    return new GameMap(config);
  }

  triggerCutscene(who: GameObject, Actions: Array<any>) {}
}
