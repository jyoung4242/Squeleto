import { Sound } from "@peasy-lib/peasy-audio/dist/types/sound";
import { Component } from "../../_Squeleto/component";

type PassiveSoundState = {
  source: string;
  loop: boolean;
};

// you can define the incoming types when the component is created
export interface IPassiveSoundComponent {
  data: PassiveSoundType;
}
export type PassiveSoundType = {
  id: string;
  sound: Sound | undefined;
  currentState?: string;
  states: Record<string, PassiveSoundState>;
  volume: number;
};

// this is the exported interface that is used in systems modules
export interface PassiveSoundComponent {
  passiveSound: PassiveSoundType;
}

export class PassiveSoundComp extends Component {
  //setting default value

  public value: PassiveSoundType = {
    id: "",
    volume: 1,
    sound: undefined,
    currentState: "default",
    states: { default: { source: "", loop: false } },
  };
  public constructor() {
    //@ts-ignore
    super("passiveSound", PassiveSoundComp, true);
  }

  public define = (data: IPassiveSoundComponent): void => {
    if (data == null) {
      return;
    }

    this.value.id = data.data.id;
    this.value.volume = data.data.volume;
    let entries = Object.entries(data.data.states);
    entries.forEach(entry => (this.value.states[entry[0]] = entry[1]));
  };
}
