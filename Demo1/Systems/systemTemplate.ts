import { Entity } from "../../_Squeleto/entity";
import { System } from "../../_Squeleto/system";
import { TemplateComponent } from "../Components/templateComponent";

// type definition for ensuring the entity template has the correct components
// ComponentTypes are defined IN the components imported
export type TemplateEntity = Entity & TemplateComponent;

export class templateSystem extends System {
  public constructor() {
    super("template");
  }

  public processEntity(entity: TemplateEntity): boolean {
    // return the test to determine if the entity has the correct properties
    return entity.foo != null;
    // entities that have position and velocity properties can use this system
    return true;
  }

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: TemplateEntity[]): void {
    entities.forEach(entity => {
      // This is the screening for skipping entities that aren't impacted by this system
      // if you want to impact ALL entities, you can remove this
      if (!this.processEntity(entity)) {
        return;
      }
      console.log("Template Component Update Yay!");
      // insert code here on how you want to manipulate the entity properties
    });
  }
}
