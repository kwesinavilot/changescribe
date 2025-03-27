"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangelogHeader = getChangelogHeader;
exports.getExistingChangelogContent = getExistingChangelogContent;
exports.insertNewChanges = insertNewChanges;
exports.generateAndStreamChangelog = generateAndStreamChangelog;
const vscode = require("vscode");
const fs = require("fs/promises");
const path = require("path");
const llm_1 = require("./llm");
const git_1 = require("../services/git");
function getChangelogHeader() {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}
/**
 * Retrieves the content of the existing CHANGELOG.md file in the workspace.
 *
 * @returns {Promise<string | null>} A promise that resolves to the content of the CHANGELOG.md file as a string,
 * or null if the file does not exist or an error occurs.
 */
function getExistingChangelogContent() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const changelogPath = path.join(rootPath, 'CHANGELOG.md');
        try {
            const content = yield fs.readFile(changelogPath, 'utf8');
            return content;
        }
        catch (error) {
            return null;
        }
    });
}
/**
 * Inserts new changes into the existing changelog content.
 * If the '## [Unreleased]' section is found, the new changes are inserted before it.
 * Otherwise, the new changes are appended to the end of the existing content.
 *
 * @param existingContent - The current content of the changelog.
 * @param newChanges - The new changes to be added to the changelog.
 * @returns The updated changelog content with the new changes inserted.
 */
function insertNewChanges(existingContent, newChanges, format) {
    var _a;
    // Clean up existing content
    existingContent = existingContent ? cleanChangelogContent(existingContent) : '';
    // If no content, create new changelog
    if (!existingContent) {
        return getChangelogHeader() + '\n\n## [Unreleased]\n' + newChanges;
    }
    // Ensure proper header
    if (!existingContent.includes('# Changelog')) {
        existingContent = getChangelogHeader() + '\n\n' + existingContent;
    }
    // Process new changes according to format
    const processedChanges = processChangesByFormat(newChanges, format, format === 'conventional'
        ? ['Features', 'Bug Fixes', 'Documentation', 'Styles', 'Refactoring', 'Tests', 'Chores']
        : ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']);
    // Find Unreleased section or insert after header
    const unreleasedMatch = existingContent.match(/## \[Unreleased\]/);
    if (unreleasedMatch) {
        const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
        const nextVersionMatch = existingContent.substring(unreleasedIndex)
            .match(/\n## \[\d+\.\d+\.\d+\]/);
        const insertPosition = nextVersionMatch
            ? unreleasedIndex + ((_a = nextVersionMatch.index) !== null && _a !== void 0 ? _a : 0)
            : existingContent.length;
        return existingContent.substring(0, unreleasedIndex) +
            '## [Unreleased]\n' +
            processedChanges + '\n' +
            existingContent.substring(insertPosition);
    }
    // Add new Unreleased section after header
    const headerEndMatch = existingContent.match(/^# Changelog.*?\n(?:\s*\n)?/s);
    const headerEnd = headerEndMatch ? headerEndMatch[0].length : 0;
    return existingContent.substring(0, headerEnd) +
        '\n## [Unreleased]\n' +
        processedChanges + '\n' +
        existingContent.substring(headerEnd);
}
/**
 * Process changelog changes according to the specified format.
 *
 * @param changes - The raw changelog changes to process
 * @param format - The desired changelog format ('conventional' or 'keepachangelog')
 * @param sections - The list of sections to use for the specified format
 * @returns A string representing the processed changes in the specified format
 */
function processChangesByFormat(changes, format, sections) {
    const sectionContent = {};
    sections.forEach(section => sectionContent[section] = []);
    let currentSection = '';
    changes.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('### ')) {
            currentSection = trimmedLine.substring(4).trim();
        }
        else if (currentSection && trimmedLine.startsWith('- ') && sectionContent[currentSection]) {
            sectionContent[currentSection].push(trimmedLine);
        }
    });
    let processed = '';
    sections.forEach(section => {
        if (sectionContent[section].length > 0) {
            processed += `### ${section}\n${sectionContent[section].join('\n')}\n\n`;
        }
    });
    return processed.trim();
}
/**
 * Merges unreleased changes from two changelog strings into a single string.
 *
 * This function takes two strings representing existing and new changes in a changelog,
 * parses them into predefined sections (Added, Changed, Deprecated, Removed, Fixed, Security),
 * and then merges them into a single string under the "Unreleased" section.
 *
 * @param existing - The existing changelog content as a string.
 * @param newChanges - The new changes to be merged into the existing changelog.
 * @returns A string representing the merged changelog content under the "Unreleased" section.
 */
function mergeUnreleasedChanges(existing, newChanges, format) {
    const sections = getSectionsByFormat(format);
    let currentSection = '';
    // Parse existing content
    existing.split('\n').forEach(line => {
        if (line.startsWith('### ')) {
            currentSection = line.substring(4);
        }
        else if (currentSection && line.startsWith('- ') && sections[currentSection]) {
            sections[currentSection].push(line);
        }
    });
    // Parse new changes
    currentSection = '';
    newChanges.split('\n').forEach(line => {
        if (line.startsWith('### ')) {
            currentSection = line.substring(4);
        }
        else if (currentSection && line.startsWith('- ') && sections[currentSection]) {
            sections[currentSection].push(line);
        }
    });
    // Build merged content
    let merged = '## [Unreleased]\n\n';
    Object.entries(sections).forEach(([section, entries]) => {
        if (entries.length > 0) {
            merged += `### ${section}\n${entries.join('\n')}\n\n`;
        }
    });
    return merged;
}
/**
 * Returns a mapping of sections based on the given changelog format.
 *
 * @param format - The changelog format to use ('conventional' or 'keepachangelog').
 * @returns A SectionMapping object containing arrays of section names
 *          corresponding to the specified format.
 */
function getSectionsByFormat(format) {
    return format === 'conventional' ? {
        'Features': [],
        'Bug Fixes': [],
        'Documentation': [],
        'Styles': [],
        'Refactoring': [],
        'Tests': [],
        'Chores': []
    } : {
        'Added': [],
        'Changed': [],
        'Deprecated': [],
        'Removed': [],
        'Fixed': [],
        'Security': []
    };
}
/**
 * Generates and streams a changelog to the provided webview panel.
 *
 * This function retrieves the configuration for the maximum number of commits to include in the changelog,
 * fetches the git log, processes the commits to categorize them, and builds the changelog content.
 * The generated changelog is then sent to the webview panel.
 *
 * @param {vscode.WebviewPanel} panel - The webview panel to which the changelog will be streamed.
 * @param {vscode.Progress<{ message?: string; increment?: number }>} [progress] - Optional progress reporter.
 *
 * @throws Will throw an error if there is an issue generating the changelog.
 */
function generateAndStreamChangelog(panel, progress) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Update progress for configuration
            progress === null || progress === void 0 ? void 0 : progress.report({ message: 'Reading configuration...' });
            const config = vscode.workspace.getConfiguration('changeScribe');
            const maxCommits = config.get('maxCommits') || 3;
            const changelogFormat = config.get('changelogFormat') || 'keepachangelog';
            const currentVersion = config.get('version') || '0.1.0';
            const normalizedVersion = normalizeVersion(currentVersion);
            // Ensure format is valid
            if (changelogFormat !== 'conventional' && changelogFormat !== 'keepachangelog') {
                throw new Error('Invalid changelog format specified');
            }
            // Update progress for git changes
            progress === null || progress === void 0 ? void 0 : progress.report({ message: 'Fetching git changes...' });
            const changes = yield (0, git_1.getGitChanges)(maxCommits);
            const formattedChanges = yield (0, git_1.formatChangesForChangelog)(changes, changelogFormat);
            // Update progress for LLM initialization
            progress === null || progress === void 0 ? void 0 : progress.report({ message: 'Initializing AI model...' });
            yield (0, llm_1.initializeLLM)();
            // Update progress for changelog generation
            progress === null || progress === void 0 ? void 0 : progress.report({ message: 'Generating changelog content...' });
            const aiDescription = yield (0, llm_1.getAIGeneratedDescription)(formattedChanges);
            const formattedDescription = formatChangelogEntry(aiDescription, changelogFormat);
            // When creating a new release:
            const versionEntry = createVersionEntry(normalizedVersion, formattedDescription);
            // Update progress for final steps
            progress === null || progress === void 0 ? void 0 : progress.report({ message: 'Updating changelog...' });
            let changelogContent = yield getExistingChangelogContent();
            changelogContent = changelogContent ? cleanChangelogContent(changelogContent) : getChangelogHeader();
            const updatedChangelog = insertNewChanges(changelogContent, versionEntry, changelogFormat);
            panel.webview.postMessage({ type: 'updateChangelog', content: updatedChangelog });
            panel.webview.postMessage({ type: 'generationComplete' });
        }
        catch (error) {
            panel.webview.postMessage({
                type: 'updateChangelog',
                content: `Error generating changelog: ${error instanceof Error ? error.message : String(error)}\n\n`
            });
            panel.webview.postMessage({ type: 'generationComplete' });
            vscode.window.showErrorMessage(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
/**
 * Removes duplicate headers from a changelog content string.
 *
 * This function takes a changelog content string, removes any duplicate headers ("# Changelog")
 * and format declarations, and returns the cleaned string.
 *
 * @param {string} content - The changelog content string to be cleaned.
 * @returns {string} The cleaned changelog content string.
 */
function cleanChangelogContent(content) {
    // Split content into sections
    const sections = content.split(/(?=^# Changelog)/m);
    // Get the last (or only) changelog section
    const lastSection = sections[sections.length - 1];
    // Remove duplicate Unreleased sections
    const lines = lastSection.split('\n');
    let hasUnreleased = false;
    const cleanedLines = lines.filter(line => {
        // Keep only the first Unreleased section
        if (line.trim() === '## [Unreleased]') {
            if (hasUnreleased)
                return false;
            hasUnreleased = true;
        }
        return true;
    });
    return cleanedLines.join('\n').trim();
}
/**
 * Normalize a version string by removing 'v' prefix and suffixes like '-a', '-beta'
 * and ensuring a three-part version number.
 *
 * @param {string} version - The version string to be normalized.
 * @returns {string} The normalized version string.
 */
function normalizeVersion(version) {
    // Remove 'v' prefix if present
    version = version.replace(/^v/, '');
    // Remove suffixes like '-a', '-beta'
    version = version.replace(/-[a-zA-Z].*$/, '');
    // Ensure three-part version number
    const parts = version.split('.');
    while (parts.length < 3)
        parts.push('0');
    return parts.slice(0, 3).join('.');
}
/**
 * Formats a changelog entry according to the specified format.
 *
 * @param description - The AI-generated description to format
 * @param format - The desired changelog format ('conventional' or 'keepachangelog')
 * @returns Formatted changelog entry
 */
function formatChangelogEntry(description, format) {
    // Split the description into lines
    const lines = description.split('\n').filter(line => line.trim());
    const sections = getSectionsByFormat(format);
    let currentSection = '';
    // Parse the AI description and categorize changes
    lines.forEach(line => {
        if (line.match(/^###\s+/)) {
            currentSection = line.replace(/^###\s+/, '').trim();
        }
        else if (line.match(/^[*-]\s+/) && currentSection) {
            const entry = line.replace(/^[*-]\s+/, '- ');
            if (sections[currentSection]) {
                sections[currentSection].push(entry);
            }
        }
    });
    // Build the formatted entry
    let formatted = '';
    Object.entries(sections).forEach(([section, entries]) => {
        if (entries.length > 0) {
            formatted += `### ${section}\n${entries.join('\n')}\n\n`;
        }
    });
    return formatted.trim();
}
/**
 * Creates a version entry string in the format:
 *   ## [version] - YYYY-MM-DD
 *   [changes]
 *
 * @param {string} version - The version string to include in the entry.
 * @param {string} changes - The changelog content to include in the entry.
 * @returns {string} A version entry string.
 */
function createVersionEntry(version, changes) {
    const normalizedVersion = normalizeVersion(version);
    const date = new Date().toISOString().split('T')[0];
    return `## [${normalizedVersion}] - ${date}\n${changes}\n`;
}
//# sourceMappingURL=changelog.js.map