import { Vector } from "./Vector";
import { Entity } from "./entity";
import object from "lodash/fp";

type CameraFocus = {
  mode: "point" | "entity";
  focusPoint?: Vector;
  focusEntity?: Entity;
};

export interface ICameraConfig {
  name: string;
  viewPortSystems: Array<any>;
  gameEntities: Array<any>;
  position: Vector;
  size: Vector;
  focusPoint?: Vector;
}

export class Camera {
  lerpDelay: number = 0;
  lerpUpdateInterval: number = 100;
  lerpStartVector: Vector;
  lerpHandle: NodeJS.Timer | undefined;
  lerpPercent: number = 0;
  cameraFocus: CameraFocus;
  oldFocusPoint: Vector;
  isLerping: boolean;
  panVector: Vector;
  oldPanVector: Vector;
  public template = `
  <style>
    :root {
        --pixel-size: 3;
        --aspectRatio: 3/2;
        --vpWidth: 400px;
    }
    
    @media (max-width: 1200px) {
        :root {
          --pixel-size: 2;
        }
      }

      @media (max-width: 800px) {
        :root {
          --pixel-size: 1;
        }
      }
    .viewport {
      border: 1px white solid;
      border-radius: 3px;
      background-color: #222222;
      width: var(--vpWidth, 400px);
      aspect-ratio: var(--aspectRatio, 3/2);
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%) scale(var(--pixel-size));
      min-width: 240px;
      min-height: 160px;
      overflow: hidden;
    }
    viewport-inner{
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    camera-layer{
      position: absolute;
      top:0;
      left: 0;
      transition: transform 0.25s;
    }
  </style>

  <view-port class="viewport">
        <viewport-inner>
          <camera-layer style=" width: \${size.x}px;height: \${size.y}px; transform: translate3d(\${position.x}px, \${position.y}px, 0px);">
              < \${ entity === } \${ entity <=* entities }>
          </camera-layer>
          < \${ vpSystem === } \${ vpSystem <=* vpSystems }>
        </viewport-inner>
        
  </view-port>
  `;

  private constructor(
    public name: string,
    public entities: any,
    public vpSystems: Array<any>,
    public position: Vector,
    public size: Vector
  ) {
    this.cameraFocus = {
      mode: "point",
      focusPoint: new Vector(0, 0),
    };
    this.isLerping = false;
    this.lerpStartVector = new Vector(0, 0);
    this.panVector = new Vector(0, 0);
    this.oldPanVector = new Vector(0, 0);
    this.oldFocusPoint = new Vector(0, 0);
  }

  public static create(config: ICameraConfig): Camera {
    return new Camera(config.name, config.gameEntities, config.viewPortSystems, config.position, config.size);
  }

  public update(deltaTime: number) {
    this.vpSystems.forEach(vps => vps.update(deltaTime / 1000, 0, this.entities));
    //camera position update

    if (this.cameraFocus.mode == "point") {
      //fixed camera
      //is camerafocus different than current position this.isEqual(this.cameraFocus.focusPoint, this.position)
      if (
        (!this.areEqual(this.cameraFocus.focusPoint, this.oldFocusPoint) || !this.areEqual(this.oldPanVector, this.panVector)) &&
        this.isLerping == false
      ) {
        if (this.lerpDelay != 0) {
          //must lerp
          this.isLerping = true;
          this.lerpPercent = 0;
          this.lerpStartVector = this.oldFocusPoint;
          this.lerpHandle = setInterval(this.lerpHandler, this.lerpDelay / this.lerpUpdateInterval);
        } else {
          //immediately adjust position
          this.isLerping = false;
          this.lerpPercent = 0;
          this.oldPanVector = this.panVector;
          this.oldFocusPoint = this.cameraFocus.focusPoint as Vector;
          this.lerpStartVector = this.position.add(this.oldPanVector);
          this.position = this.oldFocusPoint.add(this.oldPanVector);
        }
      }
    } else {
      //follow mode
      //does entity have position property
      let targetEntity = this.cameraFocus.focusEntity as Entity;
      if (Object.hasOwn(targetEntity, "position")) {
        //entity has position
        //@ts-ignore
        if (targetEntity.position != this.position || this.oldPanVector != this.panVector) {
          if (this.lerpDelay != 0) {
            //must lerp
            this.isLerping = true;
            this.lerpPercent = 0;
            this.lerpStartVector = this.cameraFocus.focusPoint as Vector;
            //@ts-ignore
            this.cameraFocus.focusPoint = new Vector(400 / 2 - targetEntity.position.x, 266.67 / 2 - targetEntity.position.y);
            this.lerpHandle = setInterval(this.lerpHandler, this.lerpDelay / this.lerpUpdateInterval);
          } else {
            //NO LERP
            //@ts-ignore
            this.position.x = 400 / 2 - targetEntity.position.x;
            //@ts-ignore
            this.position.y = 266.67 / 2 - targetEntity.position.y;
            //viewport currently hardcoded to 400w/266.67h
          }
        }
      }
    }
  }

  //Camera System Methods
  follow(who: Entity, lerpDelay: number = 0) {
    this.cameraFocus = {
      mode: "entity",
      focusEntity: who,
      //@ts-ignore
      focusPoint: new Vector(who.position.x, who.position.y),
    };
    this.lerpDelay = lerpDelay;

    //center entity in Viewport
  }

  //pan temporarily offsets camera from current position (fixed or follow)
  pan(offsetVector: Vector, lerpDelay: number = 0) {
    this.panVector = offsetVector;
    this.lerpDelay = lerpDelay;
  }

  //move sets new permanent fixed position
  move(newPosition: Vector, lerpDelay: number = 0) {
    this.cameraFocus = {
      mode: "point",
      focusPoint: newPosition,
    };
    this.lerpDelay = lerpDelay;
  }

  viewportShake() {}
  cameraShake() {}
  lerp(startValue: number, endValue: number, percent: number): number {
    return startValue + (endValue - startValue) * (percent / 100);
  }
  viewportFlash() {}
  cameraFlash() {}
  cameraZoom() {}
  setCameraBoundaries() {}
  lerpHandler = () => {
    if (this.isLerping) {
      // get lerp position

      let panX = this.lerp(this.oldPanVector.x, this.panVector.x, this.lerpPercent);
      let panY = this.lerp(this.oldPanVector.y, this.panVector.y, this.lerpPercent);
      if (this.cameraFocus.focusEntity) {
        //@ts-ignore
        (this.cameraFocus.focusPoint as Vector).x = this.cameraFocus.focusEntity.position.x;
        //@ts-ignore
        (this.cameraFocus.focusPoint as Vector).y = this.cameraFocus.focusEntity.position.y;
      }
      let tempX = this.lerp(this.lerpStartVector.x, (this.cameraFocus.focusPoint as Vector).x, this.lerpPercent);
      let tempY = this.lerp(this.lerpStartVector.y, (this.cameraFocus.focusPoint as Vector).y, this.lerpPercent);
      this.position = new Vector(tempX, tempY).add(new Vector(panX, panY));
      this.lerpPercent++;

      //lerp done, snap to finish
      if (this.lerpPercent >= 99) {
        this.oldPanVector = this.panVector;
        this.oldFocusPoint = new Vector((this.cameraFocus.focusPoint as Vector).x, (this.cameraFocus.focusPoint as Vector).y);
        this.position = this.oldFocusPoint.add(this.oldPanVector);

        //reset lerp
        clearInterval(this.lerpHandle);
        this.isLerping = false;
        this.lerpPercent = 0;
        this.lerpStartVector = new Vector(0, 0);
      }
    }
  };
  areEqual(obj1: any, obj2: any): boolean {
    return object.isEqual(obj1, obj2);
  }
}
