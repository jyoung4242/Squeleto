// Library Modules
import { Viewport } from "@peasy-lib/peasy-viewport";
import { SceneManager } from "../_Squeleto/Scene";
import "./style.css";

// Content Modules
import { LoadComponents } from "./Components/_components";

// Scenes
import { Login } from "./Scenes/login";
import { Game } from "./Scenes/game";

//StoryFlags(global)
import { StoryFlagSystem } from "./Systems/StoryFlags";

// Setting up Viewport
export const VIEWPORT_WIDTH = 400;
const ASPECT_RATIO = 16 / 9;
export const VIEWPORT_HEIGHT = VIEWPORT_WIDTH / ASPECT_RATIO;
SceneManager.viewport = Viewport.create({ size: { x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT } });

// Components
LoadComponents();

//Setup Storyflags
StoryFlagSystem.init();

//Load Scenes
let sceneMgr = new SceneManager();
sceneMgr.register(Login, Game);
sceneMgr.set("Login");
