import * as vscode from 'vscode';
import { registerCommands } from './utils/commands';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('Change Scribe extension is now active!');
    registerCommands(context);
}

export function deactivate() { }
