/*****************************************************************************
 * Event: DialogEvent
 * Components Required: none
 *
 * Signals: endSignal,startSignal,confirmSignal
 *
 * Parameters:
 * [0]- <object> or <string> - if this is string this triggers 'simple' mode
 * and if configuration object, it goes to custom mode
 *
 * Description:
 * based on the parameters passed on the creation of Event, allows the UI for the
 * dialog system to be rendered.  this routine sets up the Dialog configuration
 * and passes it to the dialog system via Signal
 * when the endDialog signal is received, cleans up the event
 ******************************************************************************/

import { Signal } from "../../_Squeleto/Signals";
import { Entity } from "../../_Squeleto/entity";
import { GameEvent } from "../Systems/Events";
import { v4 as uuid4 } from "uuid";

export class DialogEvent extends GameEvent {
  endSignal: Signal = new Signal("dialogComplete");
  startSignal: Signal = new Signal("dialog");
  confirmSignal: Signal = new Signal("confirm");
  isSimpleDialog: boolean = true;
  payload: string | object;
  id = uuid4();
  resolution: ((value: void | PromiseLike<void>) => void) | undefined;

  constructor(who: Entity | string | null, params: [...any]) {
    super(who, params);
    this.event = "DialogEvent";
    this.payload = params[0];

    if (typeof this.payload == "string") this.isSimpleDialog = true;
    else if (typeof this.payload == "object") this.isSimpleDialog = false;
    else throw new Error("invalid Dialog Event parameter");
    this.endSignal.listen(this.endDialog);
    this.confirmSignal.listen(this.confirmPressed);
  }

  confirmPressed = (id: string) => {
    if (this.eventStatus == "running" && this.isSimpleDialog) {
      this.eventStatus = "complete";
      if (this.resolution) this.resolution();
    }
  };

  endDialog = (signalData: CustomEvent) => {
    const signalID = signalData.detail.params[0];
    if (this.id == signalID) {
      this.eventStatus = "complete";
      if (this.resolution) this.resolution();
    }
  };

  static create(who: Entity | string | null, params: [...any]): DialogEvent {
    return new DialogEvent(who, params);
  }

  init(entities: Entity[]): Promise<void> {
    this.eventStatus = "running";

    return new Promise(resolve => {
      //do something
      let dialogConfig = {};

      if (this.isSimpleDialog) {
        dialogConfig = {
          id: this.id,
          buttonContent: "END",
          template: "basic",
          content: this.payload,
          showButton: true,
          shortcut: true,
        };
      } else {
        Object.assign(dialogConfig, this.payload, { id: this.id });
      }
      this.startSignal.send([dialogConfig]);
      this.resolution = resolve;
    });
  }
}
