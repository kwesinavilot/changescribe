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
    }
}

export class ChangelogTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    
    private _headerItem: vscode.TreeItem | null = null;

    constructor(private context: vscode.ExtensionContext) {
        this.initializeHeader();
    }

    private initializeHeader() {
        const headerTreeItem = new vscode.TreeItem('Change Scribe');
        headerTreeItem.iconPath = {
            light: vscode.Uri.file(this.context.asAbsolutePath('resources/light-icon.svg')),
            dark: vscode.Uri.file(this.context.asAbsolutePath('resources/dark-icon.svg'))
        };
        this._headerItem = headerTreeItem;
    }

    setHeaderItem(item: vscode.TreeItem) {
        this._headerItem = item;
        this.refresh();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<vscode.TreeItem[]> {
        const items: vscode.TreeItem[] = [];

        if (this._headerItem) {
            this._headerItem.contextValue = 'changeScribeHeader';
            items.push(this._headerItem);
        }

        items.push(
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
        );

        return Promise.resolve(items);
    }
}