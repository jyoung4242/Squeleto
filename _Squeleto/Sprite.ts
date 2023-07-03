export class Sprite {
  width: number = 0;
  height: number = 0;
  zIndex: number;
  src: string;
  animationBinding: string = "0px 0px";
  hFlip = 1;
  constructor(src: string, flip?: number) {
    let img = new Image();
    img.onload = () => {
      img.width;
      this.width = img.width;
      this.height = img.height;
    };
    img.src = src;
    flip ? (this.hFlip = flip) : (this.hFlip = 1);
    this.zIndex = 2;
    this.src = src;
  }
}
