//needs to create the objectdata for the frame data
export class Spritesheet {
  src: string = "";
  animationBinding: string = "0px 0px";
  numFrames: number = 0;
  width: number = 0;
  height: number = 0;
  rows: number = 0;
  cols: number = 0;
  frames: any = {};
  zIndex = 0;
  constructor(src: string, numframes: number, rows: number, cols: number, frameW: number, frameH: number) {
    this.src = src;
    this.numFrames = numframes;
    this.height = frameH;
    this.width = frameW;
    this.rows = rows;
    this.cols = cols;
  }
  initialize() {
    for (let index = 0; index < this.cols; index++) {
      for (let innerIndex = 0; innerIndex < this.rows; innerIndex++) {
        const frameIndex = this.cols * (index + 1) - (this.rows - innerIndex);
        this.frames[`${frameIndex}`] = { xPos: -innerIndex * this.width, yPos: -index * this.height };
      }
    }
  }
}

/*
demosequence = {
    'walk-up': [1,2,3,4],
    'walk-down':[5,6,7,8],
    'walk-left': [9,10,11,12],
    'walk-right': [13,14,15,16],
    'idle-down": [5],
    'idle-up": [1],
    'idle-left": [9],
    'idle-right": [13],
}

*/

//needs to provide the current frame data to peasy-ui
export class AnimationSequence {
  speed: number = 0;
  direction: string = "";
  sequence: any = {};
  src: Spritesheet | undefined = undefined;
  isRunning: boolean = false;
  currentSequence = "default";
  currentFrame = 0;
  currentIndex = 0;
  intervalHandler: number = 0;
  callback: Function;

  constructor(
    spritesheet: Spritesheet,
    updateCallback: Function,
    sequence?: null | any,
    speed?: number,
    direction?: "forwards" | "reverse"
  ) {
    this.speed = speed || 150;
    this.direction = direction || "forwards";
    this.src = spritesheet;
    this.sequence = sequence || this.defaultSequence();
    //create interval tik
    this.intervalHandler = setInterval(this.tick, speed);
    this.callback = updateCallback;
  }

  changeSequence = (sequence: string, frame?: number) => {
    this.currentSequence = sequence;
    if (frame) this.currentFrame = frame;
  };

  startAnimation = () => {
    this.isRunning = true;
  };

  pauseAnimation = () => {
    this.isRunning = false;
  };

  defaultSequence = () => {
    //build array from spritesheet
    let numFrames = this.src?.numFrames;
    if (numFrames == undefined) throw Error("ERROR WITH SPRITESHEET");

    let newArray = [];
    for (let index = 0; index < numFrames; index++) {
      newArray.push(index);
    }
    //create object using said array
    return {
      default: newArray,
    };
  };

  updateFrame() {
    this.tick();
  }

  getFrameDetails(): string {
    //get frame details from spritesheet
    let { xPos, yPos } = this.src?.frames[this.currentFrame];
    //update binding
    return `${xPos}px ${yPos}px`;
  }

  tick = () => {
    if (this.isRunning == false) return;
    //check if at end of frame sequence

    let numSequenceFrames = (this.sequence[this.currentSequence] as Array<any>).length;
    this.currentIndex += 1;
    if (this.currentIndex >= numSequenceFrames) this.currentIndex = 0;
    //find next frame index
    this.currentFrame = this.sequence[this.currentSequence][this.currentIndex];
    this.callback();
  };
}
