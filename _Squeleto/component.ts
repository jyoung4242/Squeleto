import { Entity } from "./entity";

export class Component {
  public static components: Record<string, Component> = {};

  public entity!: Entity;

  public constructor(private name: string, private type: Component, private assignValue = false) {
    Component.components[name] = type;
  }

  public static assignTo(entity: Entity, name: string, data: unknown): void {
    const component = name != null ? new (Component.components[name] as any)() : new (this as any)();
    component.entity = entity;
    component.define(data);

    Object.assign(entity, { [component.name]: component.assignValue ? component.value : component });
    if (component.template != null) {
      entity.components.push(component);
    }
  }

  public define(data: unknown): void {}
  public create() {}
}

export class ComponentManager {
  static register(components: Array<Component>) {}
}
