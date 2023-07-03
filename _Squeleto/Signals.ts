export class Signal {
  signalName: string;
  sender: string;
  constructor(name: string, from?: string) {
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
    document.addEventListener(this.signalName as keyof DocumentEventMap, e => {
      callback(e);
    });
  }
}
