// import needed Squeleto modules
import { CollisionManager } from "../../_Squeleto/CollisionManager";
import { GameObject, GameObjectConfig } from "../../_Squeleto/GameObject";
import { GameMap } from "../../_Squeleto/MapManager";
import { Sprite } from "../../_Squeleto/Sprite";
import { AsepriteParser } from "../../_Squeleto/aseprite-parser";
import { CameraShake } from "../../_Squeleto/Camera";
import { EventManager } from "../../_Squeleto/EventManager";
import { SFX } from "../../_Squeleto/Sound API";
import { Assets } from "@peasy-lib/peasy-assets";
import { Signal } from "../../_Squeleto/Signals";

// target movement constants
const TARGET_UPPER_LIMIT = 30;
const TARGET_LOWER_LIMIT = 60;
const TARGET_VELOCITY = 0.5;

// all Squeleto game objects extend the GameObject class
export class Target extends GameObject {
  //GameObjects have a velocity vector natively
  velocity = { x: 0, y: -TARGET_VELOCITY };

  // current collision management module --> moving to peasy-physics at some point
  collisions = new CollisionManager();

  // these are set after the super call
  // events is for the EventManager module, used to shake the screen
  events;

  // Signal object for sending the 'targethit' signal
  mySignal;

  constructor(img: HTMLImageElement, shake: Function, flip: number, initX: number) {
    let config: GameObjectConfig = {
      name: "Target",
      startingMap: "myMap",
      initX: initX,
      initY: 65,
      width: 16,
      height: 16,
      sprites: [new Sprite(img.src, flip)], // using the img passed in from the targetCreate() method, also with a flip bit
      collisionBody: {
        width: 16,
        height: 16,
        offsetX: 0,
        offsetY: 0,
        color: "yellow",
      },
    };
    super(config);

    //@ts-ignore
    this.events = new EventManager(this, "CUTSCENE");
    this.events.loadSequence([new CameraShake("horizontal", 3, 250, 50)]);

    // SFX and BGM modules need all the audio assets registered prior to use
    SFX.register({ name: "hit", src: Assets.audio("hit").src, gain: 1 });

    // Signals module - this sets the name and the who for the broadcast signal
    this.mySignal = new Signal("targethit", "target");
  }

  /**
   * asynchronous and custom create method
   * this is used for parsing the aseprite file natively and extracting the
   * image to be used prior to calling the constructor
   *  */
  static async targetCreate(camerashake: Function, flip: number, initX: number) {
    const myParser = new AsepriteParser("../src/Assets/target.ase");
    await myParser.initialize();
    return new Target(myParser.getImage(0) as HTMLImageElement, camerashake, flip, initX);
  }

  //@ts-ignore - since i have an await in this loop, it changed the return to a promise
  // which upset TS type check
  async physicsUpdate(deltaTime: number, objects: GameObject[], currentMap: GameMap, storyFlags: any): Promise<boolean> {
    // this is a guard condition, when this update is called prior to the map being loaded
    if (currentMap == undefined) return true;

    //this flip movement direction when the target hits its position limits
    if (this.velocity.y < 0 && this.yPos <= TARGET_UPPER_LIMIT) this.velocity.y = TARGET_VELOCITY;
    else if (this.velocity.y > 0 && this.yPos >= TARGET_LOWER_LIMIT) this.velocity.y = -TARGET_VELOCITY;
    this.yPos += this.velocity.y;

    /***********************************
     *  object/object collision check
     * ******************************* */
    this.collisionDirections = [];
    let otherObjects = objects.filter(oo => {
      return this.id != oo.id && oo.currentMap == currentMap.name;
    });

    otherObjects.forEach(o => {
      o.collisionLayers.forEach(cl => {
        let colResult = this.collisions.isObjectColliding({ w: cl.w, h: cl.h, x: cl.x + o.xPos, y: cl.y + o.yPos }, this);
        this.isColliding = colResult.status;
        // this is how you filter collisions for certain types of objects
        if (o.name == "Bullet") this.collisionDirections.push(...colResult.collisionDirection);
      });
    });

    // Collision check for left/write
    // if found, perfrom camara shake, play sound, and broadcast signal for UI update
    if (this.isDirectionInArray("left") || this.isDirectionInArray("right")) {
      await this.events.start(); // camera shake
      SFX.play("hit"); // play sound
      this.mySignal.send(); //Signal - tell others that the target has been hit
      this.events.loadSequence([new CameraShake("horizontal", 3, 250, 50)]); // reset the sequence
    }
    return true;
  }

  /***********************************
   * this is the utility function that
   * parses the collision array for
   * directionaly collision
   * ******************************* */
  isDirectionInArray(dir: string): boolean {
    return this.collisionDirections.find(d => d == dir) != undefined;
  }
}
