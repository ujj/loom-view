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
    plugin: LoomViewPlugin;

    constructor(leaf: import('obsidian').WorkspaceLeaf, settings: LoomViewSettings, plugin: LoomViewPlugin) {
        super(leaf);
        this.settings = settings;
        this.plugin = plugin;
    }

    getViewType() {
        return LOOM_VIEW_TYPE;
    }

    getDisplayText() {
        return 'Loom';
    }

    onOpen(): Promise<void> {
        this.component = new LoomViewComponent({
            target: this.contentEl,
            props: {
                app: this.app,
                settings: this.settings,
                saveVisibleLanes: async (lanes: string[]) => {
                    this.plugin.settings.visibleLanes = lanes;
                    await this.plugin.saveSettings();
                }
            }
        });
        return Promise.resolve();
    }

    onClose(): Promise<void> {
        if (this.component) {
            this.component.$destroy();
        }
        return Promise.resolve();
    }
}

export default class LoomViewPlugin extends Plugin {
    settings: LoomViewSettings = DEFAULT_SETTINGS;

    onload() {
        void this.loadSettings().then(() => {
            this.addSettingTab(new LoomViewSettingsTab(this.app, this));

            this.registerView(
                LOOM_VIEW_TYPE,
                (leaf) => new LoomView(leaf, this.settings, this)
            );

            this.addRibbonIcon('git-branch-plus', 'Open view', () => {
                void this.activateView();
            });

            this.addCommand({
                id: 'open-view',
                name: 'Open view',
                callback: () => {
                    void this.activateView();
                }
            });
        });
    }

    onunload() {
    }

    async loadSettings() {
        const data = (await this.loadData()) as Partial<LoomViewSettings> | null;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Update settings in all open views
        const leaves = this.app.workspace.getLeavesOfType(LOOM_VIEW_TYPE);
        for (const leaf of leaves) {
            const view = leaf.view as unknown as LoomView;
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
            const loomLeaf = this.app.workspace.getLeavesOfType(LOOM_VIEW_TYPE)[0];
            if (loomLeaf) void this.app.workspace.revealLeaf(loomLeaf);
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

        new Setting(containerEl).setName('Data scope').setHeading();

        new Setting(containerEl)
            .setName('Source folders')
            .setDesc('Comma-separated folder paths to include. Supports wildcards (e.g. "history/*" matches all history subfolders, "history/ancient, projects/*"). Leave empty to include all folders.')
            .addText(text => text
                .setPlaceholder('History/*, projects/timeline')
                .setValue(this.plugin.settings.sourceFolders)
                .onChange(async (value) => {
                    this.plugin.settings.sourceFolders = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Required tags')
            .setDesc('Comma-separated tags to filter by. Follows Obsidian tag search: "history" matches "#history" and all nested like "#history/india". Use "history/" to match only nested children. Examples: "#ancient, history, #empire". Leave empty to include all tags.')
            .addText(text => text
                .setPlaceholder('#ancient, history, #empire')
                .setValue(this.plugin.settings.requiredTags)
                .onChange(async (value) => {
                    this.plugin.settings.requiredTags = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Scope operator')
            .setDesc('How to combine folder and tag filters')
            .addDropdown(dropdown => dropdown
                .addOption('OR', 'Match any (or)')
                .addOption('AND', 'Match all (and)')
                .setValue(this.plugin.settings.scopeOperator)
                .onChange(async (value) => {
                    this.plugin.settings.scopeOperator = value as 'AND' | 'OR';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl).setName('View').setHeading();

        new Setting(containerEl)
            .setName('Start date key')
            .setDesc('Frontmatter key for the start date (e.g. "year-start").')
            .addText(text => text
                .setPlaceholder('Year-start')
                .setValue(this.plugin.settings.startDateKey)
                .onChange(async (value) => {
                    this.plugin.settings.startDateKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('End date key')
            .setDesc('Frontmatter key for the end date (e.g. "year-end").')
            .addText(text => text
                .setPlaceholder('Year-end')
                .setValue(this.plugin.settings.endDateKey)
                .onChange(async (value) => {
                    this.plugin.settings.endDateKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Date format')
            .setDesc('Specify the format for parsing dates (e.g. "yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy"). Uses date-fns format tokens.')
            .addText(text => text
                .setPlaceholder('Date format, e.g. yyyy-MM-dd')
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Lane key')
            .setDesc('Frontmatter key used to group notes into lanes (e.g. "region").')
            .addText(text => text
                .setPlaceholder('Region')
                .setValue(this.plugin.settings.laneKey)
                .onChange(async (value) => {
                    this.plugin.settings.laneKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Lane order')
            .setDesc('Comma-separated list defining the order of lanes (e.g. "americas, europe, south-asia").')
            .addTextArea(text => text
                .setPlaceholder('Americas, europe, south-asia')
                .setValue(this.plugin.settings.laneOrder)
                .onChange(async (value) => {
                    this.plugin.settings.laneOrder = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Show uncategorized')
            .setDesc('Show an "others" lane for notes with lane values not in the lane order list')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showUncategorized)
                .onChange(async (value) => {
                    this.plugin.settings.showUncategorized = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Connection keys')
            .setDesc('Comma-separated list of frontmatter keys to check for entity glow connections (e.g. "key-figures, mentors").')
            .addText(text => text
                .setPlaceholder('Key-figures')
                .setValue(this.plugin.settings.connectionKeys)
                .onChange(async (value) => {
                    this.plugin.settings.connectionKeys = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Zoom levels')
            .setDesc('Comma-separated list of integers defining zoom granularities (e.g. "1, 10, 100" for year, decade, century).')
            .addText(text => text
                .setPlaceholder('1, 10, 100')
                .setValue(this.plugin.settings.zoomLevels)
                .onChange(async (value) => {
                    this.plugin.settings.zoomLevels = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Era bookmarks')
            .setDesc('Bookmarks for quick navigation (one per line). Year mode: "label: year" (e.g. Bronze: -3000). Date mode: "label: date" (e.g. Week 1: 2026-01-01). Uses date format setting for parsing dates.')
            .addTextArea(text => text
                .setPlaceholder('Bronze: -3000\niron: -1200\nclassical: -500')
                .setValue(this.plugin.settings.eraBookmarks)
                .onChange(async (value) => {
                    this.plugin.settings.eraBookmarks = value;
                    await this.plugin.saveSettings();
                }));
    }
}
