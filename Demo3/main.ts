//import Components
import { Viewport } from "../_Squeleto/Viewport";
import { StateManagement } from "../_Squeleto/StateManagement";
import { UI } from "@peasy-lib/peasy-ui";

/**************************************
 * Import and Configure Scenes
 **************************************/
//import Scenes
import { Login } from "./Scenes/login";
import { Game } from "./Scenes/game";
let scenes = [Login, Game];

/**************************************
 * Import and configure game Viewport
 **************************************/
export const datamodel = new StateManagement();
const viewport = Viewport;
viewport.initialize(datamodel, scenes, 500, "3.125/1.75");
const template = `${viewport.template}`;

/**************************************
//UI Rendering Engine instantiation
**************************************/

await UI.create(document.body, datamodel, template).attached;

/**************************************
//set default scene on startup
**************************************/
viewport.setScene(0);
