// import all Squeleto modules
import { GameObject, GameObjectConfig, interaction } from "../../_Squeleto/GameObject";
import { InputManager } from "../../_Squeleto/InputManager";
import { Spritesheet, AnimationSequence } from "../../_Squeleto/Spritesheet";
import { State, States } from "@peasy-lib/peasy-states";
import { CollisionManager, direction } from "../../_Squeleto/CollisionManager";
import { GameMap } from "../../_Squeleto/MapManager";
import { SFX } from "../../_Squeleto/Sound API";
import { Signal } from "../../_Squeleto/Signals";

// since player 'creates' the bullet object, we import it
import { Bullet } from "./Bullet";

// setting up moving constancts
const MAX_WALKING_SPEED = 1.5;
const GRAVITY_SPEED = 0.25;
const MAX_FALLNG_SPEED = 23;

// all Squeleto game objects extend the GameObject class
export class Player extends GameObject {
  //player flags
  gameover: boolean = false;
  landFlag: boolean = false;
  isGravity: boolean = true;
  jumpLatch: boolean = false;
  isOnGround: boolean = false;
  isLeftArrowDown: boolean = false;
  isRightArrowDown: boolean = false;
  isUpArrowDown: boolean = false;
  isDownArrowDown: boolean = false;
  isMoving: boolean = false;
  isCutscenePlaying: boolean = false;

  assets; // passed assets into the object
  gameOverSignal; // Signal object for catching the 'gameover' signal
  yVelocity = 0; // used for managing the player's jumping
  direction: direction = "left"; // used to track which way player is facing

  // these are local references to renderer methods
  localCreateObject;
  localDestroyObject; // passed to bullet object

  // current collision management module --> moving to peasy-physics at some point
  collisions = new CollisionManager();
  // animation handler for spritesheet
  animationHandler;

  // for managing animation state transitions, this is a statemachine
  walkingstates = new WalkingStates();

  // this is the sequence object passed to the animation handler
  // it calls out the name off the sequence, and a list of
  // spritesheet frames associated with that sequnce
  // notice, you have the ability to flip your spritesheet for
  // horizontal flipping
  demosequence = {
    "run-left": [3, 4, 5],
    "run-right": [
      { index: 3, flip: true },
      { index: 4, flip: true },
      { index: 5, flip: true },
    ],
    "idle-left": [0, 1, 2],
    "idle-right": [
      { index: 0, flip: true },
      { index: 1, flip: true },
      { index: 2, flip: true },
    ],
    "jump-left": [6],
    "jump-right": [{ index: 6, flip: true }],
    "jfire-left": [16],
    "jfire-right": [{ index: 16, flip: true }],
    "rfire-left": [13, 14, 15],
    "rfire-right": [
      { index: 13, flip: true },
      { index: 14, flip: true },
      { index: 15, flip: true },
    ],
    "ifire-left": [10],
    "ifire-right": [{ index: 10, flip: true }],
  };

  constructor(assets: any, create: Function, destroy: Function) {
    // when using a spritesheet, you need to initialize it PRIOR to the super call
    // the initialize method establishes the actual 'image' of the spritesheet
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
        width: 20,
        height: 24,
        offsetX: 14,
        offsetY: 9,
        color: "blue",
      },
    };
    super(config);

    // SFX and BGM modules need all the audio assets registered prior to use
    SFX.register({ name: "fire", src: assets.audio("fire").src });
    SFX.register({ name: "jump", src: assets.audio("jump").src });
    SFX.register({ name: "land", src: assets.audio("land").src });

    // Signals module - if your subscribing to a signal, the listen method
    // needs a callback provided, you can either use anon function
    // or provide the callback
    this.gameOverSignal = new Signal("gameover");
    this.gameOverSignal.listen(() => {
      this.gameover = true;
      this.isMoving = false;
    });

    // setting up the spritesheet animation handler
    // this configures animations with timing, passing the spritesheet, update callback,
    // and the sequence data... there is a default on this too
    // also, we set the default intial sequence
    this.animationHandler = new AnimationSequence(heroSpritesheet, this.animationUpdate, this.demosequence, 150);
    this.animationHandler.changeSequence("idle-left");

    // i recommend and prefer to use a state machine to manage animation sequences
    // peasy-states is a library that's native to Squeleto and makes
    // statemachine setup super easy
    this.walkingstates.register(isWalking, isIdle, isJumping, isJumpFiring, isFiring, isRunFiring);
    this.walkingstates.set(isIdle, performance.now(), "left", "idle-left", this);

    // setting up player state defaults
    this.assets = assets;
    this.localCreateObject = create;
    this.localDestroyObject = destroy;

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
          options: { repeat: false },
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
  animationUpdate = () => {
    // sprite layers have a UI binding to them that controls their positioning
    // this is important so that the spritesheet is positioned correctly for
    // the current frame, for the demo, we only have one spritelayer
    this.spriteLayers[0].animationBinding = this.animationHandler.getFrameDetails();
  };

  // all Squeleto GameObjects have an update and physicsUpdate loop called based on FPS
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
     * gravity
     * ******************************* */
    if (!this.isDirectionInArray("down")) {
      this.landFlag = true;
      if (this.yVelocity < MAX_FALLNG_SPEED) {
        this.yVelocity += GRAVITY_SPEED;
      }
      if (this.isDirectionInArray("up") && this.yVelocity < 0) {
        this.yVelocity = 0;
      }
      this.yPos += this.yVelocity;
      if (this.walkingstates && this.walkingstates?.current?.name != "isJumpFiring")
        this.walkingstates.set(isJumping, performance.now(), this.direction, `idle-${this.direction}`, this);
    } else {
      // this is the landing code, which gets called anytime the player is on the ground
      // which is why there's a landflag to ensure the 'landing' sound onlyplays once
      if (this.landFlag) {
        this.landFlag = false;
        SFX.play("land");
      }
      this.isOnGround = true;
      this.yVelocity = 0;
      this.jumpLatch = false;

      // this switches to the correct animation when landing based on keypress
      if (!this.isMoving) {
        if (this.walkingstates && this.walkingstates?.current?.name != "isFiring") {
          this.walkingstates.set(isIdle, performance.now(), this.direction, `idle-${this.direction}`, this);
        }
      } else {
        if (this.walkingstates && this.walkingstates?.current?.name != "isRunFiring") {
          this.walkingstates.set(isWalking, performance.now(), this.direction, `run-${this.direction}`, this);
        }
      }
    }

    if ((this.isMoving || this.jumpLatch) && !this.isCutscenePlaying) {
      /***********************************
       * all checks are complete, adjust player's position
       * assuming there are no collisions
       * ******************************* */
      switch (this.direction) {
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
   * also controls switching animations too
   * ******************************* */
  leftArrow = () => {
    if (this.gameover) return;
    if (this.walkingstates?.current?.name != "isRunFiring")
      if (this.isOnGround) this.walkingstates.set(isWalking, performance.now(), "left", "run-left", this);
    this.direction = "left";
    this.isLeftArrowDown = true;
    this.isMoving = true;
  };
  rightArrow = () => {
    if (this.gameover) return;
    if (this.walkingstates?.current?.name != "isRunFiring")
      if (this.isOnGround) this.walkingstates.set(isWalking, performance.now(), "right", "run-right", this);
    this.direction = "right";
    this.isMoving = true;
    this.isRightArrowDown = true;
  };
  /**
   * jumping logic
   * if the player is onground
   * plays the jump sound
   * and changes the yVelocity parameter
   */
  jump = () => {
    if (this.gameover) return;
    if (this.isOnGround) {
      SFX.play("jump");
      this.yVelocity = -5;
      this.yPos += this.yVelocity;
      this.isOnGround = false;
      this.walkingstates.set(isJumping, performance.now(), this.direction, `jump-${this.direction}`, this);
      if (this.isMoving) this.jumpLatch = true;
    }
  };
  /**
   * firing logic
   * depending on current state, switches animation to correct one
   * also plays the firing sound
   * also creates the bullet object in proper spot depending on
   * direction player is facing
   */
  fire = () => {
    if (this.gameover) return;
    SFX.play("fire");
    switch (this.walkingstates.current?.name) {
      case "isIdle":
        this.walkingstates.set(isFiring, performance.now(), this.direction, null, this);
        break;
      case "isJumping":
        this.walkingstates.set(isJumpFiring, performance.now(), this.direction, null, this);
        break;
      case "isWalking":
        this.walkingstates.set(isRunFiring, performance.now(), this.direction, null, this);
        break;
    }
    let origin = { x: 0, y: 0 };
    this.direction == "left" ? (origin.x = this.xPos) : (origin.x = this.xPos + this.width - 5);
    origin.y = this.yPos + 16;
    this.localCreateObject([new Bullet(this.assets, origin, this.direction, this.localDestroyObject)]);
  };
  /**
   * released key code
   * this tracks what keypress is released and
   * the necessary teardown logic associated
   * with releasing a key
   */
  releasedKey = (key: string) => {
    switch (key) {
      case "leftA":
        this.isLeftArrowDown = false;
        break;
      case "rightA":
        this.isRightArrowDown = false;
        break;
      case "fire":
        switch (this.walkingstates.current?.name) {
          case "isFiring":
            this.walkingstates.set(isIdle, performance.now(), this.direction, null, this);
            break;
          case "isJumpFiring":
            this.walkingstates.set(isJumping, performance.now(), this.direction, null, this);
            break;
          case "isRunFiring":
            this.walkingstates.set(isWalking, performance.now(), this.direction, null, this);
            break;
        }
        break;
    }
    if (!this.isRightArrowDown && !this.isLeftArrowDown) {
      this.isMoving = false;
    }
    if (
      !this.isRightArrowDown &&
      !this.isLeftArrowDown &&
      this.isOnGround &&
      this.walkingstates.current?.name != "isFiring"
    ) {
      this.walkingstates.set(isIdle, performance.now(), this.direction, `idle-${this.direction}`, this);
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
 * in each state you can see how the
 * animation handler is engaged to change
 * the animation sequence
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
  }
  exit() {}
}
class isIdle extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    if (parentClass.isMoving) {
      parentClass.animationHandler.changeSequence(`idle-${parentClass.direction}`, 0);
      parentClass.animationHandler.updateFrame();
    } else {
      parentClass.animationHandler.changeSequence(`idle-${parentClass.direction}`, 0);
      parentClass.animationHandler.updateFrame();
    }
  }
  exit() {}
}
class isJumping extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    parentClass.animationHandler.changeSequence(`jump-${parentClass.direction}`, 0);
    parentClass.animationHandler.updateFrame();
  }
  exit() {}
}

class isFiring extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    parentClass.animationHandler.changeSequence(`ifire-${parentClass.direction}`, 0);
    parentClass.animationHandler.updateFrame();
  }
  exit() {}
}

class isJumpFiring extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    parentClass.animationHandler.changeSequence(`jfire-${parentClass.direction}`, 0);
    parentClass.animationHandler.updateFrame();
  }
  exit() {}
}

class isRunFiring extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    parentClass.animationHandler.changeSequence(`rfire-${parentClass.direction}`, 0);
    parentClass.animationHandler.updateFrame();
  }
  exit() {}
}
