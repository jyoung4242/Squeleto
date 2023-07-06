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
  const otherDIR_NAME = path.dirname(url.fileURLToPath(import.meta.url));
  const DIR_NAME = process.cwd();
  //format project name
  let projectDirName = toCamelCase(newProjectData.gamename);
  //let projectDirPath = newProjectData.cwd + "/" + projectDirName;
  let projectDirPath = path.join(DIR_NAME, projectDirName + "/");
  let projectNPMname = toCamelCase(newProjectData.gamename).toLowerCase();
  await checkAndMakeDirectory(projectDirPath);

  //make library directory

  await checkAndMakeDirectory(projectDirPath + "/_Squeleto");
  await checkAndMakeDirectory(projectDirPath + "/src");
  await checkAndMakeDirectory(projectDirPath + "/dist");
  await checkAndMakeDirectory(projectDirPath + "/public");

  //make the library files - \\_Squeleto\\
  await fs.cp(path.join(otherDIR_NAME, "_Squeleto\\"), projectDirPath + "/_Squeleto/", { recursive: true }, err => {
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
  /* console.log(chalk.redBright("*********************************"));
  console.log(chalk.redBright(DIR_NAME + "src/Scenes"));
  console.log(chalk.redBright(projectDirPath + "/src/Scenes"));
  console.log(chalk.redBright(path.join(projectDirPath, "src/Scenes")));
  console.log(chalk.redBright(path.join(otherDIR_NAME, "src/Scenes")));
  console.log(chalk.redBright("*********************************")); */

  /*  await fs.cp(DIR_NAME + "\\src\\Scenes", path.join(projectDirPath, "src/Scenes"), { recursive: true }, err => {
    if (err) console.log(err.message);
  }); */

  await fs.cp(path.join(otherDIR_NAME, "src/Scenes"), path.join(projectDirPath, "src/Scenes"), { recursive: true }, err => {
    if (err) console.log(err.message);
  });

  //main.ts src\\main.ts
  await fs.cp(path.join(otherDIR_NAME, "src/main.ts"), path.join(projectDirPath + "src/main.ts"), {}, err => {
    if (err) console.log(err.message);
  });

  //style.css "\\src\\style.css"
  await fs.cp(path.join(otherDIR_NAME, "src/style.css"), path.join(projectDirPath + "src/style.css"), {}, err => {
    if (err) console.log(err.message);
  });

  //index.html
  await fs.cp(path.join(otherDIR_NAME, "index.html"), path.join(projectDirPath + "index.html"), {}, err => {
    if (err) console.log(err.message);
  });

  await fs.writeFile(
    path.join(projectDirPath + "/package.json"),
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
  await fs.cp(path.join(otherDIR_NAME, "tsconfig.json"), projectDirPath + "/tsconfig.json", {}, err => {
    if (err) console.log(err.message);
  });

  //vite.config.js
  await fs.cp(path.join(otherDIR_NAME, "vite.config.js"), projectDirPath + "/vite.config.js", {}, err => {
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
    //console.log(dir, "line 129");
    await stat(dir);
  } catch (error) {
    //console.log("line 131", error);
    if (error.code === "ENOENT") {
      try {
        await mkdir(dir, err => {
          if (err) {
            return console.log("Error creating file/directory");
          }
          console.log("File/Directory created successfully!");
        });
      } catch (err) {
        console.error("line 136", err.message);
      }
    }
  }
}
