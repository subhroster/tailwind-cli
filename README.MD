# Tailwind CLI

A command line tool for setting up Tailwind CSS with Prettier integration for automatic class sorting.

## Installation

To install the package globally, run:

npm install -g tailwind-cli

## Usage

After installing the package, you can set up Tailwind CSS by running:

```
tailwind-setup
```

### Configuration Options

During the setup process, you will be prompted to enter the following:

1. CSS File Name: Specify the name of your CSS file (default: styles.css).
2. HTML File Name: Specify the name of your HTML file (default: index.html).

### Additional Features

You will also be prompted for the following integrations:

- Integrate Prettier: Integrate Prettier with automatic sorting of class names.
- Integrate ESLint: Integrate ESLint for linting your code.
- Include Accessibility Features: Include recommendations for accessibility in your HTML files.
- Automate CSS Build: Set up automated CSS build processes.

## Commands

After the setup, you can use the following commands:

- Build CSS:
  npm run build:css

- Watch for changes in CSS:
  npm run watch:css

## Prettier Class Sorting Troubleshooting

To set up Prettier with automatic sorting of Tailwind CSS classes, follow these steps:

1. Ensure you have the Prettier and the Tailwind CSS plugin installed. The setup script does this automatically if you choose to integrate Prettier.

2. Create a .prettierrc file in your project root with the following content:
   {
   "plugins": ["prettier-plugin-tailwindcss"],
   "singleQuote": true,
   "trailingComma": "es5"
   }

3. If you encounter any issues with class sorting, make sure your Prettier version is compatible with the plugin:
   npm install --save-dev prettier prettier-plugin-tailwindcss

4. If you're using VS Code, ensure the Prettier extension is installed. You can configure VS Code to format your files on save. Add the following to your **settings.json**:

```
   {
   "editor.formatOnSave": true,
   "editor.defaultFormatter": "esbenp.prettier-vscode"
   }
```

## Troubleshooting

If you encounter issues during setup:

- Failed to execute command: Ensure you have the necessary permissions to run commands and that you have Node.js and npm installed.
- Missing Tailwind CSS file: Check that the CSS file path is correct and that the file was created during setup.
- Class sorting not working: Make sure that the Prettier plugin for Tailwind CSS is installed and configured correctly.

## License

ISC License
