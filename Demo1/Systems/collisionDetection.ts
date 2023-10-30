/*****************************************************************************
 * System: CollisionDetection
 *
 * Components Required: ColliderComponent, SizeComponent, PositionComponent,
 * MapComponent, InteractionComponent, KeyboardComp
 *
 * Signals: mapchange, eventSignal, mapTriggerReset
 *
 * Description:
 * uses the detect-collisions npm package for tracking entities and their position
 * in space
 * has a debug canvas that can be used
 * defines the types of collision resolutions based on entitytype
 * tracks the current map, and on change, cleans out the walls/triggers
 * and reloads the new map walls and triggers, then re-inserts the entities
 * on Update() runs the checkCollision() method on the hero player against all
 * entities and then resolves based on entity type
 ******************************************************************************/

import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { ColliderComponent } from "../Components/collider";
import { System as dcSystem, Box, Response } from "detect-collisions";
import { Signal } from "../../_Squeleto/Signals";
import { Vector } from "../../_Squeleto/Vector";
import { SizeComponent } from "../Components/sizeComponent";
import { PositionComponent } from "../Components/positionComponent";
import { UI } from "@peasy-lib/peasy-ui";
import { MapComponent } from "../Components/entitymap";
import { VelocityComponent } from "../Components/velocity";
import { over } from "lodash";
import { InteractionComponent } from "../Components/interactions";
import { KeyboardComp } from "../Components/keyboard";

// type definition for ensuring the entity template has the correct components
// ComponentTypes are defined IN the components imported
export type ColliderEntity = Entity &
  ColliderComponent &
  SizeComponent &
  PositionComponent &
  MapComponent &
  InteractionComponent &
  KeyboardComp;

export type colliderBody = Box & { type: string; layerAssignment: number; layers: boolean[]; map: "" };

type npcColliderBody = Box & ColliderComponent & PositionComponent & VelocityComponent;

enum collisionResolutionType {
  wall,
  static,
  bounceback,
  destroy,
  push,
  mapevent,
  npc,
}

export class CollisionDetectionSystem extends System {
  template: string = `
  <canvas id="dc" width="400" height="225" \${==>cnv}></canvas>
  `;
  mapdata: any[];
  entities: ColliderEntity[] = [];
  mapChange: Signal;
  eventSignal: Signal;
  mapTriggerResetSignal: Signal;
  dc: dcSystem;
  currentMap: string = "";
  cnv: HTMLCanvasElement | undefined;
  ctx: CanvasRenderingContext2D | null = null;
  debug: boolean;

  public constructor(mapdata: any[], startingMap: string, debug: boolean) {
    super("collisiondetection");
    this.mapdata = mapdata;
    this.dc = new dcSystem();
    this.debug = debug;
    this.mapChange = new Signal("mapchange");
    this.mapChange.listen(this.mapchange);
    this.eventSignal = new Signal("mapEvent");
    this.mapTriggerResetSignal = new Signal("resetMapTrigger");
    this.mapTriggerResetSignal.listen(this.resetMapTrigger);
    this.currentMap = startingMap;
    this.loadWallsTriggers();
    UI.queue(() => {
      this.ctx = (this.cnv as HTMLCanvasElement).getContext("2d");
    });
  }

  mapchange = (signalData: any) => {
    console.log("mapchange", signalData.detail.params);
    //find new mapname in mapData
    const newmap = signalData.detail.params[0];
    console.log(this.mapdata);

    const mapIndex = this.mapdata.findIndex(map => map.name == newmap);
    if (mapIndex == -1) throw new Error("invalid map selected");

    this.currentMap = newmap;
    console.log("map changed to: ", newmap, this.currentMap);

    this.eraseEntityData();
    this.loadWallsTriggers();
    this.loadEntities(this.entities);

    console.log(this.currentMap, mapIndex, this.dc.all());
  };

  resetMapTrigger = (signalData: any) => {
    let [id, mapName] = signalData.detail.params;
    if (mapName != this.currentMap) return;
    let entities = this.dc.all();
    //@ts-ignore
    let mapTrigger = entities.find(ent => ent.id == id);
    //@ts-ignore
    mapTrigger.actionStatus = "idle";
  };

  eraseEntityData() {
    console.log("erasing detect collisions");

    this.dc.clear();
    console.log(this.dc.all());
  }

  loadWallsTriggers = () => {
    const currentMapData = this.mapdata.find(map => map.name == this.currentMap);
    if (currentMapData == undefined) throw new Error("invalid map selected");

    currentMapData.walls.forEach((wall: { x: number; y: number; w: number; h: number }) => {
      this.dc.insert(this.createWallBody(new Vector(wall.x, wall.y), new Vector(wall.w, wall.h), this.currentMap));
    });
    currentMapData.triggers.forEach(
      (trigger: { x: number; y: number; w: number; h: number; actions: any[]; id: string; mode: string }) => {
        this.dc.insert(
          this.createTriggerBody(
            new Vector(trigger.x, trigger.y),
            new Vector(trigger.w, trigger.h),
            trigger.actions,
            this.currentMap,
            trigger.id,
            trigger.mode
          )
        );
      }
    );
    //console.log(this.dc.all());
  };

  createWallBody(position: Vector, size: Vector, map: string): any {
    return Object.assign(new Box({ x: position.x, y: position.y }, size.x, size.y, { isStatic: true }), {
      type: "wall",
      level: 0,
      mask: [false, false, false, true, true],
      map: map,
    });
  }

  createTriggerBody(position: Vector, size: Vector, actions: any[], map: string, id: string, mode: string): any {
    return Object.assign(new Box({ x: position.x, y: position.y }, size.x, size.y, { isStatic: true }), {
      type: "trigger",
      level: 1,
      mask: [false, false, false, true, true],
      actions: [...actions],
      map: map,
      actionStatus: "idle",
      id: id,
      mode: mode,
    });
  }

  loadEntities = (entities: ColliderEntity[]) => {
    //console.log(entities);

    entities.forEach(ent => {
      if (ent.collider != null) {
        //console.log(ent.map, this.currentMap);
        if (ent.map == this.currentMap) {
          //console.log("in entity insert:", ent, this.currentMap);
          this.dc.insert(ent.collider.colliderBody as Box);
        }
      }
      if (ent.collider.interactor) this.dc.insert(ent.collider.interactor.body);
      //console.log(this.dc.all());
    });
  };

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: ColliderEntity[]): void {
    this.dc.update();
    this.entities = entities;

    //debug drawing to canvas
    if (this.ctx && this.cnv && this.debug) {
      this.ctx.clearRect(0, 0, this.cnv?.width, this.cnv?.height);
      this.ctx.strokeStyle = "#ff0000";
      this.ctx.beginPath();
      this.dc.draw(this.ctx);
      this.ctx.stroke();
    }

    const playerCollider = entities.find(ent => {
      if (ent.collider.colliderBody) {
        let type = ent.collider.colliderBody.type;
        return type == "player";
      }
    })?.collider.colliderBody;

    const collisionEntities = this.dc.all();
    //@ts-ignore
    const filteredCollisionEntities = collisionEntities.filter(ent => ent.map == this.currentMap);
    //@ts-ignore
    const interactor = collisionEntities.find(ent => ent.type == "interactor");

    filteredCollisionEntities.forEach(ent => {
      //@ts-ignore
      if (ent.type == "player") return;

      //Standard collision Detection
      //check for entities ( excludes walls and triggers)
      if (this.dc.checkCollision(playerCollider, ent)) {
        let { b, overlapN, overlapV } = this.dc.response;
        if (b.type == "static")
          collisionResolution(playerCollider, b, entities, overlapV, this.dc.response, collisionResolutionType.static);
        else if (b.type == "wall")
          collisionResolution(playerCollider, b, entities, overlapV, this.dc.response, collisionResolutionType.wall);
        else if (b.type == "trigger")
          collisionResolution(playerCollider, b, entities, overlapV, this.dc.response, collisionResolutionType.mapevent);
        else if (b.type == "npc")
          collisionResolution(playerCollider, b, entities, overlapV, this.dc.response, collisionResolutionType.npc);
        //collision
      } else {
        //no collision

        //@ts-ignore
        if (ent.type == "trigger") {
          //@ts-ignore
          if (ent.actionStatus != "idle") {
            //reset trigger
            //@ts-ignore
            ent.actionStatus = "idle";
          }
        }
      }

      //interaction detection
      //@ts-ignore
      if (interactor && ent.type != "interactor" && this.dc.checkCollision(interactor, ent)) {
        const entParent = entities.find(interaction => interaction.collider.colliderBody == ent);
        let response = this.dc.response;
        if (!entParent?.interactions) return;

        //direction check, from interactor parent
        const interactorParent = entities.find(ent => ent.collider.interactor != null);
        //@ts-ignore
        let interactorDirection = interactorParent.keyboard.direction;
        let directionAlignment = false;
        //compare collision normal to interactorDirection

        switch (interactorDirection) {
          case "down":
            directionAlignment = response.overlapN.y == 1;
            break;
          case "up":
            directionAlignment = response.overlapN.y == -1;
            break;
          case "left":
            directionAlignment = response.overlapN.x == -1;
            break;
          case "right":
            directionAlignment = response.overlapN.x == 1;
            break;
          default:
            directionAlignment = false;
            break;
        }

        if (entParent.interactions.isEnabled && directionAlignment) {
          entParent.interactions.isActive = true;
          entParent.interactions.color = "whitesmoke";
        } else {
          if (entParent.interactions.isEnabled) {
            entParent.interactions.isActive = false;
            entParent.interactions.color = "transparent";
          }
        }
      } else {
        const entParent = entities.find(interaction => interaction.collider.colliderBody == ent);

        if (!entParent?.interactions) return;
        if (entParent.interactions.isEnabled) {
          entParent.interactions.isActive = false;
          entParent.interactions.color = "transparent";
        }
      }
    });
  }
}

const collisionResolution = (
  a: any,
  b: any,
  entities: ColliderEntity[],
  overlap: SAT.Vector,
  response: Response,
  method: collisionResolutionType
) => {
  if (!a || !b) return;
  let entityA;
  let entityB;
  let eventSignal = new Signal("Event");

  switch (method) {
    case collisionResolutionType.wall:
      entityA = entities.find(e => e.collider.colliderBody == a);
      if (entityA == undefined || !entityA.collider.colliderBody) return;
      entityA.position.x = entityA.position.x - overlap.x;
      entityA.position.y = entityA.position.y - overlap.y;
      entityA.collider.colliderBody.setPosition(
        entityA.collider.colliderBody.x - overlap.x,
        entityA.collider.colliderBody.y - overlap.y
      );
      break;
    case collisionResolutionType.static:
      entityA = entities.find(e => e.collider.colliderBody == a);
      if (entityA == undefined || !entityA.collider.colliderBody) return;
      entityA.position.x = entityA.position.x - overlap.x;
      entityA.position.y = entityA.position.y - overlap.y;

      entityA.collider.colliderBody.setPosition(
        entityA.collider.colliderBody.x - overlap.x,
        entityA.collider.colliderBody.y - overlap.y
      );
      break;
    case collisionResolutionType.npc:
      //@ts-ignore
      let npc: npcColliderBody | undefined = entities.find(e => e.collider.colliderBody == b);

      if (!npc) return;

      if (npc.velocity.x == 0 && npc.velocity.y == 0) {
        entityA = entities.find(e => e.collider.colliderBody == a);
        if (!entityA) return;

        //stop moving
        a.setPosition(a.x - overlap.x, a.y - overlap.y);
        entityA.position.x = entityA.position.x - overlap.x;
        entityA.position.y = entityA.position.y - overlap.y;
      } else if (npc.velocity.x != 0) {
        if (response.overlapN.x != 0) {
          entityB = entities.find(e => e.collider.colliderBody == b);
          if (!entityB) return;

          //stop moving
          b.setPosition(b.x + overlap.x, b.y + overlap.y);
          entityB.position.x = entityB.position.x + overlap.x;
          entityB.position.y = entityB.position.y + overlap.y;
        } else {
          entityA = entities.find(e => e.collider.colliderBody == a);
          if (!entityA) return;

          //stop moving
          a.setPosition(a.x - overlap.x, a.y - overlap.y);
          entityA.position.x = entityA.position.x - overlap.x;
          entityA.position.y = entityA.position.y - overlap.y;
        }
      } else if (npc.velocity.y != 0) {
        if (response.overlapN.y != 0) {
          entityB = entities.find(e => e.collider.colliderBody == b);
          if (!entityB) return;

          //stop moving
          b.setPosition(b.x + overlap.x, b.y + overlap.y);
          entityB.position.x = entityB.position.x + overlap.x;
          entityB.position.y = entityB.position.y + overlap.y;
        } else {
          entityA = entities.find(e => e.collider.colliderBody == a);
          if (!entityA) return;

          //stop moving
          a.setPosition(a.x - overlap.x, a.y - overlap.y);
          entityA.position.x = entityA.position.x - overlap.x;
          entityA.position.y = entityA.position.y - overlap.y;
        }
      }

      break;
    case collisionResolutionType.bounceback:
    case collisionResolutionType.destroy:
    case collisionResolutionType.push:
    case collisionResolutionType.mapevent:
      entityA = entities.find(e => e.collider.colliderBody == a);
      if (entityA == undefined || !entityA.collider.colliderBody) return;

      if (b.actionStatus == "idle") {
        b.actionStatus = "active";
        if (b.actions.length > 0) {
          for (let action of b.actions) {
            //console.log(action);

            if (action.condition) {
              eventSignal.send([action.actions]);
              return;
            }
          }
        }

        //if (b.actions.length > 0) eventSignal.send([b.actions]);
      }

      break;
  }
};
