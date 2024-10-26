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
const vscode = require("vscode");
const openai_1 = require("./openai");
function generateChangelog(logResult) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('literate');
        const changelogFormat = config.get('changelogFormat') || 'conventional';
        let changelog = '# Changelog\n\n';
        for (const commit of logResult.all) {
            const changeType = getChangeType(commit.message);
            const aiGeneratedDescription = yield (0, openai_1.getAIGeneratedDescription)(commit.message);
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
//# sourceMappingURL=changelog.js.map