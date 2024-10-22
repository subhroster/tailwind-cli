#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

// Function to run shell commands
const runCommand = (command) => {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute: ${command}`, error);
        process.exit(1);
    }
};

// Function to create the CSS file with Tailwind directives
const createCssFile = (cssFilePath) => {
    const cssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

    fs.writeFileSync(cssFilePath, cssContent);
    console.log(`Created Tailwind CSS file at ${cssFilePath}`);
};

// Function to create a basic HTML template for testing Tailwind
const createHtmlFile = (htmlFilePath) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS Test</title>
    <link href="./dist/tailwind.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="max-w-2xl mx-auto mt-10">
        <h1 class="text-3xl font-bold text-center text-blue-500">Tailwind CSS is working!</h1>
        <p class="text-center text-gray-600 mt-4">This is a basic HTML template styled with Tailwind CSS.</p>
    </div>
</body>
</html>
    `;
    fs.writeFileSync(htmlFilePath, htmlContent);
    console.log(`Created HTML file at ${htmlFilePath}`);
};

// Prompt the user for the CSS and HTML file names
inquirer.prompt([
    {
        type: 'input',
        name: 'cssFileName',
        message: 'Enter the CSS file name (or leave blank for default "tailwind.css"):',
        default: 'tailwind.css',
    },
    {
        type: 'input',
        name: 'htmlFileName',
        message: 'Enter the HTML file name (or leave blank to generate "index.html"):',
        default: '',
    }
]).then((answers) => {
    const cssFileName = answers.cssFileName.trim() || 'tailwind.css';
    const htmlFileName = answers.htmlFileName.trim() || 'index.html';

    const cssDir = path.join(process.cwd(), 'src/styles');
    const cssFile = path.join(cssDir, cssFileName);

    // Step 1: Initialize a new npm project if `package.json` doesn't exist
    if (!fs.existsSync('./package.json')) {
        console.log('Initializing npm project...');
        runCommand('npm init -y');
    }

    // Step 2: Install Tailwind CSS and required dependencies
    console.log('Installing Tailwind CSS and dependencies...');
    runCommand('npm install -D tailwindcss postcss autoprefixer');

    // Step 3: Generate Tailwind configuration
    console.log('Generating Tailwind config...');
    const tailwindConfigContent = `
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // All files in the src directory
    './*.html', // Any HTML files in the root directory
    './**/*.html', // Any HTML files in subdirectories
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
    `;
    fs.writeFileSync('./tailwind.config.js', tailwindConfigContent.trim());
    console.log('Created tailwind.config.js');

    // Step 4: Create the CSS directory and file
    if (!fs.existsSync(cssDir)) {
        fs.mkdirSync(cssDir, { recursive: true });
    }

    createCssFile(cssFile);

    // Step 5: Create PostCSS config
    const postcssConfig = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
    `;
    fs.writeFileSync('./postcss.config.js', postcssConfig.trim());
    console.log('Created postcss.config.js');

    // Step 6: Add build script to package.json
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

    packageJson.scripts = {
        ...packageJson.scripts,
        "build:css": `tailwindcss build src/styles/${cssFileName} -o dist/tailwind.css`,
    };

    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with Tailwind build script');

    // Step 7: Create or update the HTML file for including the Tailwind CSS
    const htmlFilePath = path.join(process.cwd(), htmlFileName);

    if (fs.existsSync(htmlFilePath)) {
        // If the HTML file exists, update it to include the Tailwind CSS
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
        const updatedHtmlContent = htmlContent.replace('</head>', `  <link href="./dist/tailwind.css" rel="stylesheet">\n</head>`);
        fs.writeFileSync(htmlFilePath, updatedHtmlContent);
        console.log(`Updated ${htmlFileName} to include Tailwind CSS.`);
    } else {
        // Create a basic HTML template if file doesn't exist
        createHtmlFile(htmlFilePath);
    }

    console.log('Tailwind CSS setup complete! Run "npm run build:css" and open the HTML file to confirm Tailwind is working.');
}).catch((error) => {
    console.error('Error:', error);
});
