// initialize all your system components here
// simply import then and create a new instance in the array
// for example
// import { Name } from "./nameComp";
// export function LoadComponents(){
//  [new Name(),... and all your other components follow]
// }

import { TemplateComp } from "./templateComponent";

// The template component is demonstrated by default, you'll probably
// want to replace it

export function LoadComponents() {
  [new TemplateComp()];
}
