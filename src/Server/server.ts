import { Application, RoomId, startServer, UserId, verifyJwt } from "@hathora/server-sdk";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config();

type RoomData = Record<string, string[]>;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");
const LOBBY = process.env.LOBBY as string;
let roomMap: RoomData = { [LOBBY]: [] };

const app: Application = {
  verifyToken: (token: string, roomId: string): Promise<UserId | undefined> => {
    return new Promise((resolve, reject) => {
      const result = verifyJwt(token, process.env.APP_SECRET as string);
      if (result) resolve(result);
      else reject();
    });
  },
  subscribeUser: (roomId: RoomId, userId: UserId): Promise<void> => {
    return new Promise((resolve, reject) => {
      //create room in map
      if (!roomMap[roomId]) {
        roomMap[roomId] = [];
      }

      //check to make sure user not in room
      const findResult = roomMap[roomId].findIndex(user => user === userId);

      if (findResult != -1) {
        server.sendMessage(
          roomId,
          userId,
          encoder.encode(
            JSON.stringify({
              type: "ERROR",
              message: `user: ${userId} is already in room ${roomId}`,
            })
          )
        );
        reject();
      }

      roomMap[roomId].push(userId);
      server.broadcastMessage(
        roomId,
        encoder.encode(
          JSON.stringify({
            type: "USERLIST",
            roomID: roomId,
            users: [...roomMap[roomId]],
          })
        )
      );
      resolve();
    });
  },
  unsubscribeUser: (roomId: RoomId, userId: UserId): Promise<void> => {
    return new Promise((resolve, reject) => {
      const userIndex = roomMap[roomId].findIndex(i => i == userId);
      if (userIndex == -1) reject();
      roomMap[roomId].splice(userIndex, 1);
      const users = {
        [roomId]: [...roomMap[roomId]],
      };
      server.broadcastMessage(
        roomId,
        encoder.encode(
          JSON.stringify({
            type: "USERLIST",
            roomID: roomId,
            users: [...roomMap[roomId]],
          })
        )
      );
      resolve();
    });
  },

  /*
    The onMessage is the callback that manages all the clients messages to the server, this is where a bulk of your server code goes regarding
    responding to the client's messages
  */

  onMessage: (roomId: RoomId, userId: UserId, data: ArrayBuffer): Promise<void> => {
    return new Promise(resolve => {
      const msg = JSON.parse(decoder.decode(data));
      console.log(`message from ${userId}, in ${roomId}: `, msg);
      server.sendMessage(
        roomId,
        userId,
        encoder.encode(
          JSON.stringify({
            type: "SERVERMESSAGE",
            msg: "HELLO FROM SERVER",
          })
        )
      );
      resolve();
    });
  },
};

const port = 9000;
const server = await startServer(app, port);
console.log(`Hathora Server listening on port ${port}`);
