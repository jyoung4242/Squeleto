#!/usr/bin/env node
import chalk from "chalk";
import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import * as sh from "shelljs";
import open from "open";

import { create } from "./new.js";
import { createECS } from "./newECS.js";
import { setupDemo1 } from "./demo1.js";
import { setupDemo2 } from "./demo2.js";
import { setupDemo3 } from "./demo3.js";

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
    { value: "new", label: chalk.blueBright("Start New Squeleto Basic Project"), hint: "Blank Projet" },
    { value: "newECS", label: chalk.blueBright("Start New Squeleto ECS Project"), hint: "Blank ECS Projet" },
    { value: "d1", label: chalk.blueBright("Download Tutorial #1"), hint: "Top Down RPG" },
    { value: "d2", label: chalk.blueBright("Download Tutorial #2"), hint: "Side View Platformer" },
    { value: "d3", label: chalk.blueBright("Download Tutorial #3"), hint: "ECS Format - MultiPlayer Client/Server" },
    { value: "d4", label: chalk.blueBright("Open Docs"), hint: "Squeleto Documentation" },
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
    create(newProjedtData);
    break;
  case "newECS":
    await newProjectSurvey();
    createECS(newProjedtData);
    break;
  case "d1":
    setupDemo1();
    break;
  case "d2":
    setupDemo2();
    break;
  case "d3":
    setupDemo3();
    break;
  case "d4":
    open("https://jyoung4242.github.io/Squeleto-Docs/#/");
    break;
}
if (projectType == "d4") {
  p.outro(
    chalk.blueBright(`
    OPENING DOCS - LEAVING SQUELETO
  `)
  );
} else {
  p.outro(
    chalk.blueBright(`
      ************************************
      cd into your new directory
      run \`npm install\`
      run \`npm run dev\`
      SETUP COMPLETE - LEAVING SQUELETO
      ************************************`)
  );
}

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
