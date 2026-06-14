const { Plugin, PluginSettingTab, Setting, Notice } = require('obsidian');

// ---------------------------------------------------------------------------
// Helpers — port of xor_key.py
// ---------------------------------------------------------------------------

const BASE64_ASCII =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function isValidHexKey(hex) {
  if (!hex || hex.length % 2 !== 0) return false;
  return /^[0-9a-fA-F]+$/.test(hex);
}

function xorBytes(sourceBytes, keyBytes) {
  return sourceBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
}

function randomChar() {
  return BASE64_ASCII[Math.floor(Math.random() * BASE64_ASCII.length)];
}

/** Mirrors pad_short_text() from Python. */
function padShortText(textBytes, keyLen) {
  if (textBytes.length >= keyLen) return textBytes;

  let targetLen = keyLen;
  while (textBytes.length + 2 > targetLen) targetLen += keyLen;

  const randomLen = targetLen - textBytes.length - 2;
  const sep = [0x2f, 0x2a]; // b"/*"
  const tail = Array.from({ length: randomLen }, () =>
    randomChar().charCodeAt(0)
  );
  return [...textBytes, ...sep, ...tail];
}

function hexToBytes(hex) {
  const result = [];
  for (let i = 0; i < hex.length; i += 2)
    result.push(parseInt(hex.slice(i, i + 2), 16));
  return result;
}

function bytesToHex(bytes) {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function textToXorHex(text, hexKey) {
  if (!isValidHexKey(hexKey)) throw new Error('Neplatný hex klíč.');
  const encoder = new TextEncoder();
  const textBytes = Array.from(encoder.encode(text));
  const keyBytes = hexToBytes(hexKey);
  const padded = padShortText(textBytes, keyBytes.length);
  return bytesToHex(xorBytes(padded, keyBytes));
}

function textFromXorHex(value, hexKey) {
  if (!value) return '';
  if (!isValidHexKey(value) || value.length % 2 !== 0) return value;
  if (!isValidHexKey(hexKey)) return value;
  const xorValue = hexToBytes(value);
  const keyBytes = hexToBytes(hexKey);
  const decoded = xorBytes(xorValue, keyBytes);
  // split on b"/*" (0x2f, 0x2a) — take only the part before it
  let end = decoded.length;
  for (let i = 0; i < decoded.length - 1; i++) {
    if (decoded[i] === 0x2f && decoded[i + 1] === 0x2a) { end = i; break; }
  }
  return new TextDecoder().decode(new Uint8Array(decoded.slice(0, end)));
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS = {
  hexKey: '',
};

class XorCipherSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'XOR Cipher — nastavení' });

    new Setting(containerEl)
      .setName('Hex klíč (XEY_HEX)')
      .setDesc('Sudý počet hex znaků, např. 0c1e24e5917779d297e14d45f14e1a1a')
      .addText(text => {
        text
          .setPlaceholder('0c1e24e5...')
          .setValue(this.plugin.settings.hexKey)
          .onChange(async value => {
            this.plugin.settings.hexKey = value.trim();
            await this.plugin.saveSettings();
          });
        text.inputEl.style.width = '100%';
        text.inputEl.style.fontFamily = 'monospace';
      });

    // live validity indicator
    new Setting(containerEl)
      .setName('Stav klíče')
      .setDesc(
        isValidHexKey(this.plugin.settings.hexKey)
          ? `✅ Platný klíč — ${this.plugin.settings.hexKey.length / 2} bajtů`
          : '⚠️ Klíč není nastaven nebo je neplatný'
      );
  }
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

class XorCipherPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new XorCipherSettingTab(this.app, this));

    // --- Encrypt ---
    this.addCommand({
      id: 'xor-encrypt',
      name: 'XOR Encrypt — vybraný text → hex',
      editorCallback: (editor) => {
        const selected = editor.getSelection();
        if (!selected) { new Notice('Nejdřív vyber text.'); return; }
        if (!isValidHexKey(this.settings.hexKey)) {
          new Notice('⚠️ Nastav hex klíč v nastavení pluginu.');
          return;
        }
        try {
          const hex = textToXorHex(selected, this.settings.hexKey);
          editor.replaceSelection(hex);
          new Notice('✅ Zašifrováno.');
        } catch (e) {
          new Notice('Chyba: ' + e.message);
        }
      },
    });

    // --- Decrypt ---
    this.addCommand({
      id: 'xor-decrypt',
      name: 'XOR Decrypt — hex → čitelný text',
      editorCallback: (editor) => {
        const selected = editor.getSelection();
        if (!selected) { new Notice('Nejdřív vyber hex text.'); return; }
        if (!isValidHexKey(this.settings.hexKey)) {
          new Notice('⚠️ Nastav hex klíč v nastavení pluginu.');
          return;
        }
        try {
          const plain = textFromXorHex(selected.trim(), this.settings.hexKey);
          editor.replaceSelection(plain);
          new Notice('✅ Dešifrováno.');
        } catch (e) {
          new Notice('Chyba: ' + e.message);
        }
      },
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

module.exports = XorCipherPlugin;
