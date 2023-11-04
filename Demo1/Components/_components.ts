// initialize all your system components here
// simply import then and create a new instance in the array
// for example
// import { Name } from "./nameComp";
// export function LoadComponents(){
//  [new Name(),... and all your other components follow]
// }

import { Position } from "./positionComponent";
import { ZindexComp } from "./zindexComponent";
import { SizeComp } from "./sizeComponent";
import { OpacityComp } from "./opacityComponent";
import { SpriteComp } from "./sprite";
import { SpriteSheetComp } from "./spritesheet";
import { CameraFollowComp } from "./cameraFollow";
import { VelocityComp } from "./velocity";
import { KeyboardComp } from "./keyboard";
import { ColliderComp } from "./collider";
import { MapComp } from "./entitymap";
import { EventComp } from "./events";
import { RenderComp } from "./render";
import { NameComp } from "./name";
import { InteractionComp } from "./interactions";
import { PassiveSoundComp } from "./passiveSound";

// The template component is demonstrated by default, you'll probably
// want to replace it

export function LoadComponents() {
  [
    new Position(),
    new ZindexComp(),
    new SizeComp(),
    new OpacityComp(),
    new SpriteComp(),
    new SpriteSheetComp(),
    new CameraFollowComp(),
    new VelocityComp(),
    new KeyboardComp(),
    new ColliderComp(),
    new MapComp(),
    new EventComp(),
    new RenderComp(),
    new NameComp(),
    new InteractionComp(),
    new PassiveSoundComp(),
  ];
}
