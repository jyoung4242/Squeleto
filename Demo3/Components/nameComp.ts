import { Component } from "../../_SqueletoECS/component";

export interface INameComponent {
  name: string;
}

export type NameType = string;

export interface NameComponent {
  name: NameType;
}

export class Name extends Component {
  public template = `
    <style>
      .name-component {
        color: red;
        position: absolute;
        font-size: 5px;
        font-weight: bold;
        width: 50px;
        height: 16px;
        top: -8px;
        left: -16px;
        text-align: center;
      }
    </style>
    <div class="name-component">\${value}</div>
    `;

  public value = "";
  public constructor() {
    //@ts-ignore
    super("name", Name, true);
  }

  public define(data: string): void {
    if (data == null) {
      return;
    }
    this.value = data;
  }
}
