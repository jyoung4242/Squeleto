import { GameEvent } from "./EventManager";
import { GameObject, interaction } from "./GameObject";
import { GameMap, collisionBody } from "./MapManager";

export type direction = "down" | "left" | "up" | "right";
const COLLISION_MARGIN = 4;
const DISTANCE_MARGIN = 5;

export type TriggerCheck = {
  result: boolean;
  actions: Array<object> | null;
};

type collisionResult = {
  status: boolean;
  collisionDirection: Array<direction>;
  actions?: Array<GameEvent>;
};

export class CollisionManager {
  constructor() {}

  isObjectColliding(a: any, b: any): collisionResult {
    let B = this.calcCollisionBox(b);
    let dirs: Array<direction> = [];
    let myActions: Array<GameEvent> = [];

    if (a.x < B.x + B.w && a.x + a.w > B.x && a.y < B.y + B.h && a.y + a.h > B.y) {
      let directionCheck: Array<direction> = ["up", "down", "left", "right"];
      directionCheck.forEach(dir => {
        switch (dir) {
          case "left":
            if (this.isLeftFree(a, b) == false) {
              dirs.push("left");
              if (a.actions) {
                myActions = [...a.actions];
              }
            }
            break;
          case "right":
            if (this.isRightFree(a, b) == false) {
              dirs.push("right");
              if (a.actions) {
                myActions = [...a.actions];
              }
            }
            break;
          case "up":
            if (this.isUpFree(a, b) == false) {
              dirs.push("up");
              if (a.actions) {
                myActions = [...a.actions];
              }
            }
            break;
          case "down":
            if (this.isDownFree(a, b) == false) {
              dirs.push("down");
              if (a.actions) {
                myActions = [...a.actions];
              }
            }
            break;
        }
      });
      return { status: true, collisionDirection: dirs, actions: myActions };
    }
    return { status: false, collisionDirection: [] };
  }

  isWallCollision(walls: Array<any>, who: GameObject, direction: direction): boolean {
    let walllength = walls.length;
    for (let i = 0; i < walllength; i++) {
      let w = walls[i];
      switch (direction) {
        case "left":
          if (!this.isLeftFree(w, who)) return true;
          break;
        case "right":
          if (!this.isRightFree(w, who)) {
            return true;
          }
          break;
        case "up":
          if (!this.isUpFree(w, who)) return true;
          break;
        case "down":
          if (!this.isDownFree(w, who)) return true;
          break;
      }
    }
    return false;
  }

  isTriggerCollision(triggers: Array<any>, who: GameObject, direction: direction): TriggerCheck {
    let triggerlength = triggers.length;
    for (let i = 0; i < triggerlength; i++) {
      let t = triggers[i];
      switch (direction) {
        case "left":
          if (!this.isLeftFree(t, who))
            return {
              result: true,
              actions: triggers[i].actions,
            };
          break;
        case "right":
          if (!this.isRightFree(t, who))
            return {
              result: true,
              actions: triggers[i].actions,
            };
          break;
        case "up":
          if (!this.isUpFree(t, who))
            return {
              result: true,
              actions: triggers[i].actions,
            };
          break;
        case "down":
          if (!this.isDownFree(t, who))
            return {
              result: true,
              actions: triggers[i].actions,
            };
          break;
      }
    }
    return {
      result: false,
      actions: null,
    };
  }

  calcCollisionBox = (p: GameObject): { w: number; h: number; x: number; y: number } => {
    return {
      w: p.collisionLayers[0].w,
      h: p.collisionLayers[0].h,
      x: p.xPos + p.collisionLayers[0].x,
      y: p.yPos + p.collisionLayers[0].y,
    };
  };

  isDownFree = (wall: collisionBody, player: GameObject): boolean => {
    let b = this.calcCollisionBox(player);

    if (wall.x < b.x + b.w - COLLISION_MARGIN && wall.x + wall.w > b.x + COLLISION_MARGIN) {
      const distance = Math.abs(wall.y - (b.y + b.h));
      //console.log("down check: ", distance);
      if (distance < DISTANCE_MARGIN) return false;
    }
    return true;
  };
  isUpFree = (wall: collisionBody, player: GameObject): boolean => {
    let b = this.calcCollisionBox(player);
    if (wall.x < b.x + b.w - COLLISION_MARGIN && wall.x + wall.w > b.x + COLLISION_MARGIN) {
      const distance = Math.abs(b.y - (wall.y + wall.h));
      //console.log("up check: ", distance);
      if (distance < DISTANCE_MARGIN) return false;
    }
    return true;
  };
  isLeftFree = (wall: collisionBody, player: GameObject): boolean => {
    let b = this.calcCollisionBox(player);
    if (wall.y < b.y + b.h - COLLISION_MARGIN && wall.y + wall.h >= b.y + COLLISION_MARGIN) {
      const distance = Math.abs(b.x - (wall.x + wall.w));
      //console.log("left check: ", distance);
      if (distance < DISTANCE_MARGIN) return false;
    }
    return true;
  };
  isRightFree = (wall: collisionBody, player: GameObject): boolean => {
    let b = this.calcCollisionBox(player);
    if (wall.y < b.y + b.h - COLLISION_MARGIN && wall.y + wall.h >= b.y + COLLISION_MARGIN) {
      const distance = Math.abs(wall.x - (b.x + b.w));
      //console.log("right check: ", distance);
      if (distance < DISTANCE_MARGIN) return false;
    }
    return true;
  };

  detectingInteractions = (
    who: GameObject,
    direction: direction,
    distance: number,
    objects: Array<GameObject>,
    currentMap: GameMap
  ): Array<interaction> | undefined => {
    // find point that needs testing
    //find x,y location of centerpoint of collisionbody
    const cbCenterPointX = who.xPos + who.collisionLayers[0].x + who.collisionLayers[0].w / 2;
    const cbCenterPointY = who.yPos + who.collisionLayers[0].y + who.collisionLayers[0].h / 2;

    let RCpointX: number, RCpointY: number;
    switch (direction) {
      case "down":
        RCpointX = cbCenterPointX;
        RCpointY = cbCenterPointY + distance;
        break;
      case "up":
        RCpointX = cbCenterPointX;
        RCpointY = cbCenterPointY - distance;
        break;
      case "left":
        RCpointX = cbCenterPointX - distance;
        RCpointY = cbCenterPointY;
        break;
      case "right":
        RCpointX = cbCenterPointX + distance;
        RCpointY = cbCenterPointY;
        break;
    }

    // take point and see if it falls inside any object collision box that is on same map
    const mappedObjects = objects.filter(obj => {
      return obj.currentMap == currentMap.name && obj.name != who.name;
    });

    const foundObject = mappedObjects.find(mo => {
      return lineObjectCollision({ x1: cbCenterPointX, y1: cbCenterPointY, x2: RCpointX, y2: RCpointY }, mo);
    });

    // if object found, return the interaction object
    if (foundObject) {
      if ("isCutscenePlaying" in foundObject) {
        foundObject.isCutscenePlaying = true;
      }
      return foundObject.interactionEvents;
    }

    return undefined;
  };
}

function lineObjectCollision(line: { x1: number; y1: number; x2: number; y2: number }, body: GameObject): boolean {
  const left = lineLine(
    { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 },
    {
      x1: body.xPos + body.collisionLayers[0].x,
      y1: body.yPos + body.collisionLayers[0].y,
      x2: body.xPos + body.collisionLayers[0].x,
      y2: body.yPos + body.collisionLayers[0].y + body.collisionLayers[0].h,
    }
  );
  const right = lineLine(
    { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 },
    {
      x1: body.xPos + body.collisionLayers[0].x + body.collisionLayers[0].w,
      y1: body.yPos + body.collisionLayers[0].y,
      x2: body.xPos + body.collisionLayers[0].x + body.collisionLayers[0].w,
      y2: body.yPos + body.collisionLayers[0].y + body.collisionLayers[0].h,
    }
  );
  const top = lineLine(
    { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 },
    {
      x1: body.xPos + body.collisionLayers[0].x,
      y1: body.yPos + body.collisionLayers[0].y,
      x2: body.xPos + body.collisionLayers[0].x + body.collisionLayers[0].w,
      y2: body.yPos + body.collisionLayers[0].y,
    }
  );
  const bottom = lineLine(
    { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 },
    {
      x1: body.xPos + body.collisionLayers[0].x,
      y1: body.yPos + body.collisionLayers[0].y + body.collisionLayers[0].h,
      x2: body.xPos + body.collisionLayers[0].x + body.collisionLayers[0].w,
      y2: body.yPos + body.collisionLayers[0].y + body.collisionLayers[0].h,
    }
  );

  if (left || right || top || bottom) {
    return true;
  }
  return false;
}

function lineLine(
  line1: { x1: number; y1: number; x2: number; y2: number },
  line2: { x1: number; y1: number; x2: number; y2: number }
): boolean {
  // calculate the distance to intersection point
  const uA =
    ((line2.x2 - line2.x1) * (line1.y1 - line2.y1) - (line2.y2 - line2.y1) * (line1.x1 - line2.x1)) /
    ((line2.y2 - line2.y1) * (line1.x2 - line1.x1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1));
  const uB =
    ((line1.x2 - line1.x1) * (line1.y1 - line2.y1) - (line1.y2 - line1.y1) * (line1.x1 - line2.x1)) /
    ((line2.y2 - line2.y1) * (line1.x2 - line1.x1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return true;
  }
  return false;
}
