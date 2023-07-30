//Library Modules
import "./style.css";
import { SceneManager } from "../_SqueletoECS/Scene";

//Content Modules
import { LoadComponents } from "./Components/_components";

//Scenes
import { Lobby } from "./Scenes/lobby";
import { Game } from "./Scenes/game";

//Components
LoadComponents();

//Load Scenes
let sceneMgr = new SceneManager();
sceneMgr.register(Lobby, Game);
sceneMgr.set("lobby");
