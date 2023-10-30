import { Entity } from "./entity";

export class Signal {
  controller: AbortController | undefined | null;
  signalName: string;
  sender: string | Entity;
  callback: Function | undefined;
  constructor(name: string, from?: string | Entity) {
    this.signalName = name;
    from ? (this.sender = from) : (this.sender = "");
  }

  send(params?: Array<any>) {
    let event;
    if (params) {
      event = new CustomEvent(this.signalName, { detail: { who: this.sender, params: [...params] } });
    } else {
      event = new CustomEvent(this.signalName, { detail: { who: this.sender } });
    }

    document.dispatchEvent(event);
  }

  listen(callback: Function) {
    this.callback = callback;
    this.controller = new AbortController();
    document.addEventListener(
      this.signalName as keyof DocumentEventMap,
      (e: CustomEventInit) => {
        if (this.callback) this.callback(e);
      },
      { signal: this.controller.signal }
    );
  }

  stopListening() {
    if (this.controller) this.controller.abort();
    this.controller = null;
  }
}
