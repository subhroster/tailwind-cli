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

// Function to create or update the HTML file
const updateHtmlFile = (htmlFilePath, cssFileName) => {
  const htmlContent = fs.existsSync(htmlFilePath)
    ? fs.readFileSync(htmlFilePath, 'utf-8')
    : '';

  // New link tag based on the input CSS file name
  const newLinkTag = `<link href="./dist/${cssFileName}" rel="stylesheet">`;

  if (!htmlContent.includes(newLinkTag)) {
    // Remove existing Tailwind CSS link
    const cleanedHtmlContent = htmlContent.replace(
      /<link href=".*?\.css".*?>/g,
      ''
    );
    const finalHtmlContent = cleanedHtmlContent.replace(
      '</head>',
      `${newLinkTag}\n</head>`
    );

    fs.writeFileSync(
      htmlFilePath,
      finalHtmlContent ||
        `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS Test</title>
    ${newLinkTag}
</head>
<body class="bg-gray-100">
    <div class="mx-auto mt-10 max-w-2xl">
      <h1 class="text-center text-3xl font-bold text-blue-500">
        Tailwind CSS is working!
      </h1>
      <p class="mt-4 text-center text-gray-600">
        This is a basic HTML template styled with Tailwind CSS.
      </p>
      <div class="flex justify-center mt-6">
        <button
          class="text-white bg-sky-700 px-4 py-2 hover:bg-sky-800 sm:px-8 sm:py-3"
        >
          Button
        </button>
      </div>
    </div>
</body>
</html>
    
        `
    );
    console.log(`Updated ${htmlFilePath} with the new CSS link.`);
  } else {
    console.log(
      `The link to ${cssFileName} already exists in ${htmlFilePath}. No changes made.`
    );
  }
};

// Step 1: Initialize npm project if package.json doesn't exist
if (!fs.existsSync('./package.json')) {
  console.log('Initializing npm project...');
  runCommand('npm init -y');
}

// Step 2: Install Tailwind CSS and dependencies
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

// Step 4: Prompt for CSS and HTML file names
inquirer
  .prompt([
    {
      type: 'input',
      name: 'cssFileName',
      message: 'Enter the CSS file name (default: styles.css):',
      default: 'styles.css',
    },
    {
      type: 'input',
      name: 'htmlFileName',
      message: 'Enter the HTML file name (default: index.html):',
      default: 'index.html',
    },
  ])
  .then((fileNames) => {
    const cssDir = path.join(process.cwd(), 'src/styles');
    const cssFilePath = path.join(cssDir, fileNames.cssFileName);
    const htmlFilePath = path.join(process.cwd(), fileNames.htmlFileName);

    // Create the CSS directory if it doesn't exist
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }

    // Create the Tailwind CSS file
    createCssFile(cssFilePath);

    // Step 5: Create or update the HTML file
    updateHtmlFile(htmlFilePath, fileNames.cssFileName);

    // Step 6: Update the build command in package.json
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    packageJson.scripts = {
      ...packageJson.scripts,
      'build:css': `tailwindcss -i ./src/styles/${fileNames.cssFileName} -o ./dist/${fileNames.cssFileName} --minify`,
      'watch:css': `tailwindcss -i ./src/styles/${fileNames.cssFileName} -o ./dist/${fileNames.cssFileName} --watch`,
    };
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    console.log(
      `Updated package.json with Tailwind build scripts for ${fileNames.cssFileName}.`
    );

    // Step 7: Create PostCSS config
    const postcssConfig = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    cssnano: {} // Add cssnano for optimization
  },
}
`;
    fs.writeFileSync('./postcss.config.js', postcssConfig.trim());
    console.log('Created postcss.config.js');

    // Step 8: Prompt for additional features after basic setup
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'integratePrettier',
          message:
            'Do you want to integrate Prettier with automatic sorting of class names?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'integrateEslint',
          message: 'Do you want to integrate ESLint?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'includeAccessibilityFeatures',
          message: 'Do you want to include accessibility features?',
          default: true,
        },
        {
          type: 'confirm',
          name: 'automateCssBuild',
          message: 'Do you want to automate the CSS build process?',
          default: true,
        },
      ])
      .then((answers) => {
        // Integrate Prettier
        if (answers.integratePrettier) {
          runCommand('npm install -D prettier prettier-plugin-tailwindcss');
          const prettierConfig = `
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "singleQuote": true,
  "trailingComma": "es5"
}
            `;
          fs.writeFileSync('./.prettierrc', prettierConfig.trim());
          console.log(
            'Integrated Prettier with automatic sorting of class names.'
          );
        }

        // Integrate ESLint
        if (answers.integrateEslint) {
          runCommand('npm install -D eslint eslint-plugin-react');
          const eslintConfig = `
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
            `;
          fs.writeFileSync('./.eslintrc.json', eslintConfig.trim());
          console.log('Integrated ESLint.');
        }

        // Include Accessibility Features
        if (answers.includeAccessibilityFeatures) {
          console.log(
            'Include accessibility features in your HTML files. Consider using semantic HTML elements and ARIA roles.'
          );
        }

        // Automate CSS Build Process
        if (answers.automateCssBuild) {
          console.log(
            'Automate the CSS build process by running "npm run watch:css" whenever you want to build your styles.'
          );
        }

        console.log(
          'Tailwind CSS setup complete! Run "npm run watch:css" and open the HTML file to confirm Tailwind is working.'
        );
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
