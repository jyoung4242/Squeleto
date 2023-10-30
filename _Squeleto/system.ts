import { Entity } from "./entity";

export class System {
  template = ``;
  public static systems: Record<string, System> = {};

  constructor(public name: string) {
    System.systems[name] = this;
  }

  public static get(name: string): System {
    return this.systems[name];
  }

  processEntity(entity: Entity): boolean {
    return (entity as any)[this.name] != null;
  }

  public update(_deltaTime: number, _now: number, _entities: Entity[]): void {}
}
