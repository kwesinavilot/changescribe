import { simpleGit, SimpleGit, LogResult } from 'simple-git';
import * as vscode from 'vscode';

export async function getGitLog(maxCommits: number): Promise<LogResult> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error('No workspace folder found. Please open a project.');
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const git: SimpleGit = simpleGit(rootPath);

    return await git.log({ maxCount: maxCommits });
}

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
