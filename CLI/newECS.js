import chalk from "chalk";
import { stat, mkdir } from "node:fs/promises";
import * as fs from "node:fs";
import path from "node:path";
import url from "node:url";
import process from "node:process";

export async function createECS(newProjectData, rootpath) {
  //setup new file structure
  const otherDIR_NAME = rootpath; //path.dirname(url.fileURLToPath(import.meta.url));
  const DIR_NAME = process.cwd();
  //format project name
  let projectDirName = toCamelCase(newProjectData.gamename);
  //let projectDirPath = newProjectData.cwd + "/" + projectDirName;
  let projectDirPath = path.join(DIR_NAME, projectDirName + "/");
  let projectNPMname = toCamelCase(newProjectData.gamename).toLowerCase();
  await checkAndMakeDirectory(projectDirPath);

  //make library directory

  await checkAndMakeDirectory(projectDirPath + "/_SqueletoECS");
  await checkAndMakeDirectory(projectDirPath + "/src");
  await checkAndMakeDirectory(projectDirPath + "/dist");
  await checkAndMakeDirectory(projectDirPath + "/public");

  console.log(otherDIR_NAME);
  console.log(DIR_NAME);

  //make the library files -
  await fs.cp(path.join(otherDIR_NAME, "_Squeleto/"), path.join(projectDirPath, "_SqueletoECS"), { recursive: true }, err => {
    if (err) console.log(err.message);
  });

  //make the library files -
  await fs.cp(path.join(otherDIR_NAME, "/src/"), path.join(projectDirPath, "src"), { recursive: true }, err => {
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
    "description": "my new ECS game project",
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
      "@peasy-lib/peasy-engine": "latest",
      "@peasy-lib/peasy-viewport": "latest",
      "uuid":"latest",
      "lodash": "latest"      
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
