// Library
import { Scene, SceneManager } from "../../_SqueletoECS/Scene";
import { Vector } from "../../_SqueletoECS/Vector";
import { Engine } from "@peasy-lib/peasy-engine";
import { HUD } from "../hud";

// Scene Systems
/* *README*
  You will import all your  ECS Systems here for this scene here
  for example
  import { MovementSystem } from "../Systems/Movement";
  The camera is required, so we already included it for you
  ... you're welcome ;)
*/

// Entities
import { TemplateEntity } from "../Entities/entityTemplate";
import { UI } from "@peasy-lib/peasy-ui";
/* *README*
  You will import all your  ECS entities for this scene here
  for example
  import { MapEntity } from "../Entities/mapEntity";
  import { DemoEntity } from "../Entities/demo";
*/
export class Test extends Scene {
  name: string = "test";
  entities: any = [];
  entitySystems: any = [];
  sceneSystems: any = [];
  public template = `
    <scene-layer>
        < \${ entity === } \${ entity <=* entities }>
        < \${ sceneSystem === } \${ sceneSystem <=* sceneSystems }
    </scene-layer>
  `;
  public init = (): void => {
    //load HUD
    let layers = SceneManager.viewport.layers;
    let hud = layers.find(lyr => lyr.name == "hud");

    if (hud) UI.create(hud.element, new HUD(), HUD.template);

    // add default entities to the array
    this.entities.push(TemplateEntity.create());

    //Systems being added for Scene to own
    this.sceneSystems.push();

    //Start GameLoop
    //Engine.create({ fps: 60, started: true, callback: this.update });
  };

  //GameLoop update method
  update = (deltaTime: number): void | Promise<void> => {
    this.sceneSystems.forEach((system: any) => {
      system.update(deltaTime / 1000, 0, this.entities);
    });
  };
}
