import { Component } from "../../_SqueletoECS/component";
import { Vector } from "../../_SqueletoECS/Vector";
import barbarian from "../Assets/testbarbarian.png";

const sequenceMap = new Map([
  ["walk-left", [4, 3, 4, 5]],
  ["walk-right", [10, 9, 10, 11]],
  ["walk-up", [7, 6, 7, 8]],
  ["walk-down", [1, 0, 1, 2]],
  ["idle-left", [4]],
  ["idle-right", [10]],
  ["idle-up", [7]],
  ["idle-down", [1]],
]);

export interface IBarbarianComponent {}

export type BarbarianType = {
  src: string;
  position: Vector;
  size: Vector;
  bgX: number;
  bgY: number;
};

export interface BarbarianComponent {
  Sprite: BarbarianType;
}

export class Barbarian extends Component {
  public value: BarbarianType | undefined;
  public imgElement: HTMLImageElement;
  direction: "up" | "down" | "left" | "right" = "down";
  status: "idle" | "walk" = "idle";
  frame: number;
  frames: any;
  frameSize: Vector;
  frameRate: number;
  rows: number;
  cols: number;
  sequence: any;
  currentSequence: string;
  currentSequenceFrames: any;
  animationHandler: NodeJS.Timer | undefined;
  animationTik: number;
  isAnimationRunning: boolean = false;
  public template = `
    <style>
      .spritesheet-component {
        position: absolute;
        top: 0px;
        left: 0px;
        background-size: 300%;        
        background-repeat: no-repeat;
      }
    </style>
    <barbarian-layer class="spritesheet-component" style="background-image: url(\${value.src});background-position: -\${value.bgX}px -\${value.bgY}px;transform: translate(\${value.position.x}px, \${value.position.y}px);width: \${value.size.x}px; height: \${value.size.y}px; "></barbarian-layer>
    `;

  public constructor() {
    //@ts-ignore
    super("barbarian", Barbarian, false);
    this.value = {
      src: "",
      position: new Vector(0, 0),
      size: new Vector(0, 0),
      bgX: 0,
      bgY: 0,
    };
    this.frame = 0;
    this.frames = [];
    this.frameSize = new Vector(0, 0);
    this.imgElement = new Image();
    this.rows = 0;
    this.cols = 0;
    this.sequence = sequenceMap;
    this.currentSequence = "idle-down";
    this.currentSequenceFrames = [];
    this.animationTik = 0;
    this.frameRate = 150;
    console.log(this.sequence);
  }

  public define(data: IBarbarianComponent): void {
    this.imgElement.onload = () => {
      this.value = {
        src: this.imgElement.src,
        position: new Vector(0, 0),
        size: new Vector(16, 16),
        bgX: 0,
        bgY: 0,
      };
      this.frames.push(new Vector(0, 0));
      this.frames.push(new Vector(16, 0));
      this.frames.push(new Vector(32, 0));
      this.frames.push(new Vector(0, 16));
      this.frames.push(new Vector(16, 16));
      this.frames.push(new Vector(32, 16));
      this.frames.push(new Vector(0, 32));
      this.frames.push(new Vector(16, 32));
      this.frames.push(new Vector(32, 32));
      this.frames.push(new Vector(0, 48));
      this.frames.push(new Vector(16, 48));
      this.frames.push(new Vector(32, 48));
      this.animationHandler = setInterval(this.tik, 25);
      this.isAnimationRunning = true;
    };
    this.imgElement.src = barbarian;
    this.frameSize = new Vector(32, 32);
    this.changeSequence("idle", "down");
  }

  tik = () => {
    if (this.isAnimationRunning) {
      this.animationTik += 25;
      if (this.animationTik >= this.frameRate) {
        //console.log("frame", this.frame, " current sequence: ", this.currentSequence);
        this.animationTik = 0;
        this.frame++;

        this.currentSequenceFrames = this.getCurrentSequenceFrames();
        //console.log(this.currentSequenceFrames);
        if (this.frame >= this.currentSequenceFrames.length) this.frame = 0;
        const frameIndex = this.currentSequenceFrames[this.frame];

        //@ts-ignore
        this.value.bgX = this.frames[frameIndex].x;
        //@ts-ignore
        this.value.bgY = this.frames[frameIndex].y;
      }
    }
  };

  getCurrentSequenceFrames = (): Array<number> => {
    return this.sequence.get(this.currentSequence);
  };

  changeSequence = (status: "idle" | "walk", direction: "up" | "down" | "left" | "right") => {
    //console.log("sequence changing", sequence);
    this.status = status;
    this.direction = direction;
    this.currentSequence = `${status}-${direction}`;
    this.frame = 0;
    this.currentSequenceFrames = this.getCurrentSequenceFrames();
  };
}
