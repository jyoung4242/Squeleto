import { Sound } from "@peasy-lib/peasy-audio/dist/types/sound";
import { Entity } from "../../_Squeleto/entity";
import { GameEvent } from "../Systems/Events";
import { Audio } from "@peasy-lib/peasy-audio";

export class PlaySoundEvent extends GameEvent {
  source: string = "";
  gain: number = 0;
  loop: boolean;
  sound: Sound | undefined;
  howlong: number | undefined;

  constructor(who: Entity | string | null, params: [...any]) {
    super(who, params);
    this.event = "PlaySoundEvent";
    this.source = params[0];
    if (params[1] == undefined) this.gain = 1;
    else this.gain = params[1];
    if (params[2] == undefined) this.loop = false;
    else this.loop = params[2];
  }

  static create(who: Entity | string | null, params: [...any]): PlaySoundEvent {
    return new PlaySoundEvent(who, params);
  }

  init(entities: Entity[]): Promise<void> {
    if (this.sound) {
      Audio.removeSound(this.sound);
    }

    this.eventStatus = "running";
    this.sound = Audio.addSound({
      name: this.source,
      volume: this.gain,
      loop: this.loop,
      type: "effect",
      autoplay: true,
    });

    return new Promise(resolve => {
      this.eventStatus = "complete";
      resolve();
    });
  }
}
