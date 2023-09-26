// First Import all your Squeleto Modules
import { AnimationSequence, Spritesheet } from "../../_Squeleto/Spritesheet";
import { EventManager } from "../../parkinglog/EventManager";
import { CollisionManager, direction } from "../../parkinglog/CollisionManager";
import { GameMap } from "../../parkinglog/MapManager";
import { State, States } from "@peasy-lib/peasy-states";
import { GameObject, GameObjectConfig } from "../../parkinglog/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";
import { Signal } from "../../_Squeleto/Signals";
import { SFX } from "../../_Squeleto/Sound API";

// Then import your content modules
import { playSFX } from "../Events/sfx";
import { WalkEvent } from "../Events/walk";
import { DialogEvent } from "../Events/dialogue";
import { testConversation } from "../Dialogue/testConversation";
import { npcChangeMap } from "../Events/npcChangeMap";

// NPC Constants
const NPC_WALKSPEED = 1;

/**************************************
 * NPC GameObject
 * ---------------------------------
 *
 * Uses spritesheet and a shadow sprite
 * Uses an animation handler for manage spritesheet
 * Uses peasy-states for animation states
 *
 * This object uses the inputHandler
 * Keyboard AND Gamepad available
 *
 * Registers SFX for the player, door sound
 *
 * Uses Signals module for walking and standing events
 *
 * Uses Event Manager for behavior loop
 * which is the IDLE list of events that occur
 *
 *************************************/

export class NPC1 extends GameObject {
  // systems properties
  dm;
  animationHandler;
  collisions = new CollisionManager();
  behaviorLoop;
  walkingstates = new WalkingStates();

  // general purpose properties
  xVelocity = 0;
  yVelocity = 0;
  direction: direction;
  distanceRemaining = 0;

  // Animation sequence
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
  signalStandDone: Signal;
  signalWalkingDone: Signal;

  // Flags
  isCutscenePlaying = false;
  isStanding = false;
  isMoving = false;

  constructor(assets: any, StoryFlags: StoryFlagManager, dm: any) {
    //Spritesheets must be initialized prior to passing super function
    let npcSpritesheet = new Spritesheet(assets.image("npc2").src, 16, 4, 4, 32, 32);
    npcSpritesheet.initialize();

    let config: GameObjectConfig = {
      startingMap: "kitchen",
      name: "NPC1",
      initX: 70,
      initY: 90,
      width: 32,
      height: 32,
      sprites: [new Sprite(assets.image("shadow").src), npcSpritesheet],
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
    SFX.register({ name: "door", src: assets.audio("door").src });

    // Registering Signals
    this.signalStandDone = new Signal("standCompleted", this.id);
    this.signalWalkingDone = new Signal("walkCompleted", this.id);

    // Initialization of Systems
    this.SM = StoryFlags; // Story Flag Management
    this.dm = dm; // Dialog Manager passed from Scene

    // passing the spritesheet and animation sequence to the Animation Handler, providing update callback and framerate
    this.animationHandler = new AnimationSequence(npcSpritesheet, this.animationUpdate, this.demosequence, 150);
    this.animationHandler.changeSequence("idle-down");

    // setting up state machine for managing Animations
    this.walkingstates.register(isWalking, isIdle);
    this.walkingstates.set(isIdle, performance.now(), "down", "idle-down", this);
    this.direction = "down";

    // Building list of Events that are used when player interacts with NPC
    // uses StoryFlags to pick event path
    this.interactionEvents = [
      {
        conditions: {
          threat: false,
          meek: false,
          deaf: false,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, "npc1", this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: false,
          deaf: false,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, "npc1", this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: true,
          deaf: false,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, "npc1", this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: false,
          deaf: true,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, "npc1", this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: false,
          deaf: false,
          angry: true,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, "npc1", this.SM.StoryFlags)],
      },
      {
        conditions: "default",
        content: [new DialogEvent(new testConversation(this), this.dm, "npc1", this.SM.StoryFlags)],
      },
    ];

    // registering EventManager for Behavior Loop
    // Building list of Events that are used for Idle behavior
    this.behaviorLoop = new EventManager(this, "LOOP");
    this.behaviorLoop.loadSequence([
      new WalkEvent("down", 60),
      new playSFX("door"),
      new npcChangeMap("outside", 105, 75),
      new WalkEvent("down", 10),
      new WalkEvent("up", 10),
      new playSFX("door"),
      new npcChangeMap("kitchen", 70, 150),
      new WalkEvent("up", 60),
    ]);
    this.behaviorLoop.start(); // starts the BL
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

      switch (this.direction) {
        case "down":
          this.yVelocity = NPC_WALKSPEED;
          this.xVelocity = 0;
          break;
        case "up":
          this.yVelocity = -NPC_WALKSPEED;
          this.xVelocity = 0;
          break;
        case "left":
          this.yVelocity = 0;
          this.xVelocity = -NPC_WALKSPEED;
          break;
        case "right":
          this.yVelocity = 0;
          this.xVelocity = NPC_WALKSPEED;
          break;
      }
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

  /***********************************
   * update callback for the
   * animation handler
   * ******************************* */
  animationUpdate = () => {
    this.spriteLayers[1].animationBinding = this.animationHandler.getFrameDetails();
  };

  /***********************************
   * peasy-engine renderer and physics
   * gameloop callbacks for each entity
   * ******************************* */
  update(deltaTime: number, objects: GameObject[], currentMap: GameMap): boolean {
    return true;
  }

  physicsUpdate = (deltaTime: number, objects: GameObject[], currentMap: GameMap): boolean => {
    //check for object/object collisions
    //filter playable characters out

    if (!currentMap) return true;
    if (this.isCutscenePlaying) return true;
    //if (currentMap.name != this.currentMap) return true;

    let otherObjects = objects.filter(oo => this.id != oo.id && oo.currentMap == this.currentMap);
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

    // this logic changes player direction and moves based on
    // direction

    if (this.isMoving) {
      if (this.isMoving) {
        switch (this.direction) {
          case "down":
            if (!this.isDirectionInArray("down")) this.yPos += this.yVelocity;
            else return true;
            break;
          case "up":
            if (!this.isDirectionInArray("up")) this.yPos += this.yVelocity;
            else return true;
            break;
          case "left":
            if (!this.isDirectionInArray("left")) this.xPos += this.xVelocity;
            else return true;
            break;
          case "right":
            if (!this.isDirectionInArray("right")) this.xPos += this.xVelocity;
            else return true;
            break;
        }
      }

      /**
       * Resolution of walking event
       * if distance dictated is covered
       * send Signal to event
       */
      this.distanceRemaining--;
      if (this.distanceRemaining <= 0) {
        this.distanceRemaining = 0;
        this.isMoving = false;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.signalWalkingDone.send();
      }
    }
    return true;
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
  }
  exit() {}
}
class isIdle extends State {
  enter(_previous: State | null, ...params: any): void | Promise<void> {
    let parentClass = params[2];
    parentClass.isMoving = false;
    parentClass.animationHandler.changeSequence(`idle-${parentClass.direction}`, 0);
    parentClass.animationHandler.updateFrame();
    parentClass.animationHandler.pauseAnimation();
  }
  exit() {}
}
