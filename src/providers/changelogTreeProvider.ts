import * as vscode from 'vscode';

export class ChangelogItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly iconName?: string,
        public readonly isSection: boolean = false
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = command;

        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName);
        }

        if (isSection) {
            // Make section headers uppercase
            this.label = label.toUpperCase();

            // Remove left padding and line
            this.contextValue = 'section';

            // These properties help remove the indentation
            this.description = '';
            this.resourceUri = undefined;
        }
    }
}

export class ChangelogTreeProvider implements vscode.TreeDataProvider<ChangelogItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<ChangelogItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private _items: ChangelogItem[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.initializeItems();
    }

    private initializeItems() {
        // Changes section
        const changesSection = new ChangelogItem(
            'Changes',
            'Manage changes',
            vscode.TreeItemCollapsibleState.Expanded,
            undefined,
            'history',
            true // Mark as section
        );

        // Settings section
        const settingsSection = new ChangelogItem(
            'Settings',
            'Configure Change Scribe',
            vscode.TreeItemCollapsibleState.Expanded,
            undefined,
            'settings-gear',
            true // Mark as section
        );

        // Help section
        const helpSection = new ChangelogItem(
            'Help & Feedback',
            'Get help and provide feedback',
            vscode.TreeItemCollapsibleState.Expanded,
            undefined,
            'question',
            true // Mark as section
        );

        this._items = [changesSection, settingsSection, helpSection];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: ChangelogItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ChangelogItem): Thenable<ChangelogItem[]> {
        if (!element) {
            // Root level - return main sections
            return Promise.resolve(this._items);
        }

        // Child items based on parent section
        switch (element.label) {
            case 'CHANGES':
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

            case 'SETTINGS':
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

            case 'HELP & FEEDBACK':
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

            default:
                return Promise.resolve([]);
        }
    }
}
