# Changelog

All notable changes to the "Change Scribe" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2024-12-26
### Added
- Added support for Google's Gemini models as an LLM provider
- Added Gemini to the list of available LLM providers in `changescribe.updateLLMProvider` command
- Added configuration options for Gemini API key and model selection

### Changed
- Updated error messages for LLM provider configurations to be more descriptive and helpful
- Renamed LLM service functions for better clarity and consistency:
- Enhanced LLM provider selection UI in command palette

### Fixed
- Improved error handling for invalid or missing LLM provider configurations
- Fixed validation of API keys and endpoints for all LLM providers

## [0.9.2] - 2024-12-26
### Added
- Added merging functionality for existing Unreleased changes with new changes
- Added proper section handling (Added, Changed, Fixed, etc.) in changelog updates

### Changed
- Improved changelog generation logic to handle missing changelog file
- Enhanced handling of changelog sections and content merging
- Updated changelog insertion logic to maintain proper structure

### Fixed
- Fixed changelog insertion to properly handle existing Unreleased section
- Improved handling of changelog without version headers
- Enhanced error handling for malformed changelog files

## [0.9.1] - 2024-12-26
### Added
- Added `changescribe.updateLLMProvider` command to update the LLM provider and toggle setting visibility.

### Changed
- Updated `generateAndStreamChangelog` function to ensure all possible change types are included in the `changeTypes` object.
- Improved error handling for unexpected change types in the `generateAndStreamChangelog` function.

### Fixed
- Fixed error `Cannot read properties of undefined (reading 'push')` by ensuring `changeTypes` object includes all possible return values from `getChangeType`.

## [0.9.0] - 2024-12-26
### Added
- Unified `getAIGeneratedDescription` function to handle AI description generation for different LLM providers.
- Added support for initializing and using OpenAI-compatible LLM providers.

### Changed
- Refactored `generateChangelog` function to use the new `getAIGeneratedDescription` function.
- Improved modularity and maintainability by separating concerns into different modules.

### Fixed
- Resolved issues with Git commit log retrieval in `getGitLog` function.
- Fixed error handling for missing or invalid configuration settings.

## [0.8.0] - 2024-12-26
### Added
- Added support for LLM providers like Groq and SambaNova that use the OpenAI package for API calls
- Enabled the use of custom OpenAI API endpoints for LLM providers
- Added a section in the README on how to configure the models

### Changed
- Updated the LLM provider selection logic so that Azure OpenAI's selection isn't done through the OpenAI service
- Updated the docs of the various functions
- Improved the error handling for Git operations and LLM API calls

## [0.7.0] - 2024-10-28
### Added
- New extension icon featuring a quill and scroll design
- Extension categories in package.json for better marketplace visibility:
- Keywords for improved marketplace searchability
- Added an order property to the settings to improve the UI
- Progress notifications for changelog operations:
  - Generation progress indicator
  - Saving progress indicator
  - Committing progress indicator

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
