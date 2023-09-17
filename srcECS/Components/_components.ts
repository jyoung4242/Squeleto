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

// The template component is demonstrated by default, you'll probably
// want to replace it

export function LoadComponents() {
  [new Position(), new ZindexComp(), new SizeComp(), new OpacityComp()];
}
