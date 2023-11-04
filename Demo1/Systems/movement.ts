/*****************************************************************************
 * System: Movement
 * Components Required: PositionComponent, VelocityComponent,ColliderComponent,KeyboardComponent
 * Signals: cutsceneSignal
 *
 * Description:
 * each movement entity applies its current velocity and modifies position property
 * impacted by collisions
 ******************************************************************************/

import { Signal } from "../../_Squeleto/Signals";
import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { ColliderComponent } from "../Components/collider";
import { PositionComponent } from "../Components/positionComponent";
import { VelocityComponent } from "../Components/velocity";
import { KeyboardComponent } from "../Components/keyboard";
import { Vector } from "../../_Squeleto/Vector";
import { NameComponent } from "../Components/name";
import { PassiveSoundComponent } from "../Components/passiveSound";

export type MovementEntity = Entity &
  PositionComponent &
  VelocityComponent &
  ColliderComponent &
  KeyboardComponent &
  NameComponent &
  PassiveSoundComponent;

export class MovementSystem extends System {
  isCutscenePlaying: boolean = false;
  updateState = new Signal("changePassiveState");
  cutsceneSignal: Signal = new Signal("cutscene");
  public constructor() {
    super("movement");
    this.cutsceneSignal.listen((signalData: CustomEvent) => {
      this.isCutscenePlaying = signalData.detail.params[0];
    });
  }

  public processEntity(entity: MovementEntity): boolean {
    return entity.position != null && entity.velocity != null;
  }

  public update(deltaTime: number, now: number, entities: MovementEntity[]): void {
    if (this.isCutscenePlaying) return;
    entities.forEach(entity => {
      if (!this.processEntity(entity)) {
        return;
      }

      let normalizedCollision: Vector;
      let adjustedVelocity: Vector;
      if (!entity.collider.isColliding.zero) {
        normalizedCollision = entity.collider.isColliding.multiply(entity.velocity);
        adjustedVelocity = entity.velocity.add(normalizedCollision);
      } else {
        adjustedVelocity = entity.velocity;
      }

      if (!adjustedVelocity.zero) {
        if (entity.name == "hero" && entity.passiveSound.currentState == "default") {
          this.updateState.send([entity.id, "walk"]);
        }
        entity.position = entity.position.add(entity.velocity);
        const cboyPosition = entity.position.add(entity.collider.offset);
        entity.collider.colliderBody?.setPosition(cboyPosition.x, cboyPosition.y);
        if (entity.collider.interactor?.body)
          entity.collider.interactor?.body.setPosition(
            entity.position.x + entity.collider.interactor.offset.x,
            entity.position.y + entity.collider.interactor.offset.y
          );
      } else {
        //console.log("no velocity");

        if (entity.name == "hero" && entity.passiveSound.currentState != "default") {
          this.updateState.send([entity.id, "default"]);
        }
      }
    });
  }
}
