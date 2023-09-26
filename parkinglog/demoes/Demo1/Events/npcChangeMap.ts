import { GameEvent } from "../../parkinglog/EventManager";
import { GameObject } from "../../parkinglog/GameObject";

/**
 * This is a event for the asynchronous changing of the maps
 * for npc's, which is different than the default mapchange
 * which changes the rendered map, this allows NPC's to leave
 * one map and move to another, but doesn't touch what's rendered
 */

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
