# XOR Cipher - Obsidian plugin

Port of `xor_key.py` from Agama Cipher to an Obsidian plugin.

## Installation

Copy the folder into the selected vault:

```text
<vault>/.obsidian/plugins/xor-cipher/
|-- manifest.json
|-- main.js
`-- data.json
```

In Obsidian, open:

```text
Settings -> Community plugins
```

Disable safe mode if needed, refresh the plugin list, and enable `XOR Cipher`.

If the plugin does not appear immediately, restart Obsidian or run:

```text
Reload app without saving
```

## Key Settings

Open:

```text
Settings -> Community plugins -> XOR Cipher
```

Enter a hex key, for example:

```text
0c1e24e5917779d297e14d45f14e1a1a
```

The key must contain an even number of hex characters.
After editing the key manually, press `Save` to store it.

You can also use one of the preset buttons:

- `Andreas` sets `0c1e24e5917779d297e14d45f14e1a1a`
- `Trezor` sets `752f85035563adff915ac0c3ae1252ed`

## Usage

1. Select text in the editor.
2. Run `XOR Encrypt` or `XOR Decrypt` from the command palette.

The selected text is replaced with the result.

## Python Compatibility

The output is byte-for-byte compatible with `xor_key.py`:

- padding to a multiple of the key length, with separator `/*` and a random tail,
- rotating XOR,
- decryption keeps only the part before `/*`.
