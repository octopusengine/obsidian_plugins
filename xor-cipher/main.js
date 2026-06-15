const { Plugin, PluginSettingTab, Setting, Notice } = require('obsidian');

const BASE64_ASCII =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const KEY_PRESETS = {
  Andreas: '0c1e24e5917779d297e14d45f14e1a1a',
  Trezor: '752f85035563adff915ac0c3ae1252ed',
};

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
  for (let i = 0; i < hex.length; i += 2) {
    result.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return result;
}

function bytesToHex(bytes) {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function textToXorHex(text, hexKey) {
  if (!isValidHexKey(hexKey)) throw new Error('Invalid hex key.');
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

  let end = decoded.length;
  for (let i = 0; i < decoded.length - 1; i += 1) {
    if (decoded[i] === 0x2f && decoded[i + 1] === 0x2a) {
      end = i;
      break;
    }
  }
  return new TextDecoder().decode(new Uint8Array(decoded.slice(0, end)));
}

const DEFAULT_SETTINGS = {
  hexKey: '',
};

class XorCipherSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.hexKeyDraft = null;
  }

  display() {
    const { containerEl } = this;
    const draftValue = this.hexKeyDraft ?? this.plugin.settings.hexKey;

    containerEl.empty();
    containerEl.createEl('h2', { text: 'XOR Cipher settings' });

    new Setting(containerEl)
      .setName('Key presets')
      .setDesc('Set one of the predefined hex keys.')
      .addButton(button => {
        button
          .setButtonText('Andreas')
          .onClick(async () => {
            await this.plugin.setHexKey(KEY_PRESETS.Andreas);
            this.hexKeyDraft = null;
            this.display();
            new Notice('Andreas key preset selected.');
          });
      })
      .addButton(button => {
        button
          .setButtonText('Trezor')
          .onClick(async () => {
            await this.plugin.setHexKey(KEY_PRESETS.Trezor);
            this.hexKeyDraft = null;
            this.display();
            new Notice('Trezor key preset selected.');
          });
      });

    new Setting(containerEl)
      .setName('Hex key (XEY_HEX)')
      .setDesc('Even number of hex characters.')
      .addText(text => {
        const lengthEl = text.inputEl.parentElement.createEl('span', {
          text: String(draftValue.length),
        });
        lengthEl.style.minWidth = '3em';
        lengthEl.style.textAlign = 'right';
        lengthEl.style.fontFamily = 'monospace';

        text
          .setPlaceholder('0c1e24e5...')
          .setValue(draftValue)
          .onChange(value => {
            this.hexKeyDraft = value.trim();
            lengthEl.setText(String(this.hexKeyDraft.length));
          });
        text.inputEl.style.width = '32em';
        text.inputEl.style.maxWidth = '100%';
        text.inputEl.style.fontFamily = 'monospace';
      });

    new Setting(containerEl)
      .setName('Save key')
      .setDesc('Save the current value from the hex key field.')
      .addButton(button => {
        button
          .setButtonText('Save')
          .setCta()
          .onClick(async () => {
            const nextKey = this.hexKeyDraft ?? this.plugin.settings.hexKey;
            if (!isValidHexKey(nextKey)) {
              new Notice('Key is not set or is invalid.');
              return;
            }

            await this.plugin.setHexKey(nextKey);
            this.hexKeyDraft = null;
            this.display();
            new Notice('Key saved.');
          });
      });

    new Setting(containerEl)
      .setName('Key status')
      .setDesc(
        isValidHexKey(this.plugin.settings.hexKey)
          ? `Valid key - ${this.plugin.settings.hexKey.length / 2} bytes`
          : 'Key is not set or is invalid'
      );
  }
}

class XorCipherPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new XorCipherSettingTab(this.app, this));

    this.addCommand({
      id: 'xor-encrypt',
      name: 'XOR Encrypt - selected text to hex',
      editorCallback: (editor) => {
        const selected = editor.getSelection();
        if (!selected) {
          new Notice('Select text first.');
          return;
        }
        if (!isValidHexKey(this.settings.hexKey)) {
          new Notice('Set a valid hex key in plugin settings.');
          return;
        }
        try {
          const hex = textToXorHex(selected, this.settings.hexKey);
          editor.replaceSelection(hex);
          new Notice('Encrypted.');
        } catch (e) {
          new Notice('Error: ' + e.message);
        }
      },
    });

    this.addCommand({
      id: 'xor-decrypt',
      name: 'XOR Decrypt - hex to readable text',
      editorCallback: (editor) => {
        const selected = editor.getSelection();
        if (!selected) {
          new Notice('Select hex text first.');
          return;
        }
        if (!isValidHexKey(this.settings.hexKey)) {
          new Notice('Set a valid hex key in plugin settings.');
          return;
        }
        try {
          const plain = textFromXorHex(selected.trim(), this.settings.hexKey);
          editor.replaceSelection(plain);
          new Notice('Decrypted.');
        } catch (e) {
          new Notice('Error: ' + e.message);
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

  async setHexKey(hexKey) {
    this.settings.hexKey = hexKey;
    await this.saveSettings();
  }
}

module.exports = XorCipherPlugin;
