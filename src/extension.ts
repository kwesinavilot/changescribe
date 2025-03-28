import * as vscode from 'vscode';
import { registerCommands } from './utils/commands';
import { 
    ChangesTreeProvider, 
    SettingsTreeProvider, 
    HelpTreeProvider 
} from './providers/changelogTreeProvider';
import { ChangelogWebviewProvider } from './providers/changelogWebviewProvider';

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
    // Register the original TreeView provider (keep this)
    const changesProvider = new ChangesTreeProvider();
    const settingsProvider = new SettingsTreeProvider();
    const helpProvider = new HelpTreeProvider();
    
    vscode.window.registerTreeDataProvider('changeScribeChangesView', changesProvider);
    vscode.window.registerTreeDataProvider('changeScribeSettingsView', settingsProvider);
    vscode.window.registerTreeDataProvider('changeScribeHelpView', helpProvider);

    // Register the new WebView provider
    // const webviewProvider = new ChangelogWebviewProvider(context.extensionUri);
    // context.subscriptions.push(
    //     vscode.window.registerWebviewViewProvider(
    //         ChangelogWebviewProvider.viewType, 
    //         webviewProvider
    //     )
    // );

    // Register commands
    context.subscriptions.push(
            vscode.commands.registerCommand('changeScribe.refreshView', () => {
                changesProvider.refresh()
                settingsProvider.refresh()
                helpProvider.refresh()
            }        )
    );

    registerCommands(context);
}

export function deactivate() {}
