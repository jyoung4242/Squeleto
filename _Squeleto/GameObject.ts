import { v4 as uuidv4 } from "uuid";
import { Spritesheet } from "./Spritesheet";
import { Sprite } from "./Sprite";
import { direction } from "./CollisionManager";
import { GameMap, collisionBody } from "./MapManager";
import { GameEvent } from "./EventManager";
import { StoryFlagManager } from "./StoryFlagManager";

export type spriteLayer = Array<Sprite | Spritesheet>;

export type interaction = {
  conditions: { [key: string]: boolean } | "default";
  content: Array<GameEvent>;
};

export type GameObjectConfig = {
  startingMap: string;
  name: string;
  initX: number;
  initY: number;
  sprites: Array<Sprite | Spritesheet>;
  height: number;
  width: number;
  collisionBody?: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    color: string;
  };
};

export class GameObject {
  xPos = 0;
  yPos = 0;
  isPlayable: boolean = false;
  isColliding: boolean = false;
  collisionDirections: Array<direction> = [];
  velocity = { x: 0, y: 0 };
  id: string;
  name: string;
  zIndex: number;
  width: number;
  height: number;
  class = "gameObject";
  spriteLayers: spriteLayer = [];
  collisionLayers: Array<collisionBody> = [];
  wallLayers = []; //not used in Gameobjects
  triggerLayers = []; //not used in Gameobjects
  isCollisionLayersVisible = false;
  currentMap = "";
  interactionEvents: Array<interaction> = [];
  SM: StoryFlagManager | undefined;

  constructor(config: GameObjectConfig, StoryFlags?: StoryFlagManager) {
    this.name = config.name;
    this.id = uuidv4();
    this.zIndex = 2;
    this.height = config.height;
    this.width = config.width;
    this.spriteLayers = [...config.sprites];
    this.xPos = config.initX;
    this.yPos = config.initY;
    this.currentMap = config.startingMap;
    if (config.collisionBody) {
      this.collisionLayers.push({
        w: config.collisionBody.width,
        h: config.collisionBody.height,
        x: config.collisionBody.offsetX,
        y: config.collisionBody.offsetY,
        color: config.collisionBody.color,
      });
    }
    if (StoryFlags) this.SM = StoryFlags;
  }

  static create(config: GameObjectConfig) {
    return new GameObject(config);
  }

  startBehavior(behavior: string, ...params: any) {}

  update(deltaTime: number, objects: Array<GameObject>, currentMap: GameMap, storyFlags: any): boolean {
    return true;
  }
  physicsUpdate(deltaTime: number, objects: Array<GameObject>, currentMap: GameMap, storyFlags: any): boolean {
    return true;
  }
}
