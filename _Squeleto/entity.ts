import { Component } from "./component";

export interface IEntity extends Omit<Entity, "template" | "components"> {
  type?: string;
  components?: any; // Should be list of component definitions
}

export class Entity {
  public template = `
  <style>
    .entity {
      position: absolute;
      top: 0;
      left:0;
    }
  </style>
  <entity-layer \${===render} class="entity" style="
    transform: translate3d(\${position.x}px,\${position.y}px, 0px);
    width: \${size.x}px;
    height: \${size.y}px;
    z-index:\${zindex}; 
    opacity: \${opacity};
    ">
    < \${ component === } \${ component <=* components } >
  </entity-layer>
  `;

  public components: Component[] = [];

  private constructor(public id: string) {}

  public static create(data: IEntity): Entity {
    const entity = new Entity(data.id);

    for (const [component, componentData] of Object.entries(data.components)) {
      Component.assignTo(entity, component, componentData);
    }
    return entity;
  }
}
