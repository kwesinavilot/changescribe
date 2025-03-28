import * as vscode from 'vscode';
import { registerCommands } from './utils/commands';
import { ChangelogTreeProvider } from './providers/changelogTreeProvider';

/**
 * Activates the Change Scribe extension.
 * 
 * This function is called when the extension is activated. It displays an
 * activation message, registers the extension's commands, and sets up a 
 * custom tree data provider for displaying the changelog.
 * 
 * @param context - The context in which the extension is running, providing
 *                  access to the extension's environment and resources.
 */

/**
 * Activates the Change Scribe extension.
 * 
 * This function is called when the extension is activated. It registers the
 * tree data provider and commands, and sets up a custom tree data provider
 * for displaying the changelog.
 * 
 * @param context - The context in which the extension is running, providing
 *                  access to the extension's environment and resources.
 */
export function activate(context: vscode.ExtensionContext) {
    // Register the tree data provider
    const changelogProvider = new ChangelogTreeProvider(context);
    vscode.window.registerTreeDataProvider('changeScribeView', changelogProvider);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('changeScribe.refreshView', () => 
            changelogProvider.refresh
        )
    );

    registerCommands(context);
}

export function deactivate() {}
