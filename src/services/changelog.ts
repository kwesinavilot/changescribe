// import { LogResult } from 'simple-git';
// import * as vscode from 'vscode';

// export async function generateChangelog(logResult: LogResult): Promise<string> {
//     const config = vscode.workspace.getConfiguration('changeScribe');
//     const changelogFormat = config.get<string>('changelogFormat') || 'conventional';

//     let changelog = '# Changelog\n\n';

//     for (const commit of logResult.all) {
//         const changeType = getChangeType(commit.message);
//         const aiGeneratedDescription = await getAIGeneratedDescription(commit.message);

//         if (changelogFormat === 'conventional') {
//             changelog += `## ${commit.date}: ${changeType}\n\n`;
//             changelog += `${aiGeneratedDescription}\n\n`;
//             changelog += `Commit: ${commit.hash}\n`;
//             changelog += `Author: ${commit.author_name} <${commit.author_email}>\n\n`;
//         } else if (changelogFormat === 'keepachangelog') {
//             changelog += `### ${changeType}\n`;
//             changelog += `- ${aiGeneratedDescription} (${commit.hash})\n\n`;
//         }
//     }

//     return changelog;
// }

// export function getChangeType(commitMessage: string): string {
//     if (commitMessage.startsWith('feat:')) return 'Feature';
//     if (commitMessage.startsWith('fix:')) return 'Bug Fix';
//     if (commitMessage.startsWith('docs:')) return 'Documentation';
//     if (commitMessage.startsWith('style:')) return 'Style';
//     if (commitMessage.startsWith('refactor:')) return 'Refactor';
//     if (commitMessage.startsWith('test:')) return 'Test';
//     if (commitMessage.startsWith('chore:')) return 'Chore';
//     return 'Other';
// }
