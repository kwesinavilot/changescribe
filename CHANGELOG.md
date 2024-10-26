# Changelog

All notable changes to the "Change Scribe" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2024-10-26

### Changed
- Renamed extension from "Literate" to "Change Scribe"
- Updated all relevant files and code to reflect the new name
- Fixed command registration to use 'changeScribe.generateChangelog'
- Refactored Azure OpenAI client initialization in `azureOpenai.ts`
- Updated Azure OpenAI model selection to use a configurable setting

### Added
- New configuration option `changeScribe.azureOpenAIModel` for specifying the Azure OpenAI model

### Fixed
- Resolved issue with command 'changeScribe.generateChangelog' not being found
- Improved error handling for Azure OpenAI configuration and initialization

## [0.5.0] - 2024-10-26

### Added
- New changelog generation format following Keep a Changelog structure
- Ability to append new changes to existing changelog file
- Grouping of changes by type (Added, Changed, Deprecated, etc.)
- Inclusion of commit hashes in changelog entries

### Changed
- Updated changelog generation process to maintain existing content
- Improved parsing of commit messages to determine change types
- Enhanced error handling and display in the changelog webview

### Fixed
- Issue with overwriting existing changelog content

## [0.4.0] - 2024-10-26
### Added

### Changed
- Provide a more specific error message when the Azure OpenAI deployment is not found.
- Improved error handling for Azure OpenAI deployment issues
- Enhanced error display in the changelog webview instead of console logging

## [0.3.0] - 2024-10-26
### Added
- Support for Azure OpenAI as an alternative LLM provider
- New user settings for configuring Azure OpenAI:
  - API Key
  - Endpoint
  - Deployment Name
  - API Version
- Command to update LLM provider and toggle setting visibility
- Pagination support for large repositories with many commits
- Real-time streaming of changelog generation progress
- Loading indicator during changelog generation
- Improved UI controls for saving and committing changelog

### Changed
- Refactored codebase into separate service modules for better organization:
  - `openai.ts`
  - `git.ts`
  - `webview.ts`
  - `azureOpenai.ts`
- Updated Azure OpenAI SDK to version 2.0.0-beta.2
- Improved error handling for Git operations and OpenAI/Azure OpenAI API calls
- Enhanced user interface with more customization options
- Save and commit buttons are now enabled only when appropriate
- Consolidated webview-related functionality into a single `webview.ts` file

### Fixed
- Resolved issue with missing API version in Azure OpenAI client initialization
- Fixed toggling visibility of LLM-specific settings in VS Code
- Corrected linter errors in `extension.ts`
- Improved error handling for Azure OpenAI deployment issues
- Enhanced error display in the changelog webview

### Security
- Improved handling of API keys for both OpenAI and Azure OpenAI

## [0.2.0] - 2023-12-16

### Added
- Separated logic into service modules for better organization and maintainability
- Implemented error handling for Git operations and OpenAI API calls
- Added user settings to customize the changelog format and OpenAI API key

### Changed
- Refactored `extension.ts` to use the new service modules
- Updated `package.json` to include new dependencies and scripts
- Modified `tsconfig.json` to include the new `services` folder in compilation

### Security
- Improved security by moving OpenAI API key handling to a dedicated service

## [0.1.0] - 2023-12-15

### Added
- Initial release of Change Scribe extension
- Automatic changelog generation from Git commit history
- AI-powered commit description generation using OpenAI API
- Interactive webview UI for displaying and customizing changelogs
- Support for Conventional Commits and Keep a Changelog formats
- Ability to save changelog to a file
- Ability to commit changelog directly to the repository
- User settings for OpenAI API key, changelog format, and maximum number of commits
- Basic error handling and input validation

### Security
- Implemented secure storage of OpenAI API key in user settings
