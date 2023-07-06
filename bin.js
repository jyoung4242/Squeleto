#!/usr/bin/env node
import chalk from "chalk";
import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import * as sh from "shelljs";

import { create } from "./new.js";
import { setupDemo1 } from "./demo1.js";
import { setupDemo2 } from "./demo2.js";

const { version } = JSON.parse(fs.readFileSync(new URL("package.json", import.meta.url), "utf-8"));
let newProjedtData;
const CWD = process.cwd();

p.intro(
  chalk.blueBright(`
    ************************************
    WELCOME TO SQUELETO INIT WIZARD
    Version ${version}
    ************************************`)
);

const projectType = await p.select({
  message: chalk.blueBright("Select your project option."),
  options: [
    { value: "new", label: chalk.blueBright("Start New Project"), hint: "Blank Projet" },
    { value: "d1", label: chalk.blueBright("Download Tutorial #1"), hint: "Top Down RPG" },
    { value: "d2", label: chalk.blueBright("Download Tutorial #2"), hint: "Side View Platformer" },
  ],
});
if (p.isCancel(projectType)) {
  console.log(
    chalk.yellowBright(`
  ************************************
  SQUELETO Setup cancelled.
  ************************************
  `)
  );

  process.exit(0);
}

switch (projectType) {
  case "new":
    await newProjectSurvey();
    if (newProjedtData.multiplayer) {
    } else {
      create(newProjedtData);
    }
    break;
  case "d1":
    setupDemo1();
    break;
  case "d2":
    setupDemo2();
    break;
}

p.outro(
  chalk.blueBright(`
      ************************************
      cd into your new directory
      run \`npm install\`
      run \`npm run dev\`
      SETUP COMPLETE - LEAVING SQUELETO
      ************************************`)
);

async function newProjectSurvey() {
  newProjedtData = await p.group(
    {
      author: () =>
        p.text({
          message: chalk.greenBright(`Enter your name: `),
          initialValue: "Bobs YourUncle",
          validate: value => {
            if (value.length == 0) {
              return "Value is required";
            }
          },
        }),
      cwd: () =>
        p.text({
          message: chalk.greenBright("Enter path to create project:"),
          initialValue: CWD,
          validate: value => {
            if (value.length == 0) {
              return "Value is required";
            }
          },
        }),
      gamename: () =>
        p.text({
          message: chalk.greenBright("Enter name of your project:"),
          initialValue: "myProject",
          validate: value => {
            if (value.length == 0) {
              return "Value is required";
            }
          },
        }),
      multiplayer: () => p.confirm({ message: chalk.greenBright("Is your game multiplayer?") }),
    },
    {
      // On Cancel callback that wraps the group
      // So if the user cancels one of the prompts in the group this function will be called
      onCancel: ({ results }) => {
        p.cancel(
          chalk.yellowBright(`
        ************************************
        SQUELETO Setup cancelled.
        ************************************
        `)
        );

        process.exit(0);
      },
    }
  );
}
