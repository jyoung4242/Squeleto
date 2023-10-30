import { MultiPlayerInterface, User, Regions } from "../../_SqueletoECS/Multiplayer";

export interface ILobbyConfig {
  name: string;
  interface: MultiPlayerInterface;
  sceneSwitch: Function;
}

type GameType = "public" | "private" | "local";
type LoginStatus = "unconnected" | "connected";

/**************************
 * Lobby State
 *************************/
type LobbyState = {
  numPlayers: number;
  playerCapacity: number;
};

export class LobbyUI {
  playerCap: any;
  loginStatus: LoginStatus = "unconnected";
  disableStatus: string = "disabled";
  get oppoDisableStatus() {
    if (this.disableStatus == "disabled") return "";
    else return "disabled";
  }
  loginColor: string = "white";
  openGames = <any>[];
  gameType: GameType = "public";
  region: Regions = "Chicago";
  user: User = { token: "", userdata: { id: "", name: "" } };
  privateActiveCSS: string = "";
  publicActiveCSS: string = "";
  isLobbiesEmpty: boolean = true;
  cloudswitchPositionText = "flex-end";
  toggleServer = (_e: any, model: any) => {
    if (model.cloudswitchPositionText == "flex-start") {
      model.cloudswitchPositionText = "flex-end";
      this.isLocal = true;
      this.setGamePublic();
      this.gameType = "local";
      this.refreshLobbies();
    } else {
      model.cloudswitchPositionText = "flex-start";
      this.isLocal = false;
      this.clearPublicPrivate();
      this.refreshLobbies();
    }
  };
  isLocal: boolean = true;
  roomJoinInput: any;
  start: Function;
  HathoraClient: MultiPlayerInterface | undefined;

  public template = `
  <style>
  .LoginGrid{
    display: grid;
    grid-template-columns: 10px 1fr 1fr 1fr 1fr 1fr 10px;
    grid-template-rows: 10px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 10px;
    row-gap:3px;
    column-gap: 3px;
    width: 100%;
    height: 100%;
    
  }
  .Title{
    border: 1px solid white;
    border-radius: 3px;
    grid-column-start: 2;
    grid-column-end: 6;
    grid-row-start: 2;
    grid-row-end: 3;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .cloudSwitch{
    border: 1px solid white;
    border-radius: 3px;
    grid-column-start: 6;
    grid-column-end: 7;
    grid-row-start: 2;
    grid-row-end: 3;
    text-align: center;
    font-size: xx-small;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .openGames{
    font-size: x-small;
    border: 1px solid white;
    border-radius: 3px;
    grid-column-start: 2;
    grid-column-end: 5;
    grid-row-start: 3;
    grid-row-end: 9;
    overflow-y: scroll; 
  }
  .createGame{
    border: 1px solid white;
    border-radius: 3px;
    grid-column-start: 5;
    grid-column-end: 7;
    grid-row-start: 3;
    grid-row-end: 7;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 4px;
  }
  .JoinGame{
    width: 100%;
    border: 1px solid white;
    border-radius: 3px;
    grid-column-start: 5;
    grid-column-end: 7;
    grid-row-start: 7;
    grid-row-end: 9;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  .joinGameInput{
    width: 100px;
  }

  .createGameButtons{
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .lbyButton{
    min-width: 20%;
    border: 1px solid white;
    border-radius: 5000px;
    text-align: center;
    padding: 3px 4px;
    display: flex;
    flex-direction: column;
    justify-content:center;
    align-items: center;
  }
  .lbyButton:hover,
  .lbySelect:hover,
  .cs_switchcontainer:hover{
    box-shadow: 0px 0px 3px 3px rgba(255,255,255,0.75);
    cursor: pointer;
  }
  .lbyButton.disabled:hover{
    cursor: not-allowed;
    border: 1px solid #333333;
    color: #333333;
  }

  .lbyFlip{
    background-color: white;
    color: black;

  }

  .opengame{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 94%;
    margin: 2.5px;
    border: 0.5px solid white;
    font-size: 0.4vw;
    gap: 2px;
    padding-left: 2px;
    padding-right: 2px;
  }
  .lbyServerdata{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .titleblock{
    width: 94%;
    display:flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.4vw;
    background-color: #333333;
    margin: 2.5px;
    padding-left: 2px;
    padding-right: 4px;
  }

  .disabled{
    cursor: not-allowed;
    border: 1px solid #333333;
    color: #444444;
    background-color: #333333;
  }

  .smallbutton{
    width: auto; 
    font-size: xx-small;
  }

  .cswitch{
    width: 100%;
    height: 60%;
    margin-left: 4px;
    margin-right: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3px;
  }
  .cs_cloudtext{
    font-size: 5px;
  }
  .cs_localtext{
    font-size: 5px;
  }
  .cs_switchcontainer{
    width: 50%;
    border: 1px solid white;
    height: 100%;
    border-radius: 5000px;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: \${cloudswitchPositionText};
  }
  .cs_switchtrigger{
    width: 45%;
    aspect-ratio: 1/1;
    border: 1px solid white;
    background-color: white;
    border-radius: 50%;
  }

  .loginStatus{
    color: \${loginColor};
    font-size: 5px;
    grid-column-start: 1;
    grid-column-end: 5;
    grid-row-start: 9;
    grid-row-end: 10;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 5px;
  }

</style>
<div class="scene" style="width: 100%; height: 100%; position: absolute; top: 0; left:0; color: white;">
  
  <div class="LoginGrid">
      <div class="Title"><div>SQUELETO DEMO 3</div></div>
      <div class="cloudSwitch">
          <div class="cswitch">
            <div class="cs_cloudtext">cloud</div>
            <div class="cs_switchcontainer" >
                <div class="cs_switchtrigger" \${click@=>toggleServer}></div>
            </div>
            <div class="cs_localtext">local</div>
          </div>
      </div>
      <div class="openGames">
        <div \${click@=>refreshLobbies} style="cursor: pointer">Public Games - refresh</div>
        <div class="titleblock">
          <div class="titleblockID">Room ID</div>
          <div class="titleblockPlayers">Spots Free</div>
          <div class="titleblockServer">Server Deets</div>
          <div class="titleblockJoin">Join</div>
        </div>
        <div \${!==isLobbiesEmpty}>
          <div class='opengame' \${opengame<=*openGames}>
            <div class="lbyRoomID">
            \${opengame.roomId}
            </div>  
            <div class="">
              \${opengame.numPlayers}/\${opengame.playerCap}
            </div>  
            <div class="lbyServerdata">
              <div style="display: flex; justify-content: space-evenly; align-items: center; gap: 3px;">
                  <div>\${opengame.server}</div>
                  <div>\${opengame.started}</div>
              </div>
              <div>Owner: \${opengame.owner}</div>  
            </div>  
            <div class="">
              <div class="lbyButton" \${click@=>joinPublicGame}>Join</div>
            </div>  
          
          </div>
        </div>
        <div class='opengame' \${===isLobbiesEmpty}>
          <div style="text-align: center; padding: 4px;"> There are no public games available, please login and create a new game!</div>  
        </div>
      </div>
      <div class="createGame">
        <div class="createGameButtons">
          <div class="lbyButton \${publicActiveCSS} \${disableStatus}" \${click@=>setGamePublic} >Public</div>
          <div class="lbyButton \${privateActiveCSS} \${disableStatus}" \${click@=>setGamePrivate}>Private</div>
        </div>
        
          <select class="lbySelect " name="server" id="server">
            <option value="Seattle">Seattle</option>
            <option value="Washington_DC">Washingon DC</option>
            <option value="Chicago" selected>Chicago</option>
            <option value="London">London</option>
            <option value="Frankfurt">Frankfurt</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Singapore">Singapore</option>
            <option value="Tokyo">Tokyo</option>
            <option value="Sydney">Sydney</option>
            <option value="Sao_Paulo">Sao Paulo</option>
          </select>
          <select \${==>playerCap} class="lbySelect " name="player" id="player">
            <option value="1">1 Player</option>
            <option value="2">2 Players</option>
            <option value="3">3 Players</option>
          </select>
          <div class="lbyButton \${oppoDisableStatus}" \${click@=>login}>Login</div>
          <div class="lbyButton \${disableStatus}" \${click@=>createGame} >Create Game</div>
        
      </div>
      <div class="JoinGame">
        <div> Join Game </div>
        <div style="display: flex; width: 100%; justify-content:space-evenly;">
          <input class="joinGameInput"  style="width: 55%;" \${==>roomJoinInput}></input>
          <div class="lbyButton smallbutton \${disableStatus}" \${click@=>joinRoom}>Join</div>
        </div>
      </div>
      <div class="loginStatus">login status: \${loginStatus} id: \${user.userdata.id} username:  \${user.userdata.name} </div>
  </div>
    
</div>
  `;

  clearPublicPrivate = () => {
    this.gameType = "public";
    this.privateActiveCSS = "";
    this.publicActiveCSS = "";
  };

  setGamePublic = () => {
    this.gameType = "public";
    this.publicActiveCSS = "lbyFlip";
    this.privateActiveCSS = "";
  };
  setGamePrivate = () => {
    this.gameType = "private";
    this.privateActiveCSS = "lbyFlip";
    this.publicActiveCSS = "";
  };
  login = async () => {
    if (this.loginStatus == "connected") return;
    this.user = await (this.HathoraClient as MultiPlayerInterface).login();
    this.refreshLobbies();

    if (this.user.token != "" && this.user.userdata?.id != "") {
      this.loginStatus = "connected";
      this.loginColor = "yellow";
      this.disableStatus = "";
    }
  };
  refreshLobbies = async () => {
    let lobbies = <any>[];
    if (!this.isLocal) lobbies = await this.HathoraClient?.getPublicLobbies();
    else {
      if (this.HathoraClient?.roomID) {
        const roomdeets = await this.HathoraClient.getRoomInfo();

        lobbies.push(roomdeets);
      }
    }
    this.openGames = [];
    if (lobbies?.length != 0) {
      this.isLobbiesEmpty = false;
      lobbies?.forEach((lobby: any) => {
        this.openGames.push({
          roomId: lobby.roomId,
          playerCap: (lobby.initialConfig as LobbyState).playerCapacity,
          numPlayers: lobby.state ? this.getNumPlayers(lobby.state as LobbyState) : 0,
          server: lobby.region,
          owner: lobby.createdBy,
          started: lobby.createdAt.toLocaleDateString(),
        });
      });
    } else this.isLobbiesEmpty = true;
  };

  createGame = async () => {
    const cap = parseInt(this.playerCap.value);
    if (this.loginStatus == "unconnected") return;
    const lobbyState: LobbyState = {
      playerCapacity: cap,
      numPlayers: 0,
    };
    await this.HathoraClient?.createRoom(this.gameType, this.region, lobbyState);
    this.refreshLobbies();
  };

  private constructor(public name: string, HathoraClient: MultiPlayerInterface, switchScene: Function) {
    console.log("Lobby:", this);
    this.HathoraClient = HathoraClient;
    this.start = switchScene;
    this.HathoraClient.changeServerScope("local");
    this.setGamePublic();
  }

  public static create(config: ILobbyConfig): LobbyUI {
    return new LobbyUI(config.name, config.interface, config.sceneSwitch);
  }

  public update() {}

  joinPublicGame = async (e: any, model: any) => {
    //check for availability first
    const roomcheck = await this.doesRoomHaveFreeSpot();
    if (this.HathoraClient && this.HathoraClient.roomID && !roomcheck) {
      this.roomJoinInput.value = "";
    } else {
      await this.HathoraClient?.enterRoom(this.HathoraClient.roomID as string);
      console.log("start game");
      this.start();
    }
  };

  joinRoom = async (e: any, model: any) => {
    if (this.roomJoinInput.value == "") return;
    this.HathoraClient?.setRoomID(this.roomJoinInput.value);

    const roomcheck = await this.doesRoomHaveFreeSpot();
    if (this.HathoraClient && !roomcheck) {
      this.roomJoinInput.value = "";
    } else {
      await this.HathoraClient?.enterRoom(this.roomJoinInput.value);
      console.log("start game");

      this.start();
    }
  };

  getNumPlayers = (state: LobbyState): number => {
    return state.numPlayers;
  };

  doesRoomHaveFreeSpot = async (): Promise<boolean> => {
    const info = await this.HathoraClient?.getRoomInfo();

    if (info.state == undefined) {
      //first person in room
      console.log("returning true, no players");

      return true;
    } else if (info.state) {
      //existing room check if at capacity
      let { playerCapacity, numPlayers } = info.state;
      console.log(`Capacity: ${playerCapacity} , numbplayers in room: ${numPlayers}`);
      if (numPlayers < playerCapacity) {
        console.log("returning true, not full");
        return true;
      }
    }

    console.log("returning false, full");
    return false;
  };
}
