// import needed Squeleto modules
import { CollisionManager, direction } from "../../_Squeleto/CollisionManager";
import { GameObject, GameObjectConfig } from "../../_Squeleto/GameObject";
import { GameMap } from "../../_Squeleto/MapManager";

// all Squeleto game objects extend the GameObject class
export class Bullet extends GameObject {
  // object state
  direction;
  // will be replace by peasy-physics
  collisions = new CollisionManager();
  // localDestroy - this is the method from the renderer that is passed to the object
  // this will allow the Bullet to destroy itself on collision
  // peasy-physics will also manage this going forward
  localDestroy;

  constructor(assets: any, position: { x: number; y: number }, direction: direction, destory: Function) {
    // sets up the super call with game object data
    let config: GameObjectConfig = {
      name: "Bullet", //general name for type of object, this can be used during collision code
      startingMap: "myMap", // what is initial map this object is assigned to
      initX: position.x, // this is the map location, in this case its passed to the Bullet when created
      initY: position.y,
      width: 8, // width and height of the object
      height: 6,
      sprites: [assets.image("bullet")], // the assets loaded from the scene file
      collisionBody: {
        width: 8,
        height: 6,
        offsetX: 0,
        offsetY: 0,
        color: "purple",
      },
    };
    super(config);
    //set's defaults
    this.direction = direction;
    this.localDestroy = destory;
    this.velocity.x = 4.5;
  }

  /***********************************
   * this is the utility function that
   * parses the collision array for
   * directionaly collision
   * ******************************* */
  isDirectionInArray(dir: string): boolean {
    return this.collisionDirections.find(d => d == dir) != undefined;
  }

  // utility routine that unloads the object, on collision
  destroy() {
    this.localDestroy(this.id);
  }

  // all Squeleto GameObjects have an update and physicsUpdate loop called based on FPS
  physicsUpdate = (deltaTime: number, objects: GameObject[], currentMap: GameMap, storyFlags: any): boolean => {
    this.direction == "left" ? (this.xPos -= this.velocity.x) : (this.xPos += this.velocity.x);

    /***********************************
     * wall/object collision check
     * ******************************* */
    // loops through all objects, and
    // if an object is colliding, it adds the collision direction to the array
    this.collisionDirections = [];
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
    // since bullets move left and right, if there's a collision in that direction, unload the bullet
    if (this.isDirectionInArray("left") || this.isDirectionInArray("right")) this.destroy();

    return true;
  };
}
