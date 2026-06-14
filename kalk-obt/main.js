const { Modal, Notice, Plugin, Setting } = require('obsidian');

const P_MOD = 251;
const A_PARAM = 0;
const G_POINT = [10, 76];
const ORDER_N = 252;
const IV8 = [0x6a, 0xbb, 0x3c, 0xa5, 0x51, 0x9b, 0x05, 0x1f];

function invMod(x, mod) {
  let value = ((x % mod) + mod) % mod;
  for (let i = 1; i < mod; i += 1) {
    if ((value * i) % mod === 1) return i;
  }
  return null;
}

function pointAdding(pointA, pointB, p = P_MOD, a = A_PARAM) {
  if (pointA === null) return pointB;
  if (pointB === null) return pointA;

  const [x1, y1] = pointA;
  const [x2, y2] = pointB;

  if (x1 === x2 && y1 !== y2) return null;
  if (x1 === x2) return pointDoubling(pointA, a, p);

  const num = (y2 - y1 + p) % p;
  const den = invMod(x2 - x1, p);
  if (den === null) return null;

  const slope = (num * den) % p;
  const x3 = (slope ** 2 - x1 - x2 + p * 2) % p;
  const y3 = (slope * (x1 - x3) - y1 + p * p) % p;
  return [x3, y3];
}

function pointDoubling(point, a = A_PARAM, p = P_MOD) {
  if (point === null) return null;

  const [x, y] = point;
  if (y === 0) return null;

  const num = (3 * x ** 2 + a) % p;
  const den = invMod(2 * y, p);
  if (den === null) return null;

  const slope = (num * den) % p;
  const x3 = (slope ** 2 - 2 * x + p * 2) % p;
  const y3 = (slope * (x - x3) - y + p * p) % p;
  return [x3, y3];
}

function scalarMult(k, point, a = A_PARAM, p = P_MOD, n = ORDER_N) {
  let result = null;
  let addend = point;
  let scalar = ((k % n) + n) % n;

  while (scalar > 0) {
    if (scalar & 1) result = pointAdding(result, addend, p, a);
    addend = pointDoubling(addend, a, p);
    scalar >>= 1;
  }

  return result;
}

function publicKeyFromPrivate(privateKeyText) {
  const privateKey = Number(privateKeyText);
  if (!Number.isInteger(privateKey)) {
    throw new Error('Enter an integer private key.');
  }

  return scalarMult(privateKey, G_POINT, A_PARAM, P_MOD, ORDER_N);
}

function rol8(x, r) {
  return ((x << r) | (x >> (8 - r))) & 0xff;
}

function ash24Bytes(bytes) {
  const data = Array.from(bytes);
  const originalLen = data.length;

  data.push(0x80);
  while ((data.length + 2) % 2 !== 0) {
    data.push(0x00);
  }
  data.push((originalLen >> 8) & 0xff, originalLen & 0xff);

  let A = IV8[0];
  let B = IV8[1];
  let C = IV8[2];

  for (let blockIndex = 0; blockIndex < data.length; blockIndex += 2) {
    const m0 = data[blockIndex];
    const m1 = data[blockIndex + 1];

    A ^= m0;
    B ^= m1;
    C ^= (m0 + m1) & 0xff;

    for (let i = 0; i < 16; i += 1) {
      A ^= IV8[(i + blockIndex) % IV8.length];
      B ^= rol8(C, 2);
      C ^= rol8(A, 3);
      A = (A + C) & 0xff;

      A ^= B;
      B ^= C;
      C ^= A;
      [A, B, C] = [B, C, A];
    }
  }

  return (A << 16) | (B << 8) | C;
}

function ash24Text(input) {
  return ash24Bytes(new TextEncoder().encode(input));
}

function formatPoint(point) {
  if (point === null) return 'Point at infinity';
  return `(${point[0]}, ${point[1]})`;
}

function formatPointHex(point) {
  if (point === null) return '-';
  return point.map((value) => value.toString(16).padStart(2, '0')).join('');
}

function formatPublicKey(point) {
  return [
    `point: ${formatPoint(point)}`,
    `hexa: ${formatPointHex(point)}`,
  ].join('\n');
}

function formatHash(hash) {
  return [
    `hex: 0x${hash.toString(16).padStart(6, '0')}`,
    `dec: ${hash}`,
    `bin: ${hash.toString(2).padStart(24, '0')}`,
  ].join('\n');
}

class KalkObtModal extends Modal {
  constructor(app) {
    super(app);
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
      const publicKey = publicKeyFromPrivate(this.privateKeyValue);
      this.publicKeyResultEl.setText(formatPublicKey(publicKey));
      new Notice('ESS251 public key calculated.');
    } catch (error) {
      this.publicKeyResultEl.setText(error.message);
      new Notice(error.message);
    }
  }

  calculateHash() {
    const hash = ash24Text(this.hashInputValue);
    this.hashResultEl.setText(formatHash(hash));
    new Notice('ASH24 hash calculated.');
  }

  onClose() {
    this.contentEl.empty();
  }
}

class KalkObtPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon('calculator', 'Open Kalk OBT', () => {
      new KalkObtModal(this.app).open();
    });

    this.addCommand({
      id: 'open-kalk-obt',
      name: 'Open calculator',
      callback: () => new KalkObtModal(this.app).open(),
    });
  }
}

module.exports = KalkObtPlugin;
