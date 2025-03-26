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

export function activate(context: vscode.ExtensionContext) {
    // Register the tree data provider
    const changelogTreeProvider = new ChangelogTreeProvider();
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

class ChangelogTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangelogItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ChangelogItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<ChangelogItem[]> {
        return Promise.resolve([
            new ChangelogItem(
                'Generate Changelog',
                'Generate a new changelog',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'changeScribe.generateChangelog',
                    title: 'Generate Changelog',
                    tooltip: 'Generate a new changelog'
                }
            ),
            new ChangelogItem(
                'Change LLM Provider',
                'Update the LLM provider settings',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'changescribe.updateLLMProvider',
                    title: 'Change LLM Provider',
                    tooltip: 'Update the LLM provider settings'
                }
            )
        ]);
    }
}

class ChangelogItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = command;
    }
}
