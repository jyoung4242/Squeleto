import { HathoraClient, HathoraConnection } from "@hathora/client-sdk";

export enum ClientMessageTypes {
  CONNECTION,
}

export enum AuthenticationType {
  anonymous = "anon",
  google = "google",
  nickname = "nickname",
  email = "email",
}

export default class MultiPlayerInterface {
  client: HathoraClient;
  token: string | null = null;
  connection: HathoraConnection | undefined;
  currentRoom: string;
  defaultRoom: string;
  appID: string;
  authTypes: Array<AuthenticationType>;
  portnum: number;
  updateCallback: Function;

  constructor(
    defaultRoomID: string,
    app_id: string,
    stateUpdateCallback: Function,
    portNum?: number | undefined | null,
    AuthTypes?: Array<AuthenticationType>,
    local?: boolean
  ) {
    let connectionInfo;
    this.portnum = portNum || 9000;

    if (local) connectionInfo = { host: "localhost", port: this.portnum, transportType: "tcp" as const };
    else connectionInfo = undefined; //cloud

    /*
    temporary gaurd condition for different auth types
    only support anonymous ATM
        
    if (AuthTypes != undefined) throw Error("only supporting anonymous auth ATM");

    if (AuthTypes) {
      this.authTypes = [...AuthTypes];
    } else {
      this.authTypes = [AuthenticationType.anonymous];
    }
    */

    this.authTypes = [AuthenticationType.anonymous];
    this.appID = app_id;
    this.defaultRoom = defaultRoomID;
    this.client = new HathoraClient(this.appID, connectionInfo);
    this.currentRoom = "";
    this.connection = undefined;
    this.updateCallback = stateUpdateCallback;
    this.login();
  }

  async login() {
    this.token = sessionStorage.getItem("token");
    /*
        will need to manage different types of auth here
    */
    if (!this.token) this.token = await this.client.loginAnonymous();
    sessionStorage.setItem("token", this.token);
    this.currentRoom = this.defaultRoom;
    if (this.token) this.init();
  }

  async init() {
    this.connection = await this.client.newConnection(this.currentRoom);
    this.connection.onClose(this.onClose);
    this.connection.onMessageJson(this.getJSONmsg);
    await this.connection.connect(this.token!);
    this.sendMessage(ClientMessageTypes.CONNECTION, "HELLO HATHORA");
  }

  async sendMessage(type: ClientMessageTypes, data: string) {
    this.connection?.writeJson({
      type: type,
      msg: data,
    });
  }

  onClose(e: any) {
    console.log("HATHORA CONNECTION FAILURE");
    console.log(`error:`, e);
  }

  getJSONmsg(msg: any) {
    console.log(`HATHORA SERVER MESSAGE`);
    console.log(`message: `, msg);
    this.updateCallback(msg);
  }

  async switchRoom(roomId: string) {
    this.connection!.disconnect();
    this.connection = await this.client.newConnection(roomId);
    this.connection.connect(this.token!);
    this.connection.onClose(this.onClose);
    this.connection.onMessageJson(this.getJSONmsg);
    this.currentRoom = roomId;
  }

  async enterLobby() {
    if (this.currentRoom == this.defaultRoom) return;
    this.connection!.disconnect();
    this.connection = await this.client.newConnection(this.defaultRoom);
    this.connection.connect(this.token!);
    this.connection.onClose(this.onClose);
    this.connection.onMessageJson(this.getJSONmsg);
    this.currentRoom = this.defaultRoom;
  }
}
