import { Plugin, ItemView, PluginSettingTab, Setting } from 'obsidian';
import LoomViewComponent from './LoomView.svelte';

export const LOOM_VIEW_TYPE = 'loom-view';

export interface LoomViewSettings {
  startDateKey: string;
  endDateKey: string;
  dateFormat: string;
  laneKey: string;
  laneOrder: string;
  showUncategorized: boolean;
  connectionKeys: string;
  zoomLevels: string;
  eraBookmarks: string;
  sourceFolders: string;
  requiredTags: string;
  scopeOperator: 'AND' | 'OR';
  visibleLanes: string[];
}

export const DEFAULT_SETTINGS: LoomViewSettings = {
  startDateKey: 'year-start',
  endDateKey: 'year-end',
  dateFormat: 'yyyy-MM-dd',
  laneKey: 'region',
  laneOrder: 'Americas, Europe, Africa, Asia, South-Asia, East-Asia',
  showUncategorized: true,
  connectionKeys: 'key-figures',
  zoomLevels: '1, 10, 100',
  eraBookmarks: 'Bronze: -3000\nIron: -1200\nClassical: -500\nDiscovery: 1400\nModern: 1900',
  sourceFolders: '',
  requiredTags: '',
  scopeOperator: 'OR',
  visibleLanes: [],
};

class LoomView extends ItemView {
    component?: LoomViewComponent;
    settings: LoomViewSettings;

    constructor(leaf: import('obsidian').WorkspaceLeaf, settings: LoomViewSettings) {
        super(leaf);
        this.settings = settings;
    }

    getViewType() {
        return LOOM_VIEW_TYPE;
    }

    getDisplayText() {
        return 'Loom';
    }

    async onOpen() {
        this.component = new LoomViewComponent({
            target: this.contentEl,
            props: {
                app: this.app,
                settings: this.settings,
                saveVisibleLanes: async (lanes: string[]) => {
                    const plugin = (this.app as any).plugins?.plugins?.['loom-view'];
                    if (plugin) {
                        plugin.settings.visibleLanes = lanes;
                        await plugin.saveSettings();
                    }
                }
            }
        });
    }

    async onClose() {
        if (this.component) {
            this.component.$destroy();
        }
    }
}

export default class LoomViewPlugin extends Plugin {
    settings: LoomViewSettings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new LoomViewSettingsTab(this.app, this));

        this.registerView(
            LOOM_VIEW_TYPE,
            (leaf) => new LoomView(leaf, this.settings)
        );

        this.addRibbonIcon('git-branch-plus', 'Open Loom View', () => {
            this.activateView();
        });

        this.addCommand({
            id: 'open-loom-view',
            name: 'Open Loom View',
            callback: () => {
                this.activateView();
            }
        });
    }

    async onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Update settings in all open views
        const leaves = this.app.workspace.getLeavesOfType(LOOM_VIEW_TYPE);
        for (const leaf of leaves) {
            const view = leaf.view as LoomView;
            if (view && view.component) {
                view.settings = this.settings;
                view.component.$set({ settings: this.settings });
            }
        }
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(LOOM_VIEW_TYPE);

        const leaf = this.app.workspace.getLeaf(false);
        if (leaf) {
            await leaf.setViewState({
                type: LOOM_VIEW_TYPE,
                active: true,
            });
            this.app.workspace.revealLeaf(
                this.app.workspace.getLeavesOfType(LOOM_VIEW_TYPE)[0]
            );
        }
    }
}

class LoomViewSettingsTab extends PluginSettingTab {
    plugin: LoomViewPlugin;

    constructor(app: import('obsidian').App, plugin: LoomViewPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        // Add CSS to prevent textarea resizing
        containerEl.createEl('style', { 
            text: '.setting-item textarea { resize: none; }' 
        });

        containerEl.createEl('h2', { text: 'Loom View Settings' });

        containerEl.createEl('h3', { text: 'Data Scope' });

        new Setting(containerEl)
            .setName('Source Folders')
            .setDesc('Comma-separated folder paths to include. Supports wildcards (e.g., "History/*" matches all History subfolders, "History/Ancient, Projects/*"). Leave empty to include all folders.')
            .addText(text => text
                .setPlaceholder('History/*, Projects/Timeline')
                .setValue(this.plugin.settings.sourceFolders)
                .onChange(async (value) => {
                    this.plugin.settings.sourceFolders = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Required Tags')
            .setDesc('Comma-separated tags to filter by. Follows Obsidian tag search: "History" matches "#History" and all nested like "#History/India". Use "History/" to match only nested children. Examples: "#ancient, History, #empire". Leave empty to include all tags.')
            .addText(text => text
                .setPlaceholder('#ancient, History, #empire')
                .setValue(this.plugin.settings.requiredTags)
                .onChange(async (value) => {
                    this.plugin.settings.requiredTags = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Scope Operator')
            .setDesc('How to combine folder and tag filters')
            .addDropdown(dropdown => dropdown
                .addOption('OR', 'Match Any (OR)')
                .addOption('AND', 'Match All (AND)')
                .setValue(this.plugin.settings.scopeOperator)
                .onChange(async (value) => {
                    this.plugin.settings.scopeOperator = value as 'AND' | 'OR';
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'View Settings' });

        new Setting(containerEl)
            .setName('Start Date Key')
            .setDesc('Frontmatter key for the start date (e.g., "year-start")')
            .addText(text => text
                .setPlaceholder('year-start')
                .setValue(this.plugin.settings.startDateKey)
                .onChange(async (value) => {
                    this.plugin.settings.startDateKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('End Date Key')
            .setDesc('Frontmatter key for the end date (e.g., "year-end")')
            .addText(text => text
                .setPlaceholder('year-end')
                .setValue(this.plugin.settings.endDateKey)
                .onChange(async (value) => {
                    this.plugin.settings.endDateKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Date Format')
            .setDesc('Specify the format for parsing dates (e.g., "yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy"). Uses date-fns format tokens.')
            .addText(text => text
                .setPlaceholder('yyyy-MM-dd')
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Lane Key')
            .setDesc('Frontmatter key used to group notes into lanes (e.g., "region")')
            .addText(text => text
                .setPlaceholder('region')
                .setValue(this.plugin.settings.laneKey)
                .onChange(async (value) => {
                    this.plugin.settings.laneKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Lane Order')
            .setDesc('Comma-separated list defining the order of lanes (e.g., "Americas, Europe, South-Asia")')
            .addTextArea(text => text
                .setPlaceholder('Americas, Europe, South-Asia')
                .setValue(this.plugin.settings.laneOrder)
                .onChange(async (value) => {
                    this.plugin.settings.laneOrder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Show Uncategorized')
            .setDesc('Show an "Others" lane for notes with lane values not in the lane order list')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showUncategorized)
                .onChange(async (value) => {
                    this.plugin.settings.showUncategorized = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Connection Keys')
            .setDesc('Comma-separated list of frontmatter keys to check for entity glow connections (e.g., "key-figures, mentors")')
            .addText(text => text
                .setPlaceholder('key-figures')
                .setValue(this.plugin.settings.connectionKeys)
                .onChange(async (value) => {
                    this.plugin.settings.connectionKeys = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Zoom Levels')
            .setDesc('Comma-separated list of integers defining zoom granularities (e.g., "1, 10, 100" for Year, Decade, Century)')
            .addText(text => text
                .setPlaceholder('1, 10, 100')
                .setValue(this.plugin.settings.zoomLevels)
                .onChange(async (value) => {
                    this.plugin.settings.zoomLevels = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Era Bookmarks')
            .setDesc('Bookmarks for quick navigation (one per line). Year mode: "Label: Year" (e.g. Bronze: -3000). Date mode: "Label: Date" (e.g. Week 1: 2026-01-01). Uses Date Format setting for parsing dates.')
            .addTextArea(text => text
                .setPlaceholder('Bronze: -3000\nIron: -1200\nClassical: -500')
                .setValue(this.plugin.settings.eraBookmarks)
                .onChange(async (value) => {
                    this.plugin.settings.eraBookmarks = value;
                    await this.plugin.saveSettings();
                }));
    }
}
