import { Engine } from "@peasy-lib/peasy-engine";
import { Camera, ShakeDirection } from "./Camera";
import { GameObjectConfig, GameObject } from "./GameObject";
import { MapConfig, GameMap, MapLayer } from "./MapManager";
import { EventManager, GameEvent } from "./EventManager";
import { StoryFlagManager } from "./StoryFlagManager";

export type RendererConfig = {
  state: typeof RenderState;
  objectRenderOrder: number;
  viewportDims: { width: number; aspectratio: number };
  storyFlags?: StoryFlagManager;
  renderingFPS: number;
  physicsFPS: number;
};

/*
 state: typeof RenderState,
    objectRenderOrder: number,
    storyFlags: any,
    viweportsize: { width: number; aspectratio: number }
*/

export type renderType = Array<MapLayer | GameObject>;
export const RenderState = {
  camera: Camera,
  events: EventManager,
  viewport: {
    width: 400,
    height: 3 / 2,
  },
  physics: {
    canvas: undefined,
    ctx: <CanvasRenderingContext2D | null>null,
  },
  gameObjects: {
    objects: [] as GameObject[],
  },
  maps: {
    currentMap: "",
    get getCurrentMap() {
      const mapIndex = this.maps.findIndex(m => m.name == this.currentMap);

      return this.maps[mapIndex];
    },
    maps: [] as GameMap[],
  },
  overlays: {
    isCollisionBodiesVisible: false,
    isWallsVisible: false,
    isTriggersVisible: false,
  },
  renderedObjects: <renderType>[],
  storyFlags: <StoryFlagManager | undefined>undefined,
};

//this will control Camera, Maps, and gameObjects
export class GameRenderer {
  static objectRenderOrder: number;
  static renderEngine: Engine;
  static physicsEngine: Engine;
  static state: typeof RenderState;

  static template = `
        <style>
        camera-static{
            position: absolute;
            top: 0;
            left:0;
            
        }
        
        camera-layer{
            position: relative;
            top: 0;
            left:0;
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
        }

        camera-flash{
            display: block;
            position: absolute;
            top: 0;
            left:0;
            width: 100%;
            height: 100%;
            background-color: white;
            opacity: 1;
            transition: opacity 0.2s;
            z-index: 999999;
        }
        camera-flash.pui-adding,
        camera-flash.pui-removing
        {
          opacity: 0;
        }
        
        .map, .gameObject, .object_sprite{
            top:0;
            left:0;
            position:absolute;
            display:block;
            background-repeat: no-repeat;
            
            
        }
        .object-sprite{
          position: absolute;
        }
        .border-box{
          position: absolute;
        }
        .canvas{
          width:100%;
          height:100%;
          z-index: 999999;
        }
        </style>
        
        <camera-static style="transform: translate(\${renderState.camera.xPos}px,\${renderState.camera.yPos}px); width: \${renderState.camera.cWidth}px; height:\${renderState.camera.cHeight}px; ">
            <camera-layer style="width: 100%; height: 100%;display: block;">
                <camera-flash class="camera-flash" \${===renderState.camera.isFlashEnabled}></camera-flash>
                <render-object id="\${obj.id}" data-type="\${obj.name}" class="\${obj.class}" style="transform: translate3d(\${obj.xPos}px, \${obj.yPos}px, 0px);z-index: \${obj.zIndex}; width: \${obj.width}px;height: \${obj.height}px;background-image:url('\${obj.src}');" \${obj<=*renderState.renderedObjects:id}>
                  <render-inner style="position: relative;display: block; width: 100%; height: 100%; top:0px; left: 0px">
                    <sprite-layer class="object_sprite" \${sl<=*obj.spriteLayers} style="z-index: \${sl.zIndex}; width: \${sl.width}px;height: \${sl.height}px;background-image:url('\${sl.src}');background-position: \${sl.animationBinding};"></sprite-layer>
                    <collision-layers \${===obj.isCollisionLayersVisible}>
                      <border-box class="border-box"  \${cl<=*obj.collisionLayers}  style="z-index: 9999;border: 1px solid \${cl.color}; top: \${cl.y}px; left:\${cl.x}px; width: \${cl.w}px; height: \${cl.h}px;"></border-box>
                      <trigger-box class="border-box"  \${tl<=*obj.triggerLayers} style="z-index: 9999;border: 1px solid \${tl.color}; top: \${tl.y}px; left:\${tl.x}px; width: \${tl.w}px; height: \${tl.h}px;"></trigger-box>
                      <wall-box class="border-box"  \${wl<=*obj.wallLayers} style="z-index: 9999;border: 1px solid \${wl.color}; top: \${wl.y}px; left:\${wl.x}px; width: \${wl.w}px; height: \${wl.h}px;"></wall-box>
                    </collision-layers>
                    </render-inner>
                </render-object>
            </camera-layer>
        </camera-static>
    `;

  static initialize(config: RendererConfig) {
    /*********************
     * state Initialization
     *********************  */
    GameRenderer.state = config.state;
    GameRenderer.state.viewport.width = config.viewportDims.width;
    GameRenderer.state.viewport.height = config.viewportDims.width * (1 / config.viewportDims.aspectratio);
    if (config.storyFlags) GameRenderer.state.storyFlags = config.storyFlags;
    GameRenderer.objectRenderOrder = config.objectRenderOrder;

    /*********************
     * Engine Initialization
     *********************  */
    GameRenderer.physicsEngine = Engine.create({
      callback: GameRenderer.physicsLoop,
      fps: config.physicsFPS,
      started: false,
    });
    GameRenderer.renderEngine = Engine.create({
      callback: GameRenderer.renderLoop,
      fps: config.renderingFPS,
      started: false,
    });

    /*********************
     * Camera Initialization
     *********************  */
    RenderState.camera.initialize(RenderState.viewport.width, RenderState.viewport.height);
  }

  //#region Objects
  static createObject(config: Array<GameObjectConfig | GameObject>) {
    config.forEach(cfg => {
      let entity;
      if (cfg instanceof GameObject) entity = cfg;
      else entity = GameObject.create(cfg);
      GameRenderer.state.gameObjects.objects.push(entity);
    });
  }

  static destroyObject(id: string) {}

  //#endregion

  //#region Maps

  static createMap(config: Array<MapConfig | GameMap>) {
    config.forEach(cfg => {
      if (cfg instanceof GameMap) GameRenderer.state.maps.maps.push(cfg);
      else GameRenderer.state.maps.maps.push(GameMap.create(cfg));
    });
  }

  static destroyMap(id: string) {}

  static async changeMap(name: string) {
    //console.log("in mapchange");
    GameRenderer.cameraFlash(750);
    await wait(75);
    GameRenderer.state.maps.currentMap = name;
    GameRenderer.cameraSize(GameRenderer.getMapSize());
  }

  static getMapSize() {
    return GameRenderer.state.maps.getCurrentMap.getMapSize();
  }

  static runMapCutscene() {}

  //#endregion

  //#region Engine

  static enginePause(engine?: string) {
    if (engine == "physics") GameRenderer.physicsEngine.pause();
    if (engine == "renderer") GameRenderer.renderEngine.pause();
    else {
      GameRenderer.physicsEngine.pause();
      GameRenderer.renderEngine.pause();
    }
  }

  static engineStart(engine?: string) {
    if (engine == "physics") GameRenderer.physicsEngine.start();
    if (engine == "renderer") GameRenderer.renderEngine.start();
    else {
      GameRenderer.physicsEngine.start();
      GameRenderer.renderEngine.start();
    }
  }

  static renderLoop(deltaTime: number, now: number) {
    if (GameRenderer.state.maps.getCurrentMap == undefined) return;
    GameRenderer.state.renderedObjects.length = 0;
    GameRenderer.state.gameObjects.objects.forEach(obj =>
      obj.update(
        deltaTime,
        GameRenderer.state.gameObjects.objects,
        GameRenderer.state.maps.getCurrentMap,
        GameRenderer.state.storyFlags
      )
    );

    //build out rendered objects for dom rendering
    //MAPS FIRST

    let numMapLayers = GameRenderer.state.maps.getCurrentMap.layers.length;
    const mapObjects = GameRenderer.state.gameObjects.objects.filter(obj => {
      return obj.currentMap == GameRenderer.state.maps.getCurrentMap.name;
    });

    let numGameObjects = mapObjects.length;

    for (let index = 0; index < numMapLayers; index++) {
      if (index >= GameRenderer.objectRenderOrder - 1) {
        GameRenderer.state.maps.getCurrentMap.layers[index].zIndex = index + numGameObjects + 1;
      } else GameRenderer.state.maps.getCurrentMap.layers[index].zIndex = index + 1;
      GameRenderer.state.renderedObjects.push(GameRenderer.state.maps.getCurrentMap.layers[index]);
    }
    //OBJECTS LAST
    //sort objects by ypos
    mapObjects.sort(function (a, b) {
      return b.collisionLayers[0].y + b.yPos - (a.collisionLayers[0].y + a.yPos);
    });

    for (let index = numGameObjects; index > 0; index--) {
      mapObjects[index - 1].zIndex = GameRenderer.objectRenderOrder - 1 + 1;
      GameRenderer.state.renderedObjects.push(mapObjects[index - 1]);
    }
    GameRenderer.state.camera.update(deltaTime, now);
  }

  static physicsLoop(deltaTime: number, now: number) {
    GameRenderer.state.gameObjects.objects.forEach(obj =>
      obj.physicsUpdate(
        deltaTime,
        GameRenderer.state.gameObjects.objects,
        GameRenderer.state.maps.getCurrentMap,
        GameRenderer.state.storyFlags
      )
    );
  }
  //#endregion

  //#region Camera
  static cameraFollow(who: string) {
    //find GameObject with name
    const goIndex = RenderState.gameObjects.objects.findIndex(go => go.name == who);
    if (goIndex != -1) RenderState.camera.follow(RenderState.gameObjects.objects[goIndex]);
  }

  static cameraFlash(duration: number) {
    RenderState.camera.flash(duration);
  }

  static cameraShake(who: GameObject, direction: ShakeDirection, magnitude: number, duration: number, interval: number) {
    RenderState.camera.shake(who, direction, magnitude, duration, interval);
  }

  static cameraSize(size: { width: number; height: number }) {
    RenderState.camera.cWidth = size.width;
    RenderState.camera.cHeight = size.height;
  }

  static showCollisionBodies(visible: boolean) {
    RenderState.gameObjects.objects.forEach(o => (o.isCollisionLayersVisible = visible));
    RenderState.maps.maps.forEach(m => m.layers.forEach(ml => (ml.isCollisionLayersVisible = visible)));
  }

  //#endregion
}

export class ChangeMap extends GameEvent {
  who: GameObject | undefined;
  newMap: string;
  newX: number;
  newY: number;

  constructor(mapname: string, x: number, y: number) {
    super("mapchange");
    this.who = undefined;
    this.newMap = mapname;
    this.newX = x;
    this.newY = y;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      //console.log("map change event, ", this.who, this.newMap);
      this.who.currentMap = this.newMap;
      GameRenderer.changeMap(this.newMap);
      this.who.xPos = this.newX;
      this.who.yPos = this.newY;
      resolve();
    });
  }
}

async function wait(delay: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delay));
}
