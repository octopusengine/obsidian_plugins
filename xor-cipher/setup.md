# XOR Cipher — Obsidian plugin

Port `xor_key.py` (Agama Cipher) do Obsidian pluginu.

## Instalace

Zkopíruj složku do vaultu:

```
<vault>/.obsidian/plugins/xor-cipher/
├── manifest.json
└── main.js
```

V Obsidianu: `Nastavení → Komunita pluginy → Vypnout bezpečný režim`

Restartovat vault nebo `Ctrl+P → Reload app without saving`.

## Nastavení klíče

`Nastavení → XOR Cipher` — vlož hex klíč, např.:

```
0c1e24e5917779d297e14d45f14e1a1a
```

## Použití

1. Označ text v editoru
2. `Ctrl+P` → `XOR Encrypt` nebo `XOR Decrypt`

Výsledek nahradí označený text přímo v editoru.

## Kompatibilita s Pythonem

Výstup je byte-pro-byte kompatibilní s `xor_key.py`:

- padding na násobek délky klíče, separator `/*`, náhodný ocas
- rotující XOR
- při dešifrování se bere jen část před `/*`
