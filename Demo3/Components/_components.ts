// initialize all your system components here
// simply import then and create a new instance in the array
// for example
// import { Name } from "./nameComp";
// export function LoadComponents(){
//  [new Name(),... and all your other components follow]
// }

import { Name } from "./nameComp";
import { Position } from "./positionComp";
import { Sprite } from "./spriteComp";
import { KeyboardComp } from "./keyboard";
import { ZindexComp } from "./zindexComp";
import { Barbarian } from "./barbarian";

export function LoadComponents() {
  [new Name(), new Position(), new Sprite(), new KeyboardComp(), new ZindexComp(), new Barbarian()];
}
