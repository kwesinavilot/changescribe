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
exports.getGitChanges = getGitChanges;
exports.formatChangesForChangelog = formatChangesForChangelog;
exports.getGitLog = getGitLog;
exports.commitChangelog = commitChangelog;
const simple_git_1 = require("simple-git");
const vscode = require("vscode");
/**
 * Retrieves git changes from the current repository, including staged, unstaged files, and recent commits.
 *
 * @param maxCommits - The maximum number of recent commits to retrieve.
 * @returns A Promise resolving to a GitChanges object containing arrays of staged and unstaged files and their status,
 * as well as recent commit information.
 * @throws An error if no workspace folder is open.
 */
function getGitChanges(maxCommits) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found. Please open a project.');
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const git = (0, simple_git_1.simpleGit)(rootPath);
        const config = vscode.workspace.getConfiguration('changeScribe');
        const includeUnstaged = config.get('includeUnstagedChanges') || false;
        // Get repository status
        const status = yield git.status();
        const staged = [];
        const unstaged = [];
        // Process staged changes
        for (const file of status.staged) {
            const diff = yield git.diff(['--cached', file]);
            staged.push({
                file,
                status: ((_a = status.files.find(f => f.path === file)) === null || _a === void 0 ? void 0 : _a.index) || 'M',
                diff: diff
            });
        }
        // Process unstaged changes if enabled
        if (includeUnstaged) {
            const unstagedFiles = [...status.not_added, ...status.modified];
            for (const file of unstagedFiles) {
                const diff = yield git.diff([file]);
                unstaged.push({
                    file,
                    status: ((_b = status.files.find(f => f.path === file)) === null || _b === void 0 ? void 0 : _b.working_dir) || 'M',
                    diff: diff
                });
            }
        }
        // Get recent commits with their changes
        const log = yield git.log({
            maxCount: maxCommits,
            '--name-status': null,
            '--find-renames': null
        });
        const commits = log.all.map(commit => {
            var _a;
            return ({
                hash: commit.hash,
                message: commit.message,
                files: (((_a = commit.diff) === null || _a === void 0 ? void 0 : _a.files) || []).map(file => ({
                    file: file.file,
                    changes: 'changes' in file ? String(file.changes) : ''
                }))
            });
        });
        return includeUnstaged ? { staged, unstaged, commits } : { staged, commits };
    });
}
/**
 * Formats git changes into a changelog string based on the specified format.
 *
 * @param changes - The Git changes to format
 * @param format - The format to use for the changelog ('conventional' or 'keepachangelog')
 * @returns A formatted changelog string
 */
function formatChangesForChangelog(changes, format) {
    return __awaiter(this, void 0, void 0, function* () {
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
        }
        else {
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
    });
}
/**
 * Retrieves the Git commit log for the current workspace.
 *
 * @param maxCommits - The maximum number of commits to retrieve
 * @returns Promise containing the log result with commit history
 * @throws {Error} If no workspace folder is found
 */
function getGitLog(maxCommits) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found. Please open a project.');
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const git = (0, simple_git_1.simpleGit)(rootPath);
        return yield git.log({ maxCount: maxCommits });
    });
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
function commitChangelog(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found. Please open a project.');
        }
        const rootPath = workspaceFolders[0].uri.fsPath;
        const git = (0, simple_git_1.simpleGit)(rootPath);
        try {
            yield git.add('CHANGELOG.md');
            yield git.commit('Update CHANGELOG.md');
            vscode.window.showInformationMessage('Changelog committed successfully!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error committing changelog: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
//# sourceMappingURL=git.js.map