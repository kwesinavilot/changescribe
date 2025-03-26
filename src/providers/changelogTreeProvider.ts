import * as vscode from 'vscode';

export class ChangelogItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = command;
        this.iconPath = new vscode.ThemeIcon('note'); // Add an icon
    }
}

export class ChangelogTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangelogItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ChangelogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangelogItem): Thenable<ChangelogItem[]> {
        if (element) {
            return Promise.resolve([]); // Return empty for child items
        }

        return Promise.resolve([
            new ChangelogItem(
                'Generate Changelog',
                'Generate a new changelog',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'changeScribe.generateChangelog',
                    title: 'Generate Changelog',
                    arguments: []
                }
            ),
            new ChangelogItem(
                'Change LLM Provider',
                'Update the LLM provider settings',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'changescribe.updateLLMProvider',
                    title: 'Change LLM Provider',
                    arguments: []
                }
            )
        ]);
    }
}