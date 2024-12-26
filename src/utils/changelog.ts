import * as vscode from 'vscode';
import { LogResult } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM, getAIGeneratedDescription } from './llm';
import { getGitLog } from '../services/git';

/**
 * Generates a changelog based on the provided log results.
 * 
 * @param logResult - The result of the log containing commit information.
 * @returns A promise that resolves to a string containing the generated changelog.
 * 
 * The format of the changelog is determined by the 'changelogFormat' configuration setting.
 * It supports two formats: 'conventional' and 'keepachangelog'.
 * 
 * The function initializes the LLM provider and uses it to generate descriptions for each commit message.
 * 
 * The changelog includes the commit date, type of change, AI-generated description, commit hash, and author information.
 */
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
    if (commitMessage.startsWith('fix:')) return 'Fixed';
    if (commitMessage.startsWith('docs:')) return 'Documentation';
    if (commitMessage.startsWith('style:')) return 'Style';
    if (commitMessage.startsWith('refactor:')) return 'Refactor';
    if (commitMessage.startsWith('test:')) return 'Test';
    if (commitMessage.startsWith('chore:')) return 'Chore';
    return 'Changed';
}

export function getChangelogHeader(): string {
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

/**
 * Inserts new changes into the existing changelog content.
 * If the '## [Unreleased]' section is found, the new changes are inserted before it.
 * Otherwise, the new changes are appended to the end of the existing content.
 *
 * @param existingContent - The current content of the changelog.
 * @param newChanges - The new changes to be added to the changelog.
 * @returns The updated changelog content with the new changes inserted.
 */
// export function insertNewChanges(existingContent: string, newChanges: string): string {
//     if (!existingContent) {
//         return getChangelogHeader() + '\n## [Unreleased]\n' + newChanges;
//     }

//     // Check if content starts with header, if not, add it
//     if (!existingContent.startsWith('# Changelog')) {
//         existingContent = getChangelogHeader() + existingContent;
//     }

//     // Try to find the Unreleased section
//     const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
//     if (unreleasedIndex !== -1) {
//         // Find the next version header or end of content
//         const nextVersionMatch = existingContent.substring(unreleasedIndex).match(/\n## \[\d+\.\d+\.\d+\]/);
//         const unreleasedEnd = nextVersionMatch 
//             ? unreleasedIndex + (nextVersionMatch.index ?? 0)
//             : existingContent.length;
        
//         // Extract existing unreleased content
//         const unreleasedContent = existingContent.substring(unreleasedIndex, unreleasedEnd);
        
//         // Merge existing unreleased content with new changes
//         const mergedChanges = mergeUnreleasedChanges(unreleasedContent, newChanges);
        
//         return existingContent.substring(0, unreleasedIndex) + 
//                mergedChanges + 
//                existingContent.substring(unreleasedEnd);
//     }

//     // If no Unreleased section, find first version header
//     const versionMatch = existingContent.match(/\n## \[\d+\.\d+\.\d+\]/);
//     if (versionMatch && versionMatch.index) {
//         return existingContent.substring(0, versionMatch.index) + 
//                '\n## [Unreleased]\n' + newChanges + 
//                existingContent.substring(versionMatch.index);
//     }

//     // If no version headers, insert after changelog header
//     if (existingContent.includes('# Changelog')) {
//         const afterHeader = existingContent.indexOf('# Changelog') + '# Changelog'.length;
//         return existingContent.substring(0, afterHeader) + 
//                '\n\n## [Unreleased]\n' + newChanges + 
//                existingContent.substring(afterHeader);
//     }

//     // If no changelog format at all, create new one
//     return getChangelogHeader() + '\n## [Unreleased]\n' + newChanges;
// }

export function insertNewChanges(existingContent: string, newChanges: string): string {
    console.log('Existing content:', existingContent);
    console.log('New changes:', newChanges);

    // If no content, create new changelog
    if (!existingContent) {
        return getChangelogHeader() + '\n## [Unreleased]\n' + newChanges;
    }

    // Check if content starts with header, if not, add it
    if (!existingContent.startsWith('# Changelog')) {
        existingContent = getChangelogHeader() + existingContent;
    }

    // Try to find the Unreleased section
    const unreleasedIndex = existingContent.indexOf('## [Unreleased]');
    console.log('Unreleased index:', unreleasedIndex);
    
    if (unreleasedIndex !== -1) {
        // Find the next version header or end of content
        const nextVersionMatch = existingContent.substring(unreleasedIndex).match(/\n## \[\d+\.\d+\.\d+\]/);
        console.log('Next version match:', nextVersionMatch);
        
        const unreleasedEnd = nextVersionMatch 
            ? unreleasedIndex + (nextVersionMatch.index ?? 0)
            : existingContent.length;
        console.log('Unreleased end:', unreleasedEnd);
        
        // Extract existing unreleased content
        const unreleasedContent = existingContent.substring(unreleasedIndex, unreleasedEnd);
        console.log('Unreleased content:', unreleasedContent);
        
        // Remove any duplicate Unreleased sections from new changes
        const cleanedNewChanges = newChanges.replace('## [Unreleased]\n', '');
        
        // Merge existing unreleased content with new changes
        const mergedChanges = mergeUnreleasedChanges(unreleasedContent, cleanedNewChanges);
        
        return existingContent.substring(0, unreleasedIndex) + 
               mergedChanges + 
               existingContent.substring(unreleasedEnd);
    }

    // If no Unreleased section, add it after header
    const headerEnd = existingContent.indexOf('\n\n');
    return existingContent.substring(0, headerEnd) + 
           '\n\n## [Unreleased]\n' + newChanges + 
           existingContent.substring(headerEnd);
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
function mergeUnreleasedChanges(existing: string, newChanges: string): string {
    const sections: { [key: string]: string[] } = {
        'Added': [],
        'Changed': [],
        'Deprecated': [],
        'Removed': [],
        'Fixed': [],
        'Security': []
    };

    // Parse existing content
    let currentSection = '';
    existing.split('\n').forEach(line => {
        if (line.startsWith('### ')) {
            currentSection = line.substring(4);
        } else if (currentSection && line.startsWith('- ') && sections[currentSection]) {
            sections[currentSection].push(line);
        }
    });

    // Parse new changes
    currentSection = '';
    newChanges.split('\n').forEach(line => {
        if (line.startsWith('### ')) {
            currentSection = line.substring(4);
        } else if (currentSection && line.startsWith('- ') && sections[currentSection]) {
            sections[currentSection].push(line);
        }
    });

    // Rebuild merged content
    let merged = '## [Unreleased]\n\n';
    Object.entries(sections).forEach(([section, entries]) => {
        if (entries.length > 0) {
            merged += `### ${section}\n${entries.join('\n')}\n\n`;
        }
    });

    return merged;
}

/**
 * Generates and streams a changelog to the provided webview panel.
 * 
 * This function retrieves the configuration for the maximum number of commits to include in the changelog,
 * fetches the git log, processes the commits to categorize them, and builds the changelog content.
 * The generated changelog is then sent to the webview panel.
 * 
 * @param {vscode.WebviewPanel} panel - The webview panel to which the changelog will be streamed.
 * 
 * @throws Will throw an error if there is an issue generating the changelog.
 */
export async function generateAndStreamChangelog(panel: vscode.WebviewPanel) {
    try {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const maxCommits = config.get<number>('maxCommits') || 50;
        const logResult = await getGitLog(maxCommits);

        // Initialize LLM
        await initializeLLM();

        let changelogContent = await getExistingChangelogContent();
        if (!changelogContent) {
            changelogContent = getChangelogHeader();
        }

        let newChanges = "## [Unreleased]\n\n";
        // const changeTypes: { [key: string]: string[] } = {
        //     "Added": [],
        //     "Changed": [],
        //     "Deprecated": [],
        //     "Removed": [],
        //     "Fixed": [],
        //     "Security": []
        // };

        const changeTypes: { [key: string]: string[] } = {
            "Feature": [],
            "Fixed": [],
            "Documentation": [],
            "Style": [],
            "Refactor": [],
            "Test": [],
            "Chore": [],
            "Changed": [] // Default category
        };

        // Process commits and generate AI descriptions
        for (const commit of logResult.all) {
            const changeType = getChangeType(commit.message);
            const aiDescription = await getAIGeneratedDescription(commit.message);
            
            if (changeTypes[changeType]) {
                changeTypes[changeType].push(aiDescription);
            } else {
                changeTypes["Changed"].push(aiDescription);
            }
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