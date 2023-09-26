import { UI, UIView } from "@peasy-lib/peasy-ui";

export class HUD {
  welcomeText = "WELCOME TO SQUELETO ECS";
  static template = `
  <style>
        .hudTitle{
            position: fixed;
            inset: 0 0 0 0;
            display: flex;
            justify-content: center;
            align-items: center;            
        }
  </style>
  <div class="hudTitle">\${welcomeText}</div>
  `;
  create() {}
}
