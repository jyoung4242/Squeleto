// First Import all your Squeleto Modules
import { GameObject, GameObjectConfig, interaction } from "../../parkinglog/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { InputManager } from "../../parkinglog/InputManager";
import { Spritesheet, AnimationSequence } from "../../_Squeleto/Spritesheet";
import { State, States } from "@peasy-lib/peasy-states";
import { CollisionManager, direction } from "../../parkinglog/CollisionManager";
import { GameMap } from "../../parkinglog/MapManager";
import { EventManager } from "../../parkinglog/EventManager";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";
import { Signal } from "../../_Squeleto/Signals";
import { SFX } from "../../_Squeleto/Sound API";

// Then import your content modules
import { DialogManager } from "../PlugIns/DialogueManager";

/**************************************
 * Main Player GameObject
 * ---------------------------------
 *
 * Uses spritesheet and a shadow sprite
 * Uses an animation handler for manage spritesheet
 * Uses peasy-states for animation states
 *
 * This object uses the inputHandler
 * Keyboard AND Gamepad available
 *
 * Registers SFX for the player, walking and dialogue sounds
 *
 * Uses Signals module for walking and standing events
 *
 * Uses Event Manager for cutscenes
 * cutscenes are generated from map triggers
 * and gameObject interactions
 *
 *************************************/

// Player Constants
const MAX_WALKING_SPEED = 1.5;
const DETECTION_DISTANCE = 25;

// all Squeleto Game objects extend GameObject class
export class Player extends GameObject {
  // systems properties
  dm; // Dialogue Custom Plug-in
  collisions = new CollisionManager(); // Collision Management
  cutscenes; // Cutscene Management
  animationHandler; // Spritesheet Animation
  walkingstates = new WalkingStates(); // Animation State Machine

  // General Purpose Props
  stepInterval: number = 0; // For playing walking SFX
  distanceRemaining = 0; // for tracking automated walking cutscene
  direction: direction = "down"; // for tracking which animation sequence to play

  // Animation Sequence for animationHandler
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

  // Signals
  signalWalkingDone: Signal;
  signalStandDone: Signal;

  // Flags
  isCheckForInteractions = false;
  isMoving: boolean = false;
  isCutscenePlaying = false;

  // input control variables
  isStickIdleLeft = false;
  isStickIdleRight = false;
  isStickIdleUp = false;
  isStickIdleDown = false;
  isLeftArrowDown = false;
  isRightArrowDown = false;
  isUpArrowDown = false;
  isDownArrowDown = false;

  constructor(assets: any, StoryFlags: StoryFlagManager, dm: DialogManager) {
    //Spritesheets must be initialized prior to passing super function
    let heroSpritesheet = new Spritesheet(assets.image("hero").src, 16, 4, 4, 32, 32);
    heroSpritesheet.initialize();

    let config: GameObjectConfig = {
      name: "Player",
      startingMap: "kitchen",
      initX: 30,
      initY: 65,
      width: 32,
      height: 32,
      sprites: [new Sprite(assets.image("shadow").src), heroSpritesheet], //results of spritesheet intialization
      collisionBody: {
        width: 14,
        height: 6,
        offsetX: 8,
        offsetY: 24,
        color: "blue",
      },
    };
    super(config);

    // Sound Effect Registration
    SFX.register({ name: "step", src: assets.audio("step").src });
    SFX.register({ name: "error", src: assets.audio("error").src });

    // Registering Signals
    this.signalStandDone = new Signal("standCompleted", this.id);
    this.signalWalkingDone = new Signal("walkCompleted", this.id);

    //Initialization of Systems
    this.dm = dm; //Dialog Manager passed from Scene
    this.cutscenes = new EventManager(this, "CUTSCENE"); // Initializing the event manager

    //passing the spritesheet and animation sequence to the Animation Handler, providing update callback and framerate
    this.animationHandler = new AnimationSequence(heroSpritesheet, this.animationUpdate, this.demosequence, 150);
    this.animationHandler.changeSequence("idle-down"); //Starting 'default' animation

    //setting up state machine for managing Animations
    this.walkingstates.register(isWalking, isIdle);
    this.walkingstates.set(isIdle, performance.now(), "down", "idle-down", this);

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
        buttons: [this.interact, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
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
          let colResult = this.collisions.isObjectColliding({ w: wl.w, h: wl.h, x: wl.x + ml.xPos, y: wl.y + ml.yPos }, this);
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

    // this is player driven movement
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
    } // the elseif here is the automated cutscene movement
    else if (this.isCutscenePlaying && this.isMoving) {
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

      /**
       * Resolution of walking event
       * if distance dictated is covered
       * send Signal to event
       */
      this.distanceRemaining--;
      if (this.distanceRemaining <= 0 && this.isMoving) {
        this.distanceRemaining = 0;
        this.isMoving = false;
        this.signalWalkingDone.send();
      }
    }
    return true;
  }

  /***********************************
   * these are the keypress callbacks
   * bound by peasy-input
   * ******************************* */
  leftArrow = () => {
    if (this.isCutscenePlaying) return;
    this.isStickIdleLeft = true;
    this.isLeftArrowDown = true;
    this.walkingstates.set(isWalking, performance.now(), "left", "walk-left", this);
  };
  rightArrow = () => {
    if (this.isCutscenePlaying) return;
    this.isStickIdleRight = true;
    this.isRightArrowDown = true;
    this.walkingstates.set(isWalking, performance.now(), "right", "walk-right", this);
  };
  upArrow = () => {
    if (this.isCutscenePlaying) return;
    this.isStickIdleUp = true;
    this.isUpArrowDown = true;
    this.walkingstates.set(isWalking, performance.now(), "up", "walk-up", this);
  };
  downArrow = () => {
    if (this.isCutscenePlaying) return;
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
    if (!this.isRightArrowDown && !this.isLeftArrowDown && !this.isDownArrowDown && !this.isUpArrowDown && !this.isCutscenePlaying)
      this.walkingstates.set(isIdle, performance.now(), this.direction, `idle-${this.direction}`, this);
  };
  interact = () => {
    this.isCheckForInteractions = true;
  };
  speedUpText = () => {
    if (this.dm.isDialogActive) this.dm.speedup();
  };

  /**
   * GamePad idle stick logic
   */
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

      if (!this.isStickIdleDown && !this.isStickIdleLeft && !this.isStickIdleRight && !this.isStickIdleUp) this.releasedKey("gamepad");
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

  /***********************************
   * this is the event interface for
   * walk and stand events
   * when these events are locally completed
   * they send Signals to the Events to resolve
   * ******************************* */
  startBehavior(behavior: string, ...params: any) {
    this.direction = params[0];

    this.walkingstates.set(isWalking, performance.now(), this.direction, `walk-${this.direction}`, this);
    if (behavior === "walk") {
      this.isMoving = true;
      this.distanceRemaining = params[1];
    }
    if (behavior === "stand") {
      const duration = params[1];
      this.walkingstates.set(isIdle, performance.now(), this.direction, `idle-${this.direction}`, this);
      this.isMoving = false;

      setTimeout(() => {
        this.signalStandDone.send();
      }, duration);
    }
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
    if (parentClass.stepInterval == 0) {
      parentClass.stepInterval = setInterval(() => {
        SFX.play("step");
      }, 200);
    }
  }
  exit() {}
}
class isIdle extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    console.log("stand", parentClass.isMoving);
    //if (parentClass.isMoving) {
    parentClass.isMoving = false;
    parentClass.animationHandler.changeSequence(`idle-${parentClass.direction}`, 0);
    parentClass.animationHandler.updateFrame();
    parentClass.animationHandler.pauseAnimation();
    if (parentClass.stepInterval != 0) {
      clearInterval(parentClass.stepInterval);
      parentClass.stepInterval = 0;
    }

    //}
  }
  exit() {}
}
