import { UserId, RoomId, Application, startServer, verifyJwt } from "@hathora/server-sdk";
import { LobbyV2Api } from "@hathora/hathora-cloud-sdk";
import { Vector } from "../../_SqueletoECS/Vector.ts";

import * as dotenv from "dotenv";
import { log } from "console";

/**************************
 * Game specific types and constants
 *************************/
type direction = "right" | "up" | "left" | "down" | "none";
type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type Color = RGB | RGBA | HEX;
const MAPWIDTH = 256;
const MAPHEIGHT = 256;
const lobbyClient = new LobbyV2Api();

/**************************
 * Lobby State
 *************************/
type LobbyState = {
  numPlayers: number;
  playerCapacity: number;
};

/**************************
 * Game State types
 *************************/
type InternalPlayer = {
  id: UserId;
  position: Vector;
  direction: direction;
  status: "idle" | "walk";
  velocity: Vector;
};

type InternalState = {
  players: InternalPlayer[];
  capacity: number;
};

const rooms: Map<RoomId, InternalState> = new Map();

/****************************
 * Client Messaging Types
 ***************************/

export type ClientMessageTypes = BaseClientType & ClientDirectionUpdateMessage;

type BaseClientType = {
  type: string;
};

export type ClientDirectionUpdateMessage = {
  type: "DirectionUpdate";
  msg: direction;
};

/****************************
 * Server Messaging Types
 ***************************/

export type ServerMessageTypes = BaseServerType &
  (ServerStateUpdateMessage | ServerStateUpdateMessage | ServerJoinMessage | ServerPlayerLeftMessage | ServerErrorMessage);

type BaseServerType = {
  type: string;
};

export type ServerStateUpdateMessage = {
  type: "stateupdate";
  state: InternalState;
};

export type ServerErrorMessage = {
  type: "serverError";
  errormessage: string;
};

export type ServerJoinMessage = {
  type: "newUser";
  player: InternalPlayer;
};

export type ServerPlayerLeftMessage = {
  type: "userLeftServer";
  playerID: string;
};

dotenv.config();

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

const app: Application = {
  verifyToken: (token: string, roomId: string): Promise<UserId | undefined> => {
    return new Promise((resolve, reject) => {
      let result;
      try {
        result = verifyJwt(token, process.env.HATHORA_APP_SECRET as string);
      } catch (error) {
        console.warn("Failed to Verify Token");
        reject();
      }

      if (result == undefined) {
        console.warn("Failed to Verify Token");
        reject();
      }
      resolve(result);
    });
  },
  subscribeUser: (roomId: RoomId, userId: UserId): Promise<void> => {
    return new Promise(async resolve => {
      console.log("subscribeUser", roomId, userId);
      try {
        const lobbyInfo = await lobbyClient.getLobbyInfo(process.env.HATHORA_APP_ID as string, roomId);
        const lobbyState: LobbyState = lobbyInfo.state as LobbyState;
        const initialConfig: LobbyState = lobbyInfo.initialConfig as LobbyState;

        /*************************************************
         * If room doesn't exist, create it and add to map
         ************************************************/
        if (!rooms.has(roomId)) {
          console.log("creating room");
          let newRoomState: InternalState = {
            players: [],
            capacity: lobbyState ? lobbyState.playerCapacity : initialConfig.playerCapacity,
          };
          rooms.set(roomId, newRoomState);
        }

        /*********************
         * get game state data
         ********************/
        const game = rooms.get(roomId);

        /*****************************************
         * if player limit not exceeded, proceed
         ****************************************/
        if (game?.players.length == game?.capacity) {
          /****************
           * Error handling
           ***************/
          console.warn("Current room at max capacity");
          server.closeConnection(roomId, userId, "Current room at max capacity");
          return;
        }

        /************************************************
         * create new player state, and add to game data
         ***********************************************/
        const newPlayer: InternalPlayer = {
          id: userId,
          direction: "down",
          position: new Vector(Math.random() * MAPWIDTH, Math.random() * MAPHEIGHT),
          velocity: new Vector(0, 0),
          status: "idle",
        };
        if (game) {
          game.players.push(newPlayer);
          updateLobbyData(game.capacity, game.players.length, roomId);
          //broadcast new user to all players
          const joinMessage: ServerJoinMessage = {
            type: "newUser",
            player: newPlayer,
          };
          console.log("join message");

          server.broadcastMessage(roomId, encoder.encode(JSON.stringify(joinMessage)));
        }
      } catch (error) {
        /****************
         * Error handling
         ***************/
        console.warn("failed to connect to room");
        server.closeConnection(roomId, userId, (error as Error).message);
      }
    });
  },

  unsubscribeUser: (roomId: RoomId, userId: UserId): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log("unsubscribeUser", roomId, userId);
      /***********************
       * Check for valid room
       ***********************/
      if (!rooms.has(roomId)) {
        return;
      }

      /*********************
       * Get room gamestate
       *********************/
      const game = rooms.get(roomId);

      /********************************
       * Find the player in gamestate
       * remove them from the game
       *******************************/
      const plrIndex = game?.players.findIndex(plr => plr.id == userId);
      if ((plrIndex as number) >= 0) {
        //broadcast new user to all players
        const leftMessage: ServerPlayerLeftMessage = {
          type: "userLeftServer",
          playerID: userId,
        };
        console.log("player leaving");

        server.broadcastMessage(roomId, encoder.encode(JSON.stringify(leftMessage)));
        game?.players.splice(plrIndex as number, 1);
      }
      resolve();
    });
  },

  /*
    The onMessage is the callback that manages all the clients messages to the server, this is where a bulk of your server code goes regarding
    responding to the client's messages
  */

  onMessage: (roomId: RoomId, userId: UserId, data: ArrayBuffer): Promise<void> => {
    return new Promise(resolve => {
      /*******************************************
       * Message received, confirm room and player
       ******************************************/
      if (!rooms.has(roomId)) return;
      const game = rooms.get(roomId)!;
      const player = game.players.find(player => player.id === userId);
      if (player === undefined) return;

      /***************************
       * Switch on message type
       **************************/
      const msg: ClientMessageTypes = JSON.parse(decoder.decode(data));

      switch (msg.type) {
        case "DirectionUpdate":
          const playerUpdated = userId;
          const playerDirection = msg.msg;

          updatePlayerDirection(roomId, playerUpdated, playerDirection);
          break;

        default:
          const errorMessage: ServerErrorMessage = {
            type: "serverError",
            errormessage: "invalid message type recevied from client",
          };
          console.log("server error");
          server.sendMessage(roomId, userId, encoder.encode(JSON.stringify(errorMessage)));
          break;
      }
      resolve();
    });
  },
};

const port = 9000;
const server = await startServer(app, port);
console.log(`Hathora Server listening on port ${port}`);

const updatePlayerDirection = (roomID: string, userId: string, direction: direction) => {
  //confirm room
  if (!rooms.has(roomID)) return;
  const room = rooms.get(roomID);
  const playerIndex = room?.players.findIndex((player: any) => player.id == userId);
  if ((playerIndex as number) >= 0 && room) {
    console.log("direction change: ", direction);

    if (direction != "none") {
      room.players[playerIndex as number].direction = direction;
      room.players[playerIndex as number].status = "walk";
    } else {
      room.players[playerIndex as number].status = "idle";
    }
  }
};

setInterval(() => {
  rooms.forEach((room, key) => {
    //****************
    //update positions
    //****************
    if (room.players.length >= 1) {
      room.players.forEach(player => {
        if (player.status == "walk") {
          switch (player.direction) {
            case "down":
              player.velocity.y = 5;
              player.velocity.x = 0;
              break;
            case "up":
              player.velocity.y = -5;
              player.velocity.x = 0;
              break;
            case "left":
              player.velocity.x = -5;
              player.velocity.y = 0;
              break;
            case "right":
              player.velocity.x = 5;
              player.velocity.y = 0;
              break;
          }
        } else {
          player.velocity.x = 0;
          player.velocity.y = 0;
        }

        player.position = player.position.add(player.velocity);
      });
      //*****************************
      //send state updates to all
      //****************************

      const stateupdate: ServerStateUpdateMessage = {
        type: "stateupdate",
        state: room,
      };

      server.broadcastMessage(key, encoder.encode(JSON.stringify(stateupdate)));
    }
  });
}, 100);

const updateLobbyData = async (cap: number, numPlayers: number, roomID: string) => {
  //process.env.APP_ID as string
  const devtoken = process.env.DEV_TOKEN;
  const lobbyState: LobbyState = {
    playerCapacity: cap,
    numPlayers: numPlayers,
  };

  console.log("update lobby state: ", lobbyState);

  return await lobbyClient.setLobbyState(
    process.env.HATHORA_APP_ID as string,
    roomID,
    { state: lobbyState },
    { headers: { Authorization: `Bearer ${process.env.DEV_TOKEN}`, "Content-Type": "application/json" } }
  );
};
