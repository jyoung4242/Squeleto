// Library Modules
import { Viewport } from "@peasy-lib/peasy-viewport";
import { SceneManager } from "../_SqueletoECS/Scene";
import "./style.css";

// Content Modules
import { LoadComponents } from "./Components/_components";

// Scenes
import { Test } from "./Scenes/demoScene";

// Setting up Viewport with a HUD layer and the Game layer
const VIEWPORT_WIDTH = 400;
const ASPECT_RATIO = 16 / 9;
const VIEWPORT_HEIGHT = VIEWPORT_WIDTH / ASPECT_RATIO;

let viewport = Viewport.create({ size: { x: VIEWPORT_WIDTH, y: VIEWPORT_HEIGHT } });
viewport.addLayers([{ name: "game", parallax: 0 }, { name: "hud" }]);
SceneManager.viewport = viewport;

// Components
LoadComponents();

//Load Scenes
let sceneMgr = new SceneManager();
sceneMgr.register(Test);
sceneMgr.set("test");
