import chalk from "chalk";
import { stat, mkdir } from "node:fs/promises";
import * as fs from "node:fs";
import path from "node:path";
import url from "node:url";
import shell from "shelljs";
import process from "node:process";
import { log } from "@clack/prompts";

export async function create(newProjectData) {
  //setup new file structure
  //const DIR_NAME = path.dirname(url.fileURLToPath(import.meta.url));
  const DIR_NAME = process.cwd();
  console.log("Current Working Directory", DIR_NAME);
  //format project name
  let projectDirName = toCamelCase(newProjectData.gamename);
  //let projectDirPath = newProjectData.cwd + "/" + projectDirName;
  let projectDirPath = path.join(DIR_NAME, projectDirName);
  console.log("Created Project Path: ", projectDirPath);
  let projectNPMname = toCamelCase(newProjectData.gamename).toLowerCase();
  await checkAndMakeDirectory(projectDirPath);

  //make library directory

  await checkAndMakeDirectory(projectDirPath + "/_Squeleto");
  await checkAndMakeDirectory(projectDirPath + "/src");
  await checkAndMakeDirectory(projectDirPath + "/dist");
  await checkAndMakeDirectory(projectDirPath + "/public");

  //make the library files
  await fs.cp(DIR_NAME + "\\_Squeleto\\", projectDirPath + "/_Squeleto/", { recursive: true }, err => {
    if (err) console.log(err.message);
  });

  await checkAndMakeDirectory(projectDirPath + "/src/Assets");
  await checkAndMakeDirectory(projectDirPath + "/src/Cutscenes");
  await checkAndMakeDirectory(projectDirPath + "/src/Dialogue");
  await checkAndMakeDirectory(projectDirPath + "/src/Events");
  await checkAndMakeDirectory(projectDirPath + "/src/Game Objects");
  await checkAndMakeDirectory(projectDirPath + "/src/Maps");
  await checkAndMakeDirectory(projectDirPath + "/src/PlugIns");

  //scenes
  await fs.cp(DIR_NAME + "\\src\\Scenes", projectDirPath + "/src/Scenes", { recursive: true }, err => {
    if (err) console.log(err.message);
  });

  //main.ts
  await fs.cp(DIR_NAME + "\\src\\main.ts", projectDirPath + "/src/main.ts", {}, err => {
    if (err) console.log(err.message);
  });

  //style.css
  await fs.cp(DIR_NAME + "\\src\\style.css", projectDirPath + "/src/style.css", {}, err => {
    if (err) console.log(err.message);
  });

  //index.html
  await fs.cp(DIR_NAME + "\\index.html", projectDirPath + "/index.html", {}, err => {
    if (err) console.log(err.message);
  });

  await fs.writeFile(
    projectDirPath + "/package.json",
    `
  {
    "name": "${projectNPMname}",
    "version": "1.0.0",
    "description": "my new game project",
    "main": "index.js",
    "scripts": {
      "build": "vite build",
      "dev": "vite",
      "preview": "vite preview"
    },
    "keywords": [],
    "author": "${newProjectData.author}",
    "license": "ISC",
    "dependencies": {
      "@peasy-lib/peasy-assets": "latest",
      "@peasy-lib/peasy-input": "latest",
      "@peasy-lib/peasy-ui": "latest",
      "@peasy-lib/peasy-states": "latest",
      "@peasy-lib/peasy-engine": "latest"
      
    },
    "devDependencies": {
      "json": "latest",
      "typescript": "latest",
      "vite": "latest"
    }
  }`,
    {},
    err => {
      if (err) console.log(err.message);
    }
  );

  //tsconfig.json
  await fs.cp(DIR_NAME + "\\tsconfig.json", projectDirPath + "/tsconfig.json", {}, err => {
    if (err) console.log(err.message);
  });

  //vite.config.js
  await fs.cp(DIR_NAME + "\\vite.config.js", projectDirPath + "/vite.config.js", {}, err => {
    if (err) console.log(err.message);
  });

  console.log(chalk.blueBright(`Created ${projectNPMname} project at ${projectDirPath}`));
}

function toCamelCase(inputString) {
  let capstring = inputString.toLowerCase().replace(/\b\w/g, function (m) {
    return m.toUpperCase();
  });
  let camelCaseString = "";
  let camelCaseArray = capstring.split(" ");
  camelCaseArray.forEach((token, index) => {
    if (index == 0) {
      token = token.toLowerCase();
    }
    camelCaseString = camelCaseString.concat(token);
  });
  return camelCaseString;
}

async function checkAndMakeDirectory(dir) {
  try {
    await stat(dir);
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        await mkdir(dir);
      } catch (err) {
        console.error(err.message);
      }
    }
  }
}
