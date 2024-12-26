import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { initializeLLM, getAIGeneratedDescription } from './llm';
import { getGitChanges, formatChangesForChangelog } from '../services/git';

type ChangelogFormat = 'conventional' | 'keepachangelog';

interface SectionMapping {
    [key: string]: string[];
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
export function insertNewChanges(existingContent: string, newChanges: string, format: ChangelogFormat): string {
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
        const mergedChanges = mergeUnreleasedChanges(unreleasedContent, cleanedNewChanges, format);
        
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
function mergeUnreleasedChanges(existing: string, newChanges: string, format: ChangelogFormat): string {
    const sections = getSectionsByFormat(format);
    let currentSection = '';

    // Parse existing content
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

    // Build merged content
    let merged = '## [Unreleased]\n\n';
    Object.entries(sections).forEach(([section, entries]) => {
        if (entries.length > 0) {
            merged += `### ${section}\n${entries.join('\n')}\n\n`;
        }
    });

    return merged;
}

function getSectionsByFormat(format: ChangelogFormat): SectionMapping {
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
 * 
 * @throws Will throw an error if there is an issue generating the changelog.
 */
export async function generateAndStreamChangelog(panel: vscode.WebviewPanel) {
    try {
        const config = vscode.workspace.getConfiguration('changeScribe');
        const maxCommits = config.get<number>('maxCommits') || 3;
        const changelogFormat = config.get<string>('changelogFormat') || 'keepachangelog';

        // Get git changes
        const changes = await getGitChanges(maxCommits);
        const formattedChanges = await formatChangesForChangelog(changes, changelogFormat as 'conventional' | 'keepachangelog');

        // Initialize LLM
        await initializeLLM();

        // Generate changelog
        const aiDescription = await getAIGeneratedDescription(formattedChanges);
        const newChanges = `## [Unreleased]\n\n${aiDescription}\n\n`;

        // Update changelog
        let changelogContent = await getExistingChangelogContent();
        if (!changelogContent) {
            changelogContent = getChangelogHeader();
        }

        const updatedChangelog = insertNewChanges(changelogContent, newChanges, changelogFormat as ChangelogFormat);
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