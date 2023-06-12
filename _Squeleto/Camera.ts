import { GameEvent } from "./EventManager";
import { GameObject } from "./GameObject";
import { GameRenderer } from "./Renderer";

export type ShakeDirection = "horizontal" | "vertical" | "random";

export class Camera {
  //shaking props
  static xPos = 0;
  static yPos = 0;
  static cWidth = 0;
  static cHeight = 0;
  static isShaking: boolean = false;
  static shakeType: ShakeDirection = "horizontal";
  static shakeAngle = 0;
  static shakeFrequency = 0;
  static shakeDuration = 0;
  static shakeMagnitude = 0;
  static shakeElapsedTime = 0;
  static shakeIntervalTime = 0;
  static followedObject: GameObject | undefined;
  static vpW: number;
  static vpH: number;
  static isFlashEnabled = false;

  static initialize(w: number, h: number) {
    Camera.vpW = w;
    Camera.vpH = h;
  }

  static shake(who: GameObject, shakeType: ShakeDirection, magnitude: number, duration: number, interval: number) {
    Camera.shakeElapsedTime = 0;
    Camera.shakeIntervalTime = 0;
    Camera.shakeType = shakeType;
    Camera.shakeMagnitude = magnitude;
    Camera.shakeDuration = duration;
    Camera.shakeFrequency = interval;
    Camera.isShaking = true;

    const event = new CustomEvent("cameraShakeComplete", { detail: who });
    document.dispatchEvent(event);
  }

  static flash(duration: number) {
    Camera.isFlashEnabled = true;
    setTimeout(() => {
      Camera.isFlashEnabled = false;
    }, duration);
  }

  static follow(who: GameObject) {
    Camera.followedObject = who;
  }

  static shakeUpdate(time: number): any {
    if (!this.isShaking) return { shakeX: 0, shakeY: 0 };

    this.shakeElapsedTime += time; //* 1000
    this.shakeIntervalTime += time * 1000;
    //console.log("shaking:", this.shakeIntervalTime, this.shakeDuration);
    // We're done shaking
    if (this.shakeElapsedTime >= this.shakeDuration) {
      this.isShaking = false;
      return { shakeX: 0, shakeY: 0 };
    }

    while (this.shakeIntervalTime >= this.shakeFrequency) {
      this.shakeIntervalTime -= this.shakeFrequency;
      // Reset interval time and recalculate shake offset
      switch (this.shakeType) {
        case "horizontal":
          this.shakeAngle = this.shakeAngle === 0 ? 180 : 0;
          break;
        case "vertical":
          this.shakeAngle = this.shakeAngle === 90 ? 270 : 90;
          break;
        case "random":
          this.shakeAngle = Math.floor(Math.random() * 360);
          break;
      }
    }

    // Convert to radians
    const theta = (this.shakeAngle * Math.PI) / 180;
    // Convert magnitude and angle to vector
    return { shakeX: this.shakeMagnitude * Math.cos(theta), shakeY: this.shakeMagnitude * Math.sin(theta) };
  }

  static update(deltaTime: number, now: number) {
    if (Camera.followedObject) {
      let followPosition_viewportX = Camera.vpW / 2 - Camera.followedObject?.width / 2;
      let followPosition_viewportY = Camera.vpH / 2 - Camera.followedObject?.height / 2;
      let { shakeX, shakeY } = this.shakeUpdate(deltaTime);

      Camera.xPos = followPosition_viewportX - Camera.followedObject?.xPos + shakeX;
      Camera.yPos = followPosition_viewportY - Camera.followedObject?.yPos + shakeY;
    }
  }
}

export class CameraFlash extends GameEvent {
  duration: number;
  who: GameObject | undefined;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(duration: number) {
    super("cameraflash");
    this.who = undefined;
    this.duration = duration;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      GameRenderer.cameraFlash(this.duration);
      resolve();
    });
  }
}
export class CameraShake extends GameEvent {
  duration: number;
  direction: ShakeDirection;
  interval: number;
  magnitude: number;
  who: GameObject | undefined;
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(direction: ShakeDirection, magnitude: number, duration: number, interval: number) {
    super("camerashake");
    this.who = undefined;
    this.duration = duration;
    this.direction = direction;
    this.interval = interval;
    this.magnitude = magnitude;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      document.addEventListener("cameraShakeComplete", this.completeHandler);
      this.who = who;
      GameRenderer.cameraShake(this.who, this.direction, this.magnitude, this.duration, this.interval);
      resolve();
    });
  }

  completeHandler = (e: any) => {
    if (e.detail === this.who) {
      document.removeEventListener("cameraShakeComplete", this.completeHandler);
      if (this.resolution) this.resolution();
    }
  };
}
