import { GameObject, GameObjectConfig, interaction } from "../../_Squeleto/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { InputManager } from "../../_Squeleto/InputManager";
import { Spritesheet, AnimationSequence } from "../../_Squeleto/Spritesheet";
import { State, States } from "@peasy-lib/peasy-states";
import { CollisionManager, direction } from "../../_Squeleto/CollisionManager";
import { GameMap } from "../../_Squeleto/MapManager";

const MAX_WALKING_SPEED = 1.5;
const DETECTION_DISTANCE = 25;

export class Player extends GameObject {
  isLeftArrowDown = false;
  isRightArrowDown = false;
  isUpArrowDown = false;
  isDownArrowDown = false;
  collisionbodyoffsetX = 0;
  collisions = new CollisionManager();
  animationHandler;
  isMoving: boolean = false;
  isCutscenePlaying = false;
  direction: direction = "down";
  walkingstates = new WalkingStates();
  isCheckForInteractions = false;
  demosequence = {
    "run-left": [3, 4, 5],
    "run-right": [-3, -4, -5],
    "idle-left": [0, 1, 2],
    "idle-right": [-0, -1, -2],
    "jump-left": [6],
    "jump-right": [-6],
    "jfire-left": [16],
    "jfire-right": [-16],
    "rfire-left": [13, 14, 15],
    "rfire-right": [-13, -14, -15],
    "ifire-left": [10],
    "ifire-right": [-10],
  };
  isStickIdleLeft = false;
  isStickIdleRight = false;
  isStickIdleUp = false;
  isStickIdleDown = false;

  constructor(assets: any) {
    let heroSpritesheet = new Spritesheet(assets.image("mm").src, 100, 10, 10, 48, 48);
    heroSpritesheet.initialize();

    let config: GameObjectConfig = {
      name: "Player",
      startingMap: "myMap",
      initX: 30,
      initY: 65,
      width: 48,
      height: 48,
      sprites: [heroSpritesheet],
      collisionBody: {
        width: 48,
        height: 48,
        offsetX: 0,
        offsetY: 0,
        color: "blue",
      },
    };
    super(config);

    this.isPlayable = true;
    this.animationHandler = new AnimationSequence(heroSpritesheet, this.animationUpdate, this.demosequence, 150);
    this.animationHandler.changeSequence("idle-left");
    this.walkingstates.register(isWalking, isIdle);
    this.walkingstates.set(isIdle, performance.now(), "left", "idle-left", this);

    /***********************************
     * using the Input Manager, sets up
     * peasy-input with proper callbacks
     * ******************************* */
    InputManager.register({
      Keyboard: {
        ArrowLeft: {
          name: "leftA",
          callback: this.leftArrow,
          options: { repeat: false },
        },
        ArrowRight: {
          name: "rightA",
          callback: this.rightArrow,
          options: { repeat: false },
        },
        " ": {
          name: "space",
          callback: this.jump,
          options: { repeat: false },
        },
        Enter: {
          name: "fire",
          callback: this.fire,
          options: { repeat: true },
        },
        release: {
          callback: this.releasedKey,
        },
      },
    });
  }

  /***********************************
   * update callback for the
   * animation handler
   * ******************************* */
  animationUpdate = () => (this.spriteLayers[1].animationBinding = this.animationHandler.getFrameDetails());

  /***********************************
   * peasy-engine renderer and physics
   * gameloop callbacks for each entity
   * ******************************* */
  update(deltaTime: number, objects: Array<GameObject>, currentMap: GameMap): boolean {
    return true;
  }

  physicsUpdate(deltaTime: number, objects: Array<GameObject>, currentMap: GameMap, storyFlags: any): boolean {
    //check for object/object collisions
    //filter playable characters out
    if (!currentMap) return true;
    let otherObjects = objects.filter(oo => {
      return this.id != oo.id && oo.currentMap == currentMap.name;
    });
    this.collisionDirections = [];

    /***********************************
     *  object/object collision check
     * ******************************* */
    otherObjects.forEach(o => {
      o.collisionLayers.forEach(cl => {
        let colResult = this.collisions.isObjectColliding({ w: cl.w, h: cl.h, x: cl.x + o.xPos, y: cl.y + o.yPos }, this);
        this.isColliding = colResult.status;
        this.collisionDirections.push(...colResult.collisionDirection);
      });
    });

    /***********************************
     * wall/object collision check
     * ******************************* */
    if (currentMap) {
      currentMap.layers.forEach(ml => {
        ml.wallLayers.forEach(wl => {
          let colResult = this.collisions.isObjectColliding(
            { w: wl.w, h: wl.h, x: wl.x + ml.xPos, y: wl.y + ml.yPos },
            this
          );
          this.isColliding = colResult.status;
          this.collisionDirections.push(...colResult.collisionDirection);
        });
      });
    }

    /***********************************
     * all checks are complete, adjust player's position
     * assuming there are no collisions
     * ******************************* */
    if (this.isMoving && !this.isCutscenePlaying) {
      switch (this.direction) {
        case "down":
          if (!this.isDirectionInArray("down")) this.yPos += MAX_WALKING_SPEED;
          break;
        case "up":
          if (!this.isDirectionInArray("up")) this.yPos -= MAX_WALKING_SPEED;
          break;
        case "left":
          if (!this.isDirectionInArray("left")) this.xPos -= MAX_WALKING_SPEED;
          break;
        case "right":
          if (!this.isDirectionInArray("right")) this.xPos += MAX_WALKING_SPEED;
          break;
      }
    }
    return true;
  }

  /***********************************
   * these are the keypress callbacks
   * bound by peasy-input
   * ******************************* */
  leftArrow = () => {
    this.walkingstates.set(isWalking, performance.now(), "left", "walk-left", this);
  };
  rightArrow = () => {
    this.walkingstates.set(isWalking, performance.now(), "right", "walk-right", this);
  };
  jump = () => {};
  fire = () => {
    this.walkingstates.set(isWalking, performance.now(), "up", "walk-up", this);
  };
  releasedKey = (key: string) => {
    switch (key) {
      case "leftA":
        this.isLeftArrowDown = false;
        break;
      case "rightA":
        this.isRightArrowDown = false;
        break;
    }
    if (!this.isRightArrowDown && !this.isLeftArrowDown && !this.isDownArrowDown && !this.isUpArrowDown)
      this.walkingstates.set(isIdle, performance.now(), this.direction, `idle-${this.direction}`, this);
  };

  /***********************************
   * this is the utility function that
   * parses the collision array for
   * directionaly collision
   * ******************************* */
  isDirectionInArray(dir: string): boolean {
    return this.collisionDirections.find(d => d == dir) != undefined;
  }
}

/***********************************
 * animation states for managing differet
 * animation sequences, uses peasy-states
 * ******************************* */
class WalkingStates extends States {}
class isWalking extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let newDirection = params[0];
    let newSequence = params[1];
    let parentClass = params[2];
    if (parentClass.direction != newDirection) parentClass.direction = newDirection;
    parentClass.animationHandler.changeSequence(newSequence, 0);
    if (!parentClass.isMoving) parentClass.animationHandler.startAnimation();
    parentClass.isMoving = true;
  }
  exit() {}
}
class isIdle extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    if (parentClass.isMoving) {
      parentClass.isMoving = false;
      parentClass.animationHandler.changeSequence(`idle-${parentClass.direction}`, 0);
      parentClass.animationHandler.updateFrame();
      parentClass.animationHandler.pauseAnimation();
    }
  }
  exit() {}
}
