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
exports.generateChangelog = generateChangelog;
exports.getChangeType = getChangeType;
exports.getChangelogHeader = getChangelogHeader;
exports.getExistingChangelogContent = getExistingChangelogContent;
exports.insertNewChanges = insertNewChanges;
exports.generateAndStreamChangelog = generateAndStreamChangelog;
const vscode = require("vscode");
const fs = require("fs/promises");
const path = require("path");
const llm_1 = require("./llm");
const git_1 = require("../services/git");
function generateChangelog(logResult) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const changelogFormat = config.get('changelogFormat') || 'conventional';
        // Initialize the LLM provider
        yield (0, llm_1.initializeLLM)();
        let changelog = getChangelogHeader();
        for (const commit of logResult.all) {
            const changeType = getChangeType(commit.message);
            const aiGeneratedDescription = yield (0, llm_1.getAIGeneratedDescription)(commit.message);
            if (changelogFormat === 'conventional') {
                changelog += `## ${commit.date}: ${changeType}\n\n`;
                changelog += `${aiGeneratedDescription}\n\n`;
                changelog += `Commit: ${commit.hash}\n`;
                changelog += `Author: ${commit.author_name} <${commit.author_email}>\n\n`;
            }
            else if (changelogFormat === 'keepachangelog') {
                changelog += `### ${changeType}\n`;
                changelog += `- ${aiGeneratedDescription} (${commit.hash})\n\n`;
            }
        }
        return changelog;
    });
}
function getChangeType(commitMessage) {
    if (commitMessage.startsWith('feat:'))
        return 'Feature';
    if (commitMessage.startsWith('fix:'))
        return 'Bug Fix';
    if (commitMessage.startsWith('docs:'))
        return 'Documentation';
    if (commitMessage.startsWith('style:'))
        return 'Style';
    if (commitMessage.startsWith('refactor:'))
        return 'Refactor';
    if (commitMessage.startsWith('test:'))
        return 'Test';
    if (commitMessage.startsWith('chore:'))
        return 'Chore';
    return 'Other';
}
function getChangelogHeader() {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}
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
function insertNewChanges(existingContent, newChanges) {
    const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
    if (unreleasedIndex === -1) {
        return existingContent + '\n' + newChanges;
    }
    const beforeUnreleased = existingContent.substring(0, unreleasedIndex);
    const afterUnreleased = existingContent.substring(unreleasedIndex);
    return beforeUnreleased + newChanges + afterUnreleased;
}
function generateAndStreamChangelog(panel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = vscode.workspace.getConfiguration('changeScribe');
            const maxCommits = config.get('maxCommits') || 50;
            const logResult = yield (0, git_1.getGitLog)(maxCommits);
            let changelogContent = yield getExistingChangelogContent();
            if (!changelogContent) {
                changelogContent = getChangelogHeader();
            }
            let newChanges = "## [Unreleased]\n\n";
            const changeTypes = {
                "Added": [],
                "Changed": [],
                "Deprecated": [],
                "Removed": [],
                "Fixed": [],
                "Security": []
            };
            // Process commits and generate changelog entries
            for (const commit of logResult.all) {
                const changeType = getChangeType(commit.message);
                changeTypes[changeType].push(commit.message);
            }
            // Build the new changes section
            for (const [type, messages] of Object.entries(changeTypes)) {
                if (messages.length > 0) {
                    newChanges += `### ${type}\n`;
                    for (const message of messages) {
                        newChanges += `- ${message}\n`;
                    }
                    newChanges += '\n';
                }
            }
            const updatedChangelog = insertNewChanges(changelogContent, newChanges);
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
//# sourceMappingURL=changelog.js.map