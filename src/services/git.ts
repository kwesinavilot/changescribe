import { simpleGit, SimpleGit, LogResult, StatusResult, DiffResult } from 'simple-git';
import * as vscode from 'vscode';

/**
 * Represents the structure of Git changes in a repository.
 * @interface GitChanges
 * 
 * @property {Object[]} staged - Array of staged files and their status
 * @property {string} staged.file - Path to the staged file
 * @property {string} staged.status - Git status of the staged file
 * @property {string} [staged.diff] - Optional diff content for the staged file
 * 
 * @property {Object[]} unstaged - Array of unstaged files and their status
 * @property {string} unstaged.file - Path to the unstaged file
 * @property {string} unstaged.status - Git status of the unstaged file
 * @property {string} [unstaged.diff] - Optional diff content for the unstaged file
 * 
 * @property {Object[]} commits - Array of commit information
 * @property {string} commits.hash - Commit hash identifier
 * @property {string} commits.message - Commit message
 * @property {Object[]} commits.files - Array of files changed in the commit
 * @property {string} commits.files.file - Path to the changed file
 * @property {string} commits.files.changes - Changes made to the file
 */
interface GitChanges {
    staged: Array<{
        file: string;
        status: string;
        diff?: string;
    }>;
    unstaged?: Array<{
        file: string;
        status: string;
        diff?: string;
    }>;
    commits: Array<{
        hash: string;
        message: string;
        files: Array<{
            file: string;
            changes: string;
        }>;
    }>;
}


/**
 * Retrieves git changes from the current repository, including staged, unstaged files, and recent commits.
 *
 * @param maxCommits - The maximum number of recent commits to retrieve.
 * @returns A Promise resolving to a GitChanges object containing arrays of staged and unstaged files and their status,
 * as well as recent commit information.
 * @throws An error if no workspace folder is open.
 */
export async function getGitChanges(maxCommits: number): Promise<GitChanges> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);
    const config = vscode.workspace.getConfiguration('changeScribe');
    const includeUnstaged = config.get<boolean>('includeUnstagedChanges') || false;

    // Get repository status
    const status: StatusResult = await git.status();
    const staged: Array<{ file: string; status: string; diff?: string }> = [];
    const unstaged: Array<{ file: string; status: string; diff?: string }> = [];

    // Process staged changes
    for (const file of status.staged) {
        const diff: string = await git.diff(['--cached', file]);
        staged.push({
            file,
            status: status.files.find(f => f.path === file)?.index || 'M',
            diff: diff
        });
    }

    // Process unstaged changes if enabled
    if (includeUnstaged) {
        const unstagedFiles = [...status.not_added, ...status.modified];
        for (const file of unstagedFiles) {
            const diff: string = await git.diff([file]);
            unstaged.push({
                file,
                status: status.files.find(f => f.path === file)?.working_dir || 'M',
                diff: diff
            });
        }
    }

    // Get recent commits with their changes
    const log = await git.log({
        maxCount: maxCommits,
        '--name-status': null,
        '--find-renames': null
    });

    const commits = log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        files: (commit.diff?.files || []).map(file => ({
            file: file.file,
            changes: 'changes' in file ? String(file.changes) : ''
        }))
    }));

    return includeUnstaged ? { staged, unstaged, commits } : { staged, commits };
}

/**
 * Formats git changes into a changelog string based on the specified format.
 * 
 * @param changes - The Git changes to format
 * @param format - The format to use for the changelog ('conventional' or 'keepachangelog')
 * @returns A formatted changelog string
 */
export async function formatChangesForChangelog(changes: GitChanges, format: 'conventional' | 'keepachangelog'): Promise<string> {
    const config = vscode.workspace.getConfiguration('changeScribe');
    let formattedChanges = '';

    if (format === 'conventional') {
        formattedChanges = `Changes to be documented:

        Staged Files:
        ${changes.staged.map(f => `- ${f.status} ${f.file}
        ${f.diff || ''}`).join('\n')}

        ${changes.unstaged ? `Unstaged Files:
        ${changes.unstaged.map(f => `- ${f.status} ${f.file}
        ${f.diff || ''}`).join('\n')}

        ` : ''}Recent Commits:
        ${changes.commits.map(c => `- ${c.message}
        Files: ${c.files.map(f => f.file).join(', ')}`).join('\n')}`;
    } else {
        formattedChanges = `Changes to be documented:

        Modified Files:
        ${changes.staged.map(f => `* ${f.file}
        ${f.diff || ''}`).join('\n')}

        ${changes.unstaged ? `Unstaged Changes:
        ${changes.unstaged.map(f => `* ${f.file}
        ${f.diff || ''}`).join('\n')}

        ` : ''}Recent Changes:
        ${changes.commits.map(c => `* ${c.message}
        Changed: ${c.files.map(f => f.file).join(', ')}`).join('\n')}`;
    }

    return formattedChanges;
}

/**
 * Retrieves the Git commit log for the current workspace.
 * 
 * @param maxCommits - The maximum number of commits to retrieve
 * @returns Promise containing the log result with commit history
 * @throws {Error} If no workspace folder is found
 */
export async function getGitLog(maxCommits: number): Promise<LogResult> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);

    return await git.log({ maxCount: maxCommits });
}

/**
 * Commits changes made to the CHANGELOG.md file in the current workspace using Git.
 * 
 * @param content - The content of the changelog that was updated (currently unused in function)
 * @throws {Error} When no workspace folder is found
 * @returns Promise<void>
 * 
 * This function:
 * 1. Checks for an active workspace
 * 2. Initializes Git in the root workspace path
 * 3. Stages CHANGELOG.md
 * 4. Commits the changes with a default message
 * 5. Shows success/error message to user via VS Code notifications
 */
export async function commitChangelog(content: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);

    try {
        await git.add('CHANGELOG.md');
        await git.commit('Update CHANGELOG.md');
        vscode.window.showInformationMessage('Changelog committed successfully!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error committing changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}
