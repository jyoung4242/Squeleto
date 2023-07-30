import { v4 as uuidv4 } from "uuid";
import { Entity } from "../../_SqueletoECS/entity";

export class TemplateEntity {
  static create() {
    return Entity.create({
      id: uuidv4(),
      components: {
        foo: { data: "Welcome to Squeleto ECS" }, //this is tied to templateComponent.ts
      },
    });
  }
}
