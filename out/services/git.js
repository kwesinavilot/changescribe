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
exports.getGitLog = getGitLog;
exports.commitChangelog = commitChangelog;
const simple_git_1 = require("simple-git");
const vscode = require("vscode");
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