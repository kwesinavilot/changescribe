import * as vscode from 'vscode';

// Base TreeItem class that can be used by all providers
export class ChangelogItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly iconName?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = command;
        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName);
        }
    }
}

// Changes section provider
export class ChangesTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangelogItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ChangelogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangelogItem): Thenable<ChangelogItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        return Promise.resolve([
            new ChangelogItem(
                'Generate Changelog',
                'Generate a new changelog',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'changeScribe.generateChangelog',
                    title: 'Generate Changelog'
                },
                'note-add'
            )
        ]);
    }
}

// Settings section provider
export class SettingsTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangelogItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ChangelogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangelogItem): Thenable<ChangelogItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        return Promise.resolve([
            new ChangelogItem(
                'Changelog Format',
                'Configure changelog format',
                vscode.TreeItemCollapsibleState.None,
                { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.format'] },
                'note'
            ),
            new ChangelogItem(
                'Change LLM Provider',
                'Update the LLM provider settings',
                vscode.TreeItemCollapsibleState.None,
                { command: 'changescribe.updateLLMProvider', title: '' },
                'server'
            ),
            new ChangelogItem(
                'Set Maximum Commits',
                'Set maximum commits to include',
                vscode.TreeItemCollapsibleState.None,
                { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.maxCommits'] },
                'number'
            ),
            new ChangelogItem(
                'Include Unstaged Changes',
                'Toggle inclusion of unstaged changes',
                vscode.TreeItemCollapsibleState.None,
                { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe.includeUnstagedChanges'] },
                'git-commit'
            ),
            new ChangelogItem(
                '⚙ Open Full Settings',
                'Open all Change Scribe settings',
                vscode.TreeItemCollapsibleState.None,
                { command: 'workbench.action.openSettings', title: '', arguments: ['changescribe'] },
                'gear'
            )
        ]);
    }
}

// Help & Feedback section provider
export class HelpTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangelogItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ChangelogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangelogItem): Thenable<ChangelogItem[]> {
        if (element) {
            return Promise.resolve([]);
        }

        return Promise.resolve([
            new ChangelogItem(
                'Read Extension Docs',
                'View documentation',
                vscode.TreeItemCollapsibleState.None,
                { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe#readme'] },
                'book'
            ),
            new ChangelogItem(
                'Report Issue',
                'Report a bug or suggest a feature',
                vscode.TreeItemCollapsibleState.None,
                { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe/issues'] },
                'bug'
            ),
            new ChangelogItem(
                'Contribute',
                'Contribute to Change Scribe',
                vscode.TreeItemCollapsibleState.None,
                { command: 'vscode.open', title: '', arguments: ['https://github.com/kwesinavilot/changescribe'] },
                'git-pull-request'
            )
        ]);
    }
}

// Keep the original ChangelogTreeProvider for backward compatibility if needed
export class ChangelogTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangelogItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ChangelogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangelogItem): Thenable<ChangelogItem[]> {
        // This provider is kept for backward compatibility
        // You can remove it if not needed
        return Promise.resolve([]);
    }
}
