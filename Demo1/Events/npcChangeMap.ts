import { GameEvent } from "../../_Squeleto/EventManager";
import { GameObject } from "../../_Squeleto/GameObject";

export class npcChangeMap extends GameEvent {
  who: GameObject | undefined;
  newMap: string;
  newX: number;
  newY: number;

  constructor(mapname: string, x: number, y: number) {
    super("npcMapChange");
    this.who = undefined;
    this.newMap = mapname;
    this.newX = x;
    this.newY = y;
  }

  init(who: GameObject): Promise<void> {
    return new Promise(resolve => {
      this.who = who;
      this.who.currentMap = this.newMap;
      this.who.xPos = this.newX;
      this.who.yPos = this.newY;
      resolve();
    });
  }
}
