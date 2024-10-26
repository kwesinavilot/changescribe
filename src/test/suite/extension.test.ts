import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('YourPublisherName.literate'));
    });

    test('Should activate extension', async () => {
        const ext = vscode.extensions.getExtension('YourPublisherName.literate');
        await ext?.activate();
        assert.ok(ext?.isActive);
    });

    test('Should register generate changelog command', () => {
        return vscode.commands.getCommands(true).then((commands) => {
            assert.ok(commands.includes('literate.generateChangelog'));
        });
    });
});
