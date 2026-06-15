# Kalk OBT - Obsidian plugin

Kalk OBT is a small local Obsidian plugin for educational cryptographic calculations.

The plugin has two sections:

- `ess251` - calculates a public key from a private key.
- `ash24` - calculates a 24-bit hash from the provided input.

## Installation

Copy the whole `kalk-obt` folder into the plugin directory of the selected vault:

```text
<vault>/.obsidian/plugins/kalk-obt/
|-- manifest.json
|-- main.js
|-- core.js
|-- data.json
|-- setup.md
`-- kalk_obt.md
```

In Obsidian, open:

```text
Settings -> Community plugins
```

Disable safe mode if needed, refresh the plugin list, and enable `Kalk OBT`.

If the plugin does not appear immediately, restart Obsidian or run:

```text
Reload app without saving
```

## Usage

1. Open the command palette with `Ctrl+P`.
2. Run `Kalk OBT: Open calculator`.
3. In the `ess251` section, enter an integer private key and press `Calculate`.
4. In the `ash24` section, enter text input and press `Calculate`.

The plugin can also be opened with the calculator icon in the left Obsidian ribbon.

## Structure

`main.js` contains the Obsidian UI layer. `core.js` contains the reusable calculation and formatting functions used by the plugin.

## Settings

Settings are available at:

```text
Settings -> Community plugins -> Kalk OBT
```

The plugin stores values in `data.json`.

Default values:

```json
{
  "generator": [10, 76],
  "modulo": 251
}
```

Group order is not stored separately. It is calculated as `modulo + 1`.

Use the `ess251` preset button in settings to restore the default `generator` and `modulo` values.

## ess251

The `ess251` section calculates a public key on this toy elliptic curve:

```text
y^2 = x^3 + 7 mod 251
G = (10, 76)
ORDER_N = P_MOD + 1
```

The result is displayed as a point and as a hex value made from the `x` and `y` bytes:

```text
point: (x, y)
hex: xxyy
```

Some values can produce `Point at infinity`.

## ash24

The `ash24` section hashes the input as UTF-8 bytes. The result is displayed in three formats:

```text
hex: 0xaabbcc
dec: 11189196
bin: 101010101011101111001100
```

## Note

`ess251` and `ash24` are educational algorithms. They are not intended for real security or cryptographic use.
