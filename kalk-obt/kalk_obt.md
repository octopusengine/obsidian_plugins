# Kalk OBT - Obsidian plugin

Kalk OBT je jednoduchy lokalni plugin do Obsidianu pro male edukacni kryptograficke vypocty z knihoven ve slozce `core`.

Plugin ma dve sekce:

- `ess251` - spocita verejny klic z privatniho klice.
- `ash24` - spocita 24bitovy hash ze zadaneho vstupu.

## Instalace

Zkopiruj celou slozku `kalk-obt` do adresare pluginu ve vybranem vaultu:

```text
<vault>/.obsidian/plugins/kalk-obt/
|-- manifest.json
|-- main.js
|-- kalk_obt.md
`-- core/
    |-- ash24.py
    |-- core.md
    `-- ess251.py
```

V Obsidianu potom otevri:

```text
Settings -> Community plugins
```

Vypni safe mode, pokud je potreba, obnov seznam pluginu a zapni plugin `Kalk OBT`.

Kdyz se plugin neobjevi hned, restartuj Obsidian nebo pouzij prikaz:

```text
Reload app without saving
```

## Pouzivani

1. Otevri command palette pres `Ctrl+P`.
2. Spust prikaz `Kalk OBT: Open calculator`.
3. V sekci `ess251` zadej celociselny privatni klic a stiskni `Calculate`.
4. V sekci `ash24` zadej textovy vstup a stiskni `Calculate`.

Plugin jde otevrit take ikonou kalkulacky v levem ribbon panelu Obsidianu.

## ess251

Sekce `ess251` pocita verejny klic podle hrackove elipticke krivky:

```text
y^2 = x^3 + 7 mod 251
G = (1, 192)
ORDER_N = 252
```

Vysledek se zobrazi jako bod a jako hex tvar slozeny z bajtu `x` a `y`:

```text
point: (x, y)
hexa: xxyy
```

Pri nekterych hodnotach muze byt vysledek `Point at infinity`.

## ash24

Sekce `ash24` pocita hash vstupu jako UTF-8 bajtu. Vysledek se zobrazuje ve trech formatech:

```text
hex: 0xaabbcc
dec: 11189196
bin: 101010101011101111001100
```

## Poznamka

`ess251` i `ash24` jsou edukacni algoritmy. Nejsou urcene pro realne bezpecnostni nebo kryptograficke pouziti.
