# Changelog

All notable changes to the "Change Scribe" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.4] - 2025-03-27
### Added
- Added version normalization to ensure consistent version numbering
- Added improved changelog cleaning functionality
- Added validation for changelog formatting consistency

### Changed
- Enhanced changelog generation logic to prevent duplicate headers
- Improved handling of Unreleased sections
- Updated section processing to maintain consistent formatting
- Refined spacing and structure in generated changelogs

### Fixed
- Fixed issue with duplicate changelog headers and format declarations
- Fixed multiple Unreleased sections appearing in output
- Fixed inconsistent spacing between changelog sections
- Improved handling of existing changelog content

## [0.12.3] - 2025-03-27
### Added
- Added option to include unstaged files in changelog generation
- Added configuration toggle for unstaged changes inclusion
- Added separation between staged and unstaged changes in output

### Changed
- Enhanced git change tracking to handle unstaged files separately
- Updated changelog formatting to clearly distinguish unstaged changes
- Improved configuration options with descriptive warnings about unstaged files

### Fixed
- Fixed git diff handling for both staged and unstaged files
- Improved error handling in git operations

## [0.12.2] - 2025-03-27
### Added
- Added isLLMConfigured() function to check if an LLM provider is already configured
- Added friendly descriptions for configuration options in VS Code settings
- Added detailed provider descriptions in LLM selection dropdown

### Changed
- Enhanced VS Code settings with descriptive enums for changelog formats and LLM providers
- Modified command registration to only prompt for LLM selection when necessary
- Updated LLM provider selection to save user preference persistently
- Improved user interface for LLM provider selection with friendly names

### Fixed
- Fixed issue where users were prompted to select an LLM provider every time the extension was activated
- Fixed configuration descriptions to be more user-friendly and informative

## [0.12.1] - 2025-03-27
### Added
- Added detailed progress notifications during changelog generation
- Added step-by-step progress reporting for better user feedback
- Added themed icons for sidebar view (light and dark modes)

### Changed
- Enhanced tree view provider with custom header and themed icons
- Improved progress feedback during changelog generation
- Updated sidebar UI with more professional appearance
- Refined code organization in changelog provider

### Fixed
- Fixed tree view provider implementation
- Resolved sidebar view initialization issues
- Improved error handling in tree view provider

## [0.12.0] - 2025-03-26
### Added
- Added sidebar view container with Change Scribe icon
- Added tree view provider for quick access to extension features
- Added dedicated provider structure in `providers/changelogTreeProvider.ts`

### Changed
- Improved extension accessibility through VS Code's activity bar
- Reorganized code structure for better maintainability

### Fixed
- Fixed section mapping between Conventional and Keep a Changelog formats
- Resolved issues with duplicate sections in changelog merging
- Corrected handling of existing changelog content

## [0.11.1] - 2024-12-26
### Added
- Added detailed git change tracking including file diffs
- Added support for viewing staged changes in changelog generation

### Fixed
- Fixed type mismatch between LogResult and GitChanges interfaces
- Corrected changelog generation flow to use proper git change tracking
- Resolved issue with duplicate Unreleased sections in changelog

### Changed
- Updated git change tracking to include file diffs and staged changes
- Improved changelog formatting to handle both conventional and keepachangelog formats
- Enhanced git service to provide more detailed change information

## [0.11.0] - 2024-12-26
### Added
- Added standardized prompt system for all LLM providers
- Added example-based prompting for better changelog generation

### Changed
- Increased model temperature to 0.4 for more natural language generation
- Increased max_tokens to 500 for more detailed descriptions
- Updated prompt engineering to focus on semantic understanding
- Enhanced commit message processing for better context retention

### Improved
- Improved changelog generation quality through better prompting
- Enhanced consistency across different LLM providers

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
