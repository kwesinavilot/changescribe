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
 * Retrieves Git changes including staged changes and recent commits from the current workspace.
 * 
 * @param maxCommits - The maximum number of recent commits to retrieve
 * @returns A Promise that resolves to a GitChanges object containing:
 *          - staged: Array of staged files with their status and diff
 *          - commits: Array of recent commits with hash, message and changed files
 * @throws {Error} When no workspace folder is found
 * 
 * @interface GitChanges
 * @property {Array<{file: string, status: string, diff: string}>} staged - Staged changes
 * @property {Array<{hash: string, message: string, files: Array<{file: string, changes: string}>}>} commits - Recent commits
 */
export async function getGitChanges(maxCommits: number): Promise<GitChanges> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);

    // Get staged changes
    const status: StatusResult = await git.status();
    const staged = [];

    for (const file of status.staged) {
        const diff: string = await git.diff(['--cached', file]);
        staged.push({
            file,
            status: status.files.find(f => f.path === file)?.index || 'M',
            diff: diff
        });
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

    return { staged, commits };
}

/**
 * Formats git changes into a changelog string based on the specified format.
 * 
 * @param changes - The git changes to format, containing staged files and recent commits
 * @param format - The format to use for the changelog, either 'conventional' or 'keepachangelog'
 * @returns A formatted string containing the changelog entries
 * 
 * @throws {Error} When VSCode configuration cannot be accessed
 * 
 * @example
 * ```ts
 * const changes = {
 *   staged: [{status: 'M', file: 'index.ts', diff: '+1 line'}],
 *   commits: [{message: 'feat: new feature', files: [{file: 'index.ts'}]}]
 * };
 * const formatted = await formatChangesForChangelog(changes, 'conventional');
 * ```
 */
export async function formatChangesForChangelog(changes: GitChanges, format: 'conventional' | 'keepachangelog'): Promise<string> {
    const config = vscode.workspace.getConfiguration('changeScribe');

    let formattedChanges = '';

    if (format === 'conventional') {
        formattedChanges = `Changes to be documented:

        Staged Files:
        ${changes.staged.map(f => `- ${f.status} ${f.file}
        ${f.diff || ''}`).join('\n')}

        Recent Commits:
        ${changes.commits.map(c => `- ${c.message}
        Files: ${c.files.map(f => f.file).join(', ')}`).join('\n')}`;
            } else {
                formattedChanges = `Changes to be documented:

        Modified Files:
        ${changes.staged.map(f => `* ${f.file}
        ${f.diff || ''}`).join('\n')}

        Recent Changes:
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
