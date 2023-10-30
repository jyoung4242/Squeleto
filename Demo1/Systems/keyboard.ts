/*****************************************************************************
 * System: Keyboard
 * Components Required: KeyboardComponent, VelocityComponent,animatedSpriteEntity
 * Signals: pauseSignal, interactSignal, cutsceneSignal, confirmSignal
 *
 * Description:
 * each KeyboardComponent entity (usually just one), on each update loop will read
 * the designation action tied to a keypress
 * this uses the Peasy-input mapping library, which maps actions to inputs
 * the update changes the entities 'state' of idle/walk, and direction
 * it also set's the entities velocity
 ******************************************************************************/

import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { KeyboardComponent } from "../Components/keyboard";
import { Input } from "@peasy-lib/peasy-input";
import { VelocityComponent } from "../Components/velocity";
import { Vector } from "../../_Squeleto/Vector";
import { animatedSpriteEntity } from "./animatedSprite";
import { Signal } from "../../_Squeleto/Signals";

// type definition for ensuring the entity template has the correct components
// ComponentTypes are defined IN the components imported
export type KeyboardEntity = Entity & KeyboardComponent & VelocityComponent & animatedSpriteEntity;

export class KeyboardSystem extends System {
  direction: "right" | "left" | "up" | "down" = "down";
  state: "idle" | "walk" = "idle";
  leftDown: boolean = false;
  rightDown: boolean = false;
  upDown: boolean = false;
  downDown: boolean = false;
  pauseSignal: Signal;
  isCutscenePlaying: boolean = false;
  interactSignal: Signal;
  cutsceneSignal: Signal;
  confirmSignal: Signal;

  template = ``;
  public constructor() {
    super("keyboard");
    this.confirmSignal = new Signal("confirm");
    this.interactSignal = new Signal("interact");
    this.pauseSignal = new Signal("pauseEngine");
    this.cutsceneSignal = new Signal("cutscene");
    this.cutsceneSignal.listen((details: CustomEvent) => {
      this.isCutscenePlaying = details.detail.params[0];
    });
    //Map your bindings here
    Input.map(
      {
        ArrowLeft: "walk_left",
        ArrowRight: "walk_right",
        ArrowDown: "walk_down",
        ArrowUp: "walk_up",
        Escape: "pause",
        Enter: "confirm",
        " ": "interact",
      },
      (action: string, doing: boolean) => {
        if (doing) {
          switch (action) {
            case "confirm":
              if (!this.isCutscenePlaying) return;
              this.confirmSignal.send();
              break;
            case "interact":
              if (this.isCutscenePlaying) return;
              this.interactSignal.send();
              break;
            case "pause":
              this.pauseSignal.send();
              break;
            case "walk_left":
              if (this.isCutscenePlaying) return;
              this.direction = "left";
              this.state = "walk";
              this.leftDown = true;
              break;
            case "walk_right":
              if (this.isCutscenePlaying) return;
              this.direction = "right";
              this.state = "walk";
              this.rightDown = true;
              break;
            case "walk_down":
              if (this.isCutscenePlaying) return;
              this.direction = "down";
              this.state = "walk";
              this.downDown = true;
              break;
            case "walk_up":
              if (this.isCutscenePlaying) return;
              this.direction = "up";
              this.state = "walk";
              this.upDown = true;
              break;
          }
        } else {
          switch (action) {
            case "walk_left":
              this.leftDown = false;
              break;
            case "walk_right":
              this.rightDown = false;
              break;
            case "walk_down":
              this.downDown = false;
              break;
            case "walk_up":
              this.upDown = false;
              break;
          }
          if (!this.leftDown && !this.rightDown && !this.upDown && !this.downDown) {
            this.state = "idle";
          }
        }
      }
    );
  }

  public processEntity(entity: KeyboardEntity): boolean {
    return entity.keyboard != null && entity.velocity != null && entity.spritesheet != null;
  }

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: KeyboardEntity[]): void {
    Input.update(deltaTime);
    entities.forEach(entity => {
      if (!this.processEntity(entity)) {
        return;
      }

      entity.keyboard.direction = this.direction;
      entity.keyboard.state = this.state;

      if (entity.keyboard.state == "idle") {
        entity.velocity = new Vector(0, 0);
        return;
      }
      switch (this.direction) {
        case "down":
          entity.velocity = new Vector(0, 1);
          break;
        case "up":
          entity.velocity = new Vector(0, -1);
          break;
        case "left":
          entity.velocity = new Vector(-1, 0);
          break;
        case "right":
          entity.velocity = new Vector(1, 0);
          break;
      }
    });
  }
}
