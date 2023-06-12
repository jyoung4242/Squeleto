import { GameObject, GameObjectConfig, interaction } from "../../_Squeleto/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { InputManager } from "../../_Squeleto/InputManager";
import { Spritesheet, AnimationSequence } from "../../_Squeleto/Spritesheet";
import { State, States } from "@peasy-lib/peasy-states";
import { CollisionManager, direction } from "../../_Squeleto/CollisionManager";
import { GameMap } from "../../_Squeleto/MapManager";
import { EventManager } from "../../_Squeleto/EventManager";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";
import { DialogManager } from "../PlugIns/DialogueManager";

const MAX_WALKING_SPEED = 1.5;
const DETECTION_DISTANCE = 25;

export class Player extends GameObject {
  dm;
  isLeftArrowDown = false;
  isRightArrowDown = false;
  isUpArrowDown = false;
  isDownArrowDown = false;
  collisionbodyoffsetX = 0;
  collisions = new CollisionManager();
  cutscenes;
  animationHandler;
  isMoving: boolean = false;
  isCutscenePlaying = false;
  direction: direction = "down";
  walkingstates = new WalkingStates();
  isCheckForInteractions = false;
  demosequence = {
    "walk-up": [8, 9, 10, 11],
    "walk-down": [0, 1, 2, 3],
    "walk-left": [12, 13, 14, 15],
    "walk-right": [4, 5, 6, 7],
    "idle-down": [0],
    "idle-up": [8],
    "idle-left": [12],
    "idle-right": [4],
  };
  isStickIdleLeft = false;
  isStickIdleRight = false;
  isStickIdleUp = false;
  isStickIdleDown = false;

  constructor(assets: any, StoryFlags: StoryFlagManager, dm: DialogManager) {
    let heroSpritesheet = new Spritesheet(assets.image("hero").src, 16, 4, 4, 32, 32);
    heroSpritesheet.initialize();

    let config: GameObjectConfig = {
      name: "Player",
      startingMap: "kitchen",
      initX: 30,
      initY: 65,
      width: 32,
      height: 32,
      sprites: [new Sprite(assets.image("shadow").src), heroSpritesheet],
      collisionBody: {
        width: 14,
        height: 6,
        offsetX: 8,
        offsetY: 24,
        color: "blue",
      },
    };
    super(config);
    this.dm = dm;
    this.cutscenes = new EventManager(this, "CUTSCENE");
    this.isPlayable = true;
    this.animationHandler = new AnimationSequence(heroSpritesheet, this.animationUpdate, this.demosequence, 150);
    this.animationHandler.changeSequence("idle-down");
    this.walkingstates.register(isWalking, isIdle);
    this.walkingstates.set(isIdle, performance.now(), "down", "idle-down", this);
    this.SM = StoryFlags;

    /***********************************
     * using the Input Manager, sets up
     * peasy-input with proper callbacks
     * ******************************* */
    InputManager.register({
      Keyboard: {
        ArrowLeft: {
          name: "leftA",
          callback: this.leftArrow,
          options: {
            repeat: false,
          },
        },
        ArrowRight: {
          name: "rightA",
          callback: this.rightArrow,
          options: {
            repeat: false,
          },
        },
        ArrowUp: {
          name: "upA",
          callback: this.upArrow,
          options: {
            repeat: false,
          },
        },
        ArrowDown: {
          name: "downA",
          callback: this.downArrow,
          options: {
            repeat: false,
          },
        },
        " ": {
          name: "space",
          callback: this.interact,
          options: {
            repeat: false,
          },
        },
        Enter: {
          name: "enter",
          callback: this.speedUpText,
          options: {
            repeat: false,
          },
        },
        release: {
          callback: this.releasedKey,
        },
      },
      Touch: {},
      Mouse: {},
      Gamepad: {
        buttons: [
          this.interact,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
        axes: [
          {
            "0.7": this.rightArrow,
            "-0.7": this.leftArrow,
          },
          {
            "0.7": this.downArrow,
            "-0.7": this.upArrow,
          },
          {},
          {},
        ],
        axesIdle: [this.idleLeft, null],
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
     * trigger/object collision check
     * ******************************* */
    if (currentMap && !this.isCutscenePlaying) {
      currentMap.layers.forEach(ml => {
        ml.triggerLayers.forEach(async tl => {
          let colResult = this.collisions.isObjectColliding(
            { w: tl.w, h: tl.h, x: tl.x + ml.xPos, y: tl.y + ml.yPos, actions: tl.actions },
            this
          );
          if (colResult.status == true) {
            //trigger Map Action
            //look up actions on layer
            if (colResult.actions) {
              this.cutscenes.loadSequence(colResult.actions);
              this.isCutscenePlaying = true;
              await this.cutscenes.start();
              this.isCutscenePlaying = false;
            }
          }
        });
      });
    }

    /***********************************
     * testing if interaction with object
     * check is needed
     * ******************************* */
    if (this.isCheckForInteractions) {
      this.isCheckForInteractions = false;
      const objectInteractions: Array<interaction> | undefined = this.collisions.detectingInteractions(
        this,
        this.direction,
        DETECTION_DISTANCE,
        objects,
        currentMap
      );
      if (objectInteractions) {
        //loop through interactions

        let myContent;
        for (const [key, entry] of Object.entries(objectInteractions)) {
          const conditions = Object.entries(entry.conditions);
          if (storyFlags.checkConditions(entry.conditions)) {
            myContent = entry.content;
            break;
          }
        }
        if (myContent) {
          this.cutscenes.loadSequence(myContent);
          this.cutscenes.start();
        }
      }
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
    this.isStickIdleLeft = true;
    this.isLeftArrowDown = true;
    this.walkingstates.set(isWalking, performance.now(), "left", "walk-left", this);
  };
  rightArrow = () => {
    this.isStickIdleRight = true;
    this.isRightArrowDown = true;
    this.walkingstates.set(isWalking, performance.now(), "right", "walk-right", this);
  };
  upArrow = () => {
    this.isStickIdleUp = true;
    this.isUpArrowDown = true;
    this.walkingstates.set(isWalking, performance.now(), "up", "walk-up", this);
  };
  downArrow = () => {
    this.isStickIdleDown = true;
    this.isDownArrowDown = true;
    this.walkingstates.set(isWalking, performance.now(), "down", "walk-down", this);
  };
  releasedKey = (key: string) => {
    switch (key) {
      case "upA":
        this.isUpArrowDown = false;
        break;
      case "downA":
        this.isDownArrowDown = false;
        break;
      case "leftA":
        this.isLeftArrowDown = false;
        break;
      case "rightA":
        this.isRightArrowDown = false;
        break;
      case "gamepad":
        this.isRightArrowDown = false;
        this.isLeftArrowDown = false;
        this.isDownArrowDown = false;
        this.isUpArrowDown = false;
        break;
    }
    if (!this.isRightArrowDown && !this.isLeftArrowDown && !this.isDownArrowDown && !this.isUpArrowDown)
      this.walkingstates.set(isIdle, performance.now(), this.direction, `idle-${this.direction}`, this);
  };
  interact = () => {
    this.isCheckForInteractions = true;
  };
  speedUpText = () => {
    this.dm.speedup();
  };

  idleLeft = (stickIdle: number) => {
    if (this.isMoving) {
      if (stickIdle == 0) {
        this.isStickIdleLeft = false;
        this.isStickIdleRight = false;
      }
      if (stickIdle == 1) {
        this.isStickIdleDown = false;
        this.isStickIdleUp = false;
      }

      if (!this.isStickIdleDown && !this.isStickIdleLeft && !this.isStickIdleRight && !this.isStickIdleUp)
        this.releasedKey("gamepad");
    }
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
