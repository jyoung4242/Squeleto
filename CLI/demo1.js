import chalk from "chalk";
import { stat, mkdir } from "node:fs/promises";
import * as fs from "node:fs";
import path from "node:path";
import url from "node:url";

export async function setupDemo1(rootpath) {
  //setup new file structure
  //const DIR_NAME = path.dirname(url.fileURLToPath(import.meta.url));
  const otherDIR_NAME = rootpath; //path.dirname(url.fileURLToPath(import.meta.url));
  const DIR_NAME = process.cwd();
  //format project name
  let projectDirName = toCamelCase("Squeleto Demo 1");
  //let projectDirPath = "." + "/" + projectDirName;
  let projectDirPath = path.join(DIR_NAME, projectDirName + "/");
  let projectNPMname = toCamelCase("SqueletoDemo1").toLowerCase();
  await checkAndMakeDirectory(projectDirPath);

  //make library directory

  await checkAndMakeDirectory(projectDirPath + "/_Squeleto");
  await checkAndMakeDirectory(projectDirPath + "/src");
  await checkAndMakeDirectory(projectDirPath + "/dist");
  await checkAndMakeDirectory(projectDirPath + "/public");

  //make the library files-
  await fs.cp(path.join(otherDIR_NAME, "_Squeleto/"), path.join(projectDirPath, "_Squeleto"), { recursive: true }, err => {
    if (err) console.log(err.message);
  });

  //scenes path.join(otherDIR_NAME, "Demo1\\")
  await fs.cp(path.join(otherDIR_NAME, "Demo1/"), path.join(projectDirPath, "src"), { recursive: true }, err => {
    if (err) console.log(err.message);
  });

  //main.ts
  await fs.cp(path.join(otherDIR_NAME, "Demo1/main.ts"), path.join(projectDirPath, "src/main.ts"), {}, err => {
    if (err) console.log(err.message);
  });

  //style.css \demo1\styles.css
  await fs.cp(path.join(otherDIR_NAME, "Demo1/style.css"), path.join(projectDirPath, "src/style.css"), {}, err => {
    if (err) console.log(err.message);
  });

  //index.html
  await fs.cp(path.join(otherDIR_NAME, "index.html"), path.join(projectDirPath, "index.html"), {}, err => {
    if (err) console.log(err.message);
  });

  await fs.writeFile(
    projectDirPath + "/package.json",
    `
  {
    "name": "squeleto_demo1",
    "version": "1.0.0",
    "description": "my new game project",
    "main": "index.js",
    "scripts": {
      "build": "vite build",
      "dev": "vite",
      "preview": "vite preview"
    },
    "keywords": [],
    "author": "Mookie",
    "license": "ISC",
    "dependencies": {
      "@peasy-lib/peasy-assets": "latest",
      "@peasy-lib/peasy-input": "latest",
      "@peasy-lib/peasy-ui": "latest",
      "@peasy-lib/peasy-states": "latest",
      "@peasy-lib/peasy-engine": "latest",
      "howler": "latest",
      "uuid": "latest"

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

  //tsconfig.json path.join(otherDIR_NAME, "tsconfig.json"), path.join(projectDirPath, "tsconfig.json")
  await fs.cp(path.join(otherDIR_NAME, "tsconfig.json"), path.join(projectDirPath, "tsconfig.json"), {}, err => {
    if (err) console.log(err.message);
  });

  //vite.config.js
  await fs.cp(path.join(otherDIR_NAME, "vite.config.js"), path.join(projectDirPath, "vite.config.js"), {}, err => {
    if (err) console.log(err.message);
  });

  console.log(chalk.blueBright(`Created Squeleto Demo 1 project at ${projectDirPath}`));
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
