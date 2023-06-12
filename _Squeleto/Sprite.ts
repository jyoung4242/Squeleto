export class Sprite {
  width: number = 0;
  height: number = 0;
  zIndex: number;
  src: string;
  animationBinding: string = "0px 0px";
  constructor(src: string) {
    let img = new Image();
    img.onload = () => {
      img.width;
      this.width = img.width;
      this.height = img.height;
    };
    img.src = src;
    this.zIndex = 2;
    this.src = src;
  }
}
