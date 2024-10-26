# Change Scribe

Change Scribe is a VS Code extension that automates the generation of semantic change logs. It uses AI to analyze your Git commit history and create meaningful, well-formatted changelog entries.

## Features

- Automatically generate changelogs from your Git commit history
- Use AI to create concise and meaningful descriptions for each change
- Support for both OpenAI and Azure OpenAI as LLM providers
- Customize the changelog format (Conventional Commits or Keep a Changelog)
- Interactive UI for viewing and customizing the generated changelog
- Save the changelog to a file or commit it directly to your repository
- Limit the number of commits included in the changelog

## Requirements

- Visual Studio Code v1.85.0 or higher
- Git repository
- OpenAI API key or Azure OpenAI credentials

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Change Scribe"
4. Click Install

## Configuration

Before using Change Scribe, you need to set up a few configuration options:

1. Open VS Code settings (File > Preferences > Settings)
2. Search for "Change Scribe"
3. Set your preferred LLM provider (OpenAI or Azure OpenAI)
4. Provide the necessary API credentials:
   - For OpenAI: Set your OpenAI API key and model name
   - For Azure OpenAI: Set your API key, endpoint, deployment name, and model name
5. (Optional) Choose your preferred changelog format
6. (Optional) Set the maximum number of commits to include

## Usage

1. Open a project with a Git repository
2. Open the Command Palette (Ctrl+Shift+P)
3. Type "Generate Changelog" and select the command
4. The generated changelog will appear in a new webview panel
5. Use the "Save Changelog" button to save the changelog to a file
6. Use the "Commit Changelog" button to commit the changelog directly to your repository

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
