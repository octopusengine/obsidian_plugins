const { Plugin, PluginSettingTab, Setting, Notice } = require('obsidian');

const DEFAULT_SETTINGS = {
  key1: 'string123',
  volume: 50,
};

function clampVolume(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return DEFAULT_SETTINGS.volume;
  return Math.min(100, Math.max(0, Math.round(numericValue)));
}

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month} | ${hours}:${minutes}`;
}

function parseActionCall(source) {
  const expression = source
    .split('\n')
    .map(line => line.trim())
    .find(Boolean);

  if (!expression) {
    throw new Error('Missing action name.');
  }

  const match = expression.match(/^([A-Za-z_$][\w$]*)(?:\s*\(([\s\S]*)\))?$/);
  if (!match) {
    throw new Error(`Invalid action call: ${expression}`);
  }

  return {
    name: match[1],
    args: parseArgs(match[2] ?? ''),
  };
}

function parseArgs(argsSource) {
  const trimmed = argsSource.trim();
  if (!trimmed) return [];

  try {
    return JSON.parse(`[${trimmed}]`);
  } catch (error) {
    throw new Error('Invalid action parameters. Use JSON-style values.');
  }
}

class JsActionSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.key1Draft = null;
    this.volumeDraft = null;
  }

  display() {
    const { containerEl } = this;
    const key1Value = this.key1Draft ?? this.plugin.settings.key1;
    const volumeValue = this.volumeDraft ?? this.plugin.settings.volume;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'JS Action settings' });

    new Setting(containerEl)
      .setName('Key 1')
      .setDesc('Test string returned by the get_key1 action.')
      .addText(text => {
        text
          .setPlaceholder('string123')
          .setValue(key1Value)
          .onChange(value => {
            this.key1Draft = value;
          });
      })
      .addButton(button => {
        button
          .setButtonText('Save')
          .setCta()
          .onClick(async () => {
            await this.plugin.updateSettings({ key1: this.key1Draft ?? key1Value });
            this.key1Draft = null;
            this.display();
            new Notice('JS Action settings saved.');
          });
      });

    new Setting(containerEl)
      .setName('Volume')
      .setDesc('Test value returned by the get_volume action.')
      .addSlider(slider => {
        slider
          .setLimits(0, 100, 1)
          .setValue(volumeValue)
          .setDynamicTooltip()
          .onChange(async value => {
            this.volumeDraft = value;
            await this.plugin.updateSettings({ volume: clampVolume(value) });
          });
      });
  }
}

module.exports = class JsActionPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.actions = this.createActions();

    this.registerMarkdownCodeBlockProcessor('js-action', async (source, el) => {
      await this.renderAction(source, el);
    });

    this.addSettingTab(new JsActionSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.settings.volume = clampVolume(this.settings.volume);
  }

  async updateSettings(nextSettings) {
    this.settings = Object.assign({}, this.settings, nextSettings);
    await this.saveData(this.settings);
  }

  createActions() {
    return {
      get_key1: () => this.settings.key1,
      get_volume: () => this.settings.volume,
      get_version: () => this.manifest.version,
      get_datetime: () => formatDateTime(new Date()),
    };
  }

  async renderAction(source, el) {
    el.empty();

    try {
      const { name, args } = parseActionCall(source);
      const action = this.actions[name];

      if (!action) {
        throw new Error(`Unknown action: ${name}`);
      }

      const result = await action(...args);
      this.renderResult(el, result);
    } catch (error) {
      this.renderError(el, error);
    }
  }

  renderResult(el, result) {
    const pre = el.createEl('pre', { cls: 'js-action-result' });
    pre.createEl('code', { text: String(result ?? '') });
  }

  renderError(el, error) {
    const message = error instanceof Error ? error.message : String(error);
    const pre = el.createEl('pre', { cls: ['js-action-result', 'js-action-error'] });
    pre.createEl('code', { text: message });
  }
};
