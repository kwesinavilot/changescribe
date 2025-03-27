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
    const changelogTreeProvider = new ChangelogTreeProvider(context);
    const treeView = vscode.window.createTreeView('changeScribeChangelog', {
        treeDataProvider: changelogTreeProvider,
        showCollapseAll: true
    });

    context.subscriptions.push(treeView);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('changeScribe.refreshView', () => 
            changelogTreeProvider.refresh()
        )
    );

    registerCommands(context);
}

export function deactivate() {}
