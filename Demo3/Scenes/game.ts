//Library
import { Scene } from "../../_SqueletoECS/Scene";
import { Engine } from "@peasy-lib/peasy-engine";
import { Vector } from "../../_SqueletoECS/Vector";
import { MultiPlayerInterface } from "../../_SqueletoECS/Multiplayer";
import { Entity } from "../../_SqueletoECS/entity";

//Scene Systems
import { Camera, ICameraConfig } from "../../_SqueletoECS/Camera";
import { KeypressSystem } from "../Systems/keypress";

//Entities
import { PlayerEntity } from "../Entities/playerEntity";
import { MapEntity } from "../Entities/map";

//Server Messages
import {
  ServerMessageTypes,
  ServerErrorMessage,
  ServerStateUpdateMessage,
  ServerJoinMessage,
  ServerPlayerLeftMessage,
} from "../Server/server";
import { log } from "console";

export class Game extends Scene {
  camera: Camera | undefined;
  firstUpdate: Boolean = true;
  name: string = "game";
  entities: any = [];
  entitySystems: any = [];
  sceneSystems: any = [];
  HathoraClient: MultiPlayerInterface | undefined;
  public template = `
      <scene-layer>
          < \${ sceneSystem === } \${ sceneSystem <=* sceneSystems }
      </scene-layer>
    `;

  public init(): void {
    console.log("**************************************");
    console.log("ENTERING GAME SCENE");
    console.log("**************************************");
    this.HathoraClient = this.params[0];
    (this.HathoraClient as MultiPlayerInterface).updateCallback = this.serverMessageHandler;

    console.log("creating camera");
    const cameraConfig: ICameraConfig = {
      name: "camera",
      gameEntities: this.entities,
      position: new Vector(0, 0),
      size: new Vector(400, 266.67),
      viewPortSystems: [],
    };

    let camera = Camera.create(cameraConfig);

    this.entities.push(MapEntity.create());
    camera.vpSystems.push(new KeypressSystem(this.HathoraClient as MultiPlayerInterface));
    this.camera = camera;
    //GameLoop
    console.log("starting engine");
    this.sceneSystems.push(camera);
    console.log(this.entities);

    Engine.create({ fps: 60, started: true, callback: this.update });
  }

  public exit(): void {}

  serverMessageHandler = (msg: ServerMessageTypes) => {
    switch (msg.type) {
      case "stateupdate":
        this.stateUpdate((msg as ServerStateUpdateMessage).state);
        break;
      case "newUser":
        this.addEntity((msg as ServerJoinMessage).player);
        break;
      case "userLeftServer":
        this.removeEntity((msg as ServerPlayerLeftMessage).playerID);
        break;
      case "serverError":
        console.warn((msg as ServerErrorMessage).errormessage);
        break;
    }
  };

  update = (deltaTime: number) => {
    this.sceneSystems.forEach((system: any) => {
      system.update(deltaTime / 1000, 0, this.entities);
    });
  };

  stateUpdate(state: any) {
    if (this.firstUpdate) {
      this.firstUpdate = false;
      console.log(state);
      state.players.forEach((player: any) => {
        this.addEntity(player);
      });
      if (this.getClientEntity()) this.camera?.follow(this.getClientEntity() as Entity);
    }

    this.entities.forEach((entity: any) => {
      //find entity in state
      if (entity.name) {
        const entIndex = state.players.findIndex((player: any) => player.id == entity.name);
        if (entIndex >= 0) {
          entity.position = state.players[entIndex].position;
          const status = state.players[entIndex].status;
          const direction = state.players[entIndex].direction;
          console.log();

          if (status != entity.barbarian.status || direction != entity.barbarian.direction)
            entity.barbarian.changeSequence(status, direction);
        }
      }
    });
  }

  addEntity = (newPlayer: any) => {
    //look to ensure entity, doesn't already exist

    const entIndex = this.entities.findIndex((ent: any) => {
      return ent.name == newPlayer.id;
    });
    if (entIndex == -1) {
      console.log("ADDING ENTITY: ", newPlayer);
      this.entities.push(PlayerEntity.create(newPlayer.id, newPlayer.position));
      console.log(this.entities);
      if (this.getClientEntity()) this.camera?.follow(this.getClientEntity() as Entity);
    }
  };

  removeEntity = (playerID: string) => {
    //find Index of player
    const playerIndex = this.entities.findIndex((plr: any) => {
      plr.id == playerID;
    });
    if (playerIndex >= 0) {
      console.log("REMOVING ENTITY: ", playerID);
      this.entities.splice(playerIndex, 1);
    }
  };

  getClientEntity = (): Entity | undefined => {
    const entIndex = this.entities.findIndex((ent: any) => ent.name == this.HathoraClient?.userdata.id);
    if (entIndex >= 0) {
      return this.entities[entIndex];
    }
    return undefined;
  };
}
