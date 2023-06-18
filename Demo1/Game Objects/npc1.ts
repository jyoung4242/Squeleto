import { AnimationSequence, Spritesheet } from "../../_Squeleto/Spritesheet";
import { WalkEvent } from "../Events/walk";
import { EventManager } from "../../_Squeleto/EventManager";
import { CollisionManager, direction } from "../../_Squeleto/CollisionManager";
import { GameMap } from "../../_Squeleto/MapManager";
import { State, States } from "@peasy-lib/peasy-states";
import { DialogEvent } from "../Events/dialogue";
import { testConversation } from "../Dialogue/testConversation";
import { npcChangeMap } from "../Events/npcChangeMap";
import { GameObject, GameObjectConfig } from "../../_Squeleto/GameObject";
import { Sprite } from "../../_Squeleto/Sprite";
import { StoryFlagManager } from "../../_Squeleto/StoryFlagManager";

const NPC_WALKSPEED = 1;

export class NPC1 extends GameObject {
  dm;
  isCutscenePlaying = false;
  isStanding = false;
  collisions = new CollisionManager();
  behaviorLoop;
  direction: direction;
  xVelocity = 0;
  yVelocity = 0;
  isMoving = false;
  distanceRemaining = 0;
  animationHandler;
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
  walkingstates = new WalkingStates();

  constructor(assets: any, StoryFlags: StoryFlagManager, dm: any) {
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
    this.SM = StoryFlags;
    this.dm = dm;
    this.interactionEvents = [
      {
        conditions: {
          threat: false,
          meek: false,
          deaf: false,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: false,
          deaf: false,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: true,
          deaf: false,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: false,
          deaf: true,
          angry: false,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, this.SM.StoryFlags)],
      },
      {
        conditions: {
          threat: true,
          meek: false,
          deaf: false,
          angry: true,
        },
        content: [new DialogEvent(new testConversation(this), this.dm, this.SM.StoryFlags)],
      },
      {
        conditions: "default",
        content: [new DialogEvent(new testConversation(this), this.dm, this.SM.StoryFlags)],
      },
    ];
    this.behaviorLoop = new EventManager(this, "LOOP");
    this.animationHandler = new AnimationSequence(npcSpritesheet, this.animationUpdate, this.demosequence, 150);
    this.animationHandler.changeSequence("idle-down");
    this.walkingstates.register(isWalking, isIdle);
    this.walkingstates.set(isIdle, performance.now(), "down", "idle-down", this);

    this.direction = "down";
    this.behaviorLoop.loadSequence([
      new WalkEvent("down", 60),
      new npcChangeMap("outside", 105, 75),
      new WalkEvent("down", 10),
      new WalkEvent("up", 10),
      new npcChangeMap("kitchen", 70, 150),
      new WalkEvent("up", 60),
    ]);
    this.behaviorLoop.start();
  }

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
        const event = new CustomEvent("standCompleted", { detail: this });
        document.dispatchEvent(event);
      }, duration);
    }
  }

  animationUpdate = () => {
    this.spriteLayers[1].animationBinding = this.animationHandler.getFrameDetails();
  };

  update(deltaTime: number, objects: GameObject[], currentMap: GameMap): boolean {
    return true;
  }

  physicsUpdate = (deltaTime: number, objects: GameObject[], currentMap: GameMap): boolean => {
    //check for object/object collisions
    //filter playable characters out

    if (!currentMap) return true;
    if (this.isCutscenePlaying) return true;
    //if (currentMap.name != this.currentMap) return true;
    let otherObjects = objects.filter(oo => this.id != oo.id);
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

      this.distanceRemaining--;
      if (this.distanceRemaining <= 0) {
        this.distanceRemaining = 0;
        this.isMoving = false;
        this.xVelocity = 0;
        this.yVelocity = 0;

        const event = new CustomEvent("walkCompleted", { detail: this });
        document.dispatchEvent(event);
      }
    }
    return true;
  };

  isDirectionInArray(dir: string): boolean {
    return this.collisionDirections.find(d => d == dir) != undefined;
  }
}

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
//new CameraFlash(this, 250),
