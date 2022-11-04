/**
 * Copyright (c) 2022, Oracle and/or its affiliates.
 * Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
 */
import fs from 'fs';
import fsx from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exit } from 'process';

const args = process.argv.slice(2);
const templateFolder = args[0];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const project = `${__dirname}/..`;

if (!fs.existsSync(`${project}/${templateFolder}`)) {
  console.error(`Template folder not found.  Run \'npx react-native init ${templateFolder}\', then try again.`);
  exit(1);
}

console.log(`Merging ${templateFolder} into project...`);

// Copy these folders
const foldersToCopy = ['android', 'ios'];
for (const folder of foldersToCopy) {
  console.log(`Moving ${templateFolder}/${folder} ==> ${project}/${folder}`);
  try {
    if (fs.existsSync(`${project}/${folder}`)) {
      fs.rmSync(`${project}/${folder}`, { recursive: true, force: true });
    }
    fsx.copySync(`${templateFolder}/${folder}`, `${project}/${folder}`, {
      overwrite: true
    });
  } catch (e) {
    console.log(e);
  }
}

// Merge the dependencies:
const templatePackageData = fs.readFileSync(`${templateFolder}/package.json`);
const templatePackage = JSON.parse(templatePackageData);

const projectPackageData = fs.readFileSync(`${project}/package.json`);
let projectPackage = JSON.parse(projectPackageData);

const combinedDependencies = { ...templatePackage.dependencies, ...projectPackage.dependencies };
projectPackage.dependencies = combinedDependencies;

const combinedDevDependencies = {...templatePackage.devDependencies, ...projectPackage.devDependencies};
projectPackage.devDependencies = combinedDevDependencies;

fs.renameSync(`${project}/package.json`, `${project}/package-original.json`);
fs.writeFileSync(`${project}/package.json`, JSON.stringify(projectPackage, null, 2));

fs.rmSync(templateFolder, { recursive: true, force: true });
//fs.renameSync(templateFolder, `../${templateFolder}-BACKUP`);
