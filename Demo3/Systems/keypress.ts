import { Entity } from "../../_SqueletoECS/entity";
import { System } from "../../_SqueletoECS/system";
import { MultiPlayerInterface } from "../../_SqueletoECS/Multiplayer";
import { NameComponent } from "../Components/nameComp";

const directions = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};
const keys: any = {
  ArrowUp: directions.up,
  ArrowLeft: directions.left,
  ArrowRight: directions.right,
  ArrowDown: directions.down,
};

// type definition for ensuring the entity template has the correct components
// ComponentTypes are defined IN the components imported
export type KeypressEntity = Entity & NameComponent;

export class KeypressSystem extends System {
  lastkeypressed: string = "none";
  template = ``;
  held_direction = <any>[];
  userId: string;
  serverConnection: MultiPlayerInterface;
  public constructor(HthraConnection: MultiPlayerInterface) {
    super("keyboard");

    this.userId = HthraConnection.userdata.id;
    this.serverConnection = HthraConnection;

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      let dir = keys[e.code];
      if (dir && this.held_direction.indexOf(dir) === -1) {
        this.held_direction.unshift(dir);
      }
    });
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      var dir = keys[e.code];
      var index = this.held_direction.indexOf(dir);
      if (index > -1) {
        this.held_direction.splice(index, 1);
      }
    });
  }

  public processEntity(entity: KeypressEntity): boolean {
    // return the test to determine if the entity has the correct properties
    // return entity.position != null && entity.velocity != null; for example demostrates that only
    // entities that have position and velocity properties can use this system

    return this.userId == entity.name;
  }

  // update routine that is called by the gameloop engine
  public update(deltaTime: number, now: number, entities: KeypressEntity[]): void {
    entities.forEach(entity => {
      // This is the screening for skipping entities that aren't impacted by this system
      // if you want to impact ALL entities, you can remove this
      if (!this.processEntity(entity)) {
        return;
      }

      if (this.held_direction[0] != this.lastkeypressed) {
        console.log(this.held_direction);

        if (this.held_direction.length == 0 || this.held_direction[0] == undefined) {
          console.log("sending none");
          this.serverConnection.sendMessage("DirectionUpdate", "none");
        } else {
          console.log("sending: ", this.held_direction[0]);
          this.serverConnection.sendMessage("DirectionUpdate", this.held_direction[0]);
        }
        this.lastkeypressed = this.held_direction[0];
      }
    });
  }
}
