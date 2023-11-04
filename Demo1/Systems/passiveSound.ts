import { Audio } from "@peasy-lib/peasy-audio";
import { Signal } from "../../_Squeleto/Signals";
import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { MapComponent } from "../Components/entitymap";
import { KeyboardComponent } from "../Components/keyboard";
import { NameComponent } from "../Components/name";
import { PassiveSoundComponent } from "../Components/passiveSound";
import { VelocityComponent } from "../Components/velocity";

export type PassiveSoundEntity = Entity & MapComponent & NameComponent & PassiveSoundComponent & KeyboardComponent & VelocityComponent;

export class PassiveSoundSystem extends System {
  mapChangeSignal: Signal = new Signal("mapchange");
  currentMap: string = "kitchen";

  public constructor() {
    super("passiveSound");
    this.mapChangeSignal.listen((signalData: CustomEvent) => {
      this.currentMap = signalData.detail.params[0];
    });
  }

  public processEntity(entity: PassiveSoundEntity): boolean {
    return entity.name != null && entity.map != null && entity.passiveSound != null;
  }

  public update(deltaTime: number, now: number, entities: PassiveSoundEntity[]): void {
    entities.forEach(entity => {
      if (!this.processEntity(entity)) {
        return;
      }

      if (entity.map != this.currentMap) {
        //make sure no audio playing
        if (entity.passiveSound.sound) {
          entity.passiveSound.sound.stop();
          entity.passiveSound.sound.update();
          Audio.removeSound(entity.passiveSound.sound);
          entity.passiveSound.currentState = "default";
          entity.passiveSound.sound = undefined;
        }
        return;
      }

      if (!entity.velocity.zero) {
        //if moving AND sound is not defined
        if (!entity.passiveSound.sound) {
          entity.passiveSound.currentState = "walk";
          entity.passiveSound.sound = Audio.addSound({
            name: entity.passiveSound.states[entity.passiveSound.currentState].source,
            volume: entity.passiveSound.volume,
            loop: entity.passiveSound.states[entity.passiveSound.currentState].loop,
            type: "effect",
            autoplay: true,
          });
        }
      } else {
        //if stopped moving AND sound active... stop it
        if (entity.passiveSound.sound) {
          entity.passiveSound.sound.stop();
          entity.passiveSound.sound.update();
          Audio.removeSound(entity.passiveSound.sound);
          entity.passiveSound.currentState = "default";
          entity.passiveSound.sound = undefined;
        }
      }

      //map, directiton,
    });
  }
}

/*

handleStateChange = (signalData: CustomEvent) => {
    const who = signalData.detail.params[0];
    const state: string = signalData.detail.params[1];

    if (this.value.currentState == state) return;

    console.log("change of state: ", this.value.currentState, state);

    if (who != this.value.id)
      //test for id of entity
      return;
    console.log(this.value.states);

    //test to confirm if new state exists
    if (this.value.states[state] == undefined) return;

    this.value.currentState = state;
    //stop existing audio if active

    if (this.sound) {
      this.sound.stop();
      Audio.update();
      Audio.removeSound(this.sound);
    }

    if (this.value.currentState == "default") return;

    //setup new audio
    this.sound = Audio.addSound({
      name: this.value.states[this.value.currentState].source,
      volume: 1,
      loop: this.value.states[this.value.currentState].loop,
      type: "effect",
      autoplay: true,
    });
  };

*/
