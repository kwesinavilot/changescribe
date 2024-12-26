import * as vscode from 'vscode';
import { LogResult } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM, getAIGeneratedDescription } from './llm';
import { getGitLog } from '../services/git';

export async function generateChangelog(logResult: LogResult): Promise<string> {
    const config = vscode.workspace.getConfiguration('changeScribe');
    const changelogFormat = config.get<string>('changelogFormat') || 'conventional';

    // Initialize the LLM provider
    await initializeLLM();

    let changelog = getChangelogHeader();

    for (const commit of logResult.all) {
        const changeType = getChangeType(commit.message);
        const aiGeneratedDescription = await getAIGeneratedDescription(commit.message);

        if (changelogFormat === 'conventional') {
            changelog += `## ${commit.date}: ${changeType}\n\n`;
            changelog += `${aiGeneratedDescription}\n\n`;
            changelog += `Commit: ${commit.hash}\n`;
            changelog += `Author: ${commit.author_name} <${commit.author_email}>\n\n`;
        } else if (changelogFormat === 'keepachangelog') {
            changelog += `### ${changeType}\n`;
            changelog += `- ${aiGeneratedDescription} (${commit.hash})\n\n`;
        }
    }

    return changelog;
}

export function getChangeType(commitMessage: string): string {
    if (commitMessage.startsWith('feat:')) return 'Feature';
    if (commitMessage.startsWith('fix:')) return 'Bug Fix';
    if (commitMessage.startsWith('docs:')) return 'Documentation';
    if (commitMessage.startsWith('style:')) return 'Style';
    if (commitMessage.startsWith('refactor:')) return 'Refactor';
    if (commitMessage.startsWith('test:')) return 'Test';
    if (commitMessage.startsWith('chore:')) return 'Chore';
    return 'Other';
}

export function getChangelogHeader(): string {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}

export async function getExistingChangelogContent(): Promise<string | null> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return null;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const changelogPath = path.join(rootPath, 'CHANGELOG.md');

    try {
        const content = await fs.readFile(changelogPath, 'utf8');
        return content;
    } catch (error) {
        return null;
    }
}

export function insertNewChanges(existingContent: string, newChanges: string): string {
    const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
    if (unreleasedIndex === -1) {
        return existingContent + '\n' + newChanges;
    }

    const beforeUnreleased = existingContent.substring(0, unreleasedIndex);
    const afterUnreleased = existingContent.substring(unreleasedIndex);

    return beforeUnreleased + newChanges + afterUnreleased;
}

export async function generateAndStreamChangelog(panel: vscode.WebviewPanel) {
    try {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const maxCommits = config.get<number>('maxCommits') || 50;
        const logResult = await getGitLog(maxCommits);

        let changelogContent = await getExistingChangelogContent();
        if (!changelogContent) {
            changelogContent = getChangelogHeader();
        }

        let newChanges = "## [Unreleased]\n\n";
        const changeTypes: { [key: string]: string[] } = {
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
    } catch (error) {
        panel.webview.postMessage({
            type: 'updateChangelog',
            content: `Error generating changelog: ${error instanceof Error ? error.message : String(error)}\n\n`
        });
        panel.webview.postMessage({ type: 'generationComplete' });
        vscode.window.showErrorMessage(`Error generating changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}