const { Modal, Notice, Plugin, PluginSettingTab, Setting } = require('obsidian');

let core = null;

function loadCore(plugin) {
  if (core) return core;

  const path = require('path');
  const basePath = plugin.app.vault.adapter.getBasePath();
  const pluginDir = plugin.manifest.dir || path.join('.obsidian', 'plugins', plugin.manifest.id);
  const corePath = path.join(path.isAbsolute(pluginDir) ? pluginDir : path.join(basePath, pluginDir), 'core.js');

  try {
    core = require(corePath);
  } catch (error) {
    throw new Error(`Could not load Kalk OBT core library from ${corePath}: ${error.message}`);
  }

  return core;
}

class KalkObtModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.privateKeyValue = '';
    this.hashInputValue = '';
    this.publicKeyResultEl = null;
    this.hashResultEl = null;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: 'Kalk OBT' });

    this.renderEss251Section(contentEl);
    this.renderAsh24Section(contentEl);
  }

  renderEss251Section(containerEl) {
    containerEl.createEl('h3', { text: 'ess251' });

    new Setting(containerEl)
      .setName('Private key')
      .setDesc('Enter an integer private key. The public key is private_key * G.')
      .addText((text) => {
        text
          .setPlaceholder('111')
          .onChange((value) => {
            this.privateKeyValue = value.trim();
          });
        text.inputEl.type = 'number';
        text.inputEl.step = '1';
      });

    const resultRow = new Setting(containerEl).setName('Public key');
    this.publicKeyResultEl = resultRow.controlEl.createEl('pre', { text: '-' });
    this.publicKeyResultEl.style.margin = '0';

    new Setting(containerEl).addButton((button) => {
      button
        .setButtonText('Calculate')
        .setCta()
        .onClick(() => this.calculatePublicKey());
    });
  }

  renderAsh24Section(containerEl) {
    containerEl.createEl('h3', { text: 'ash24' });

    new Setting(containerEl)
      .setName('Input')
      .setDesc('Enter text that will be hashed as UTF-8 bytes.')
      .addTextArea((text) => {
        text
          .setPlaceholder('Agama123')
          .onChange((value) => {
            this.hashInputValue = value;
          });
        text.inputEl.rows = 3;
        text.inputEl.style.width = '100%';
      });

    const resultRow = new Setting(containerEl).setName('24-bit hash');
    this.hashResultEl = resultRow.controlEl.createEl('pre', { text: '-' });
    this.hashResultEl.style.margin = '0';

    new Setting(containerEl).addButton((button) => {
      button
        .setButtonText('Calculate')
        .setCta()
        .onClick(() => this.calculateHash());
    });
  }

  calculatePublicKey() {
    try {
      const publicKey = core.publicKeyFromPrivate(this.privateKeyValue, this.plugin.settings);
      this.publicKeyResultEl.setText(core.formatPublicKey(publicKey));
      new Notice('ESS251 public key calculated.');
    } catch (error) {
      this.publicKeyResultEl.setText(error.message);
      new Notice(error.message);
    }
  }

  calculateHash() {
    const hash = core.ash24Text(this.hashInputValue);
    this.hashResultEl.setText(core.formatHash(hash));
    new Notice('ASH24 hash calculated.');
  }

  onClose() {
    this.contentEl.empty();
  }
}

class KalkObtSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Kalk OBT settings' });

    new Setting(containerEl)
      .setName('Preset')
      .setDesc('Restore default ESS251 parameters.')
      .addButton((button) => {
        button
          .setButtonText('ess251')
          .setCta()
          .onClick(async () => {
            this.plugin.settings = core.normalizeSettings(core.DEFAULT_SETTINGS);
            await this.plugin.saveSettings();
            this.display();
            new Notice('ESS251 defaults restored.');
          });
      });

    new Setting(containerEl)
      .setName('Generator G')
      .setDesc('Curve generator point as x, y coordinates.')
      .addText((text) => {
        text
          .setPlaceholder('10')
          .setValue(String(this.plugin.settings.generator[0]))
          .onChange(async (value) => {
            const x = Number(value.trim());
            if (!Number.isInteger(x)) return;
            this.plugin.settings.generator = [x, this.plugin.settings.generator[1]];
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'number';
        text.inputEl.step = '1';
      })
      .addText((text) => {
        text
          .setPlaceholder('76')
          .setValue(String(this.plugin.settings.generator[1]))
          .onChange(async (value) => {
            const y = Number(value.trim());
            if (!Number.isInteger(y)) return;
            this.plugin.settings.generator = [this.plugin.settings.generator[0], y];
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'number';
        text.inputEl.step = '1';
      });

    new Setting(containerEl)
      .setName('Modulo')
      .setDesc('Finite field modulo. Group order is calculated as modulo + 1.')
      .addText((text) => {
        text
          .setPlaceholder('251')
          .setValue(String(this.plugin.settings.modulo))
          .onChange(async (value) => {
            const modulo = Number(value.trim());
            if (!Number.isInteger(modulo) || modulo < 2) return;
            this.plugin.settings.modulo = modulo;
            await this.plugin.saveSettings();
            this.display();
          });
        text.inputEl.type = 'number';
        text.inputEl.step = '1';
      });

    new Setting(containerEl)
      .setName('Group order')
      .setDesc(String(core.orderFromModulo(this.plugin.settings.modulo)));
  }
}

class KalkObtPlugin extends Plugin {
  async onload() {
    loadCore(this);
    await this.loadSettings();
    this.addSettingTab(new KalkObtSettingTab(this.app, this));

    const ribbonIconEl = this.addRibbonIcon('calculator', 'Open Kalk OBT', () => {
      new KalkObtModal(this.app, this).open();
    });
    ribbonIconEl.parentElement?.appendChild(ribbonIconEl);

    this.addCommand({
      id: 'open-kalk-obt',
      name: 'Open calculator',
      callback: () => new KalkObtModal(this.app, this).open(),
    });
  }

  async loadSettings() {
    this.settings = core.normalizeSettings(Object.assign({}, core.DEFAULT_SETTINGS, await this.loadData()));
  }

  async saveSettings() {
    this.settings = core.normalizeSettings(this.settings);
    await this.saveData(this.settings);
  }
}

module.exports = KalkObtPlugin;
