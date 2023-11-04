// Library Modules
import { Viewport } from "@peasy-lib/peasy-viewport";
import { SceneManager } from "../_Squeleto/Scene";
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from "./types";
import "./style.css";

// Content Modules
import { LoadComponents } from "./Components/_components";

// Scenes
import { Login } from "./Scenes/login";
import { Game } from "./Scenes/game";

//StoryFlags(global)
import { StoryFlagSystem } from "./Systems/StoryFlags";

// Setting up Viewport
SceneManager.viewport = Viewport.create({ size: { x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT } });

// Components
LoadComponents();

//Setup Storyflags
StoryFlagSystem.init();

let sceneMgr = new SceneManager();

sceneMgr.register(Login, Game);
sceneMgr.set("Login");

//for debugging purposes
setTimeout(() => {
  let test = sceneMgr.get();
  console.log(test);
}, 10);
