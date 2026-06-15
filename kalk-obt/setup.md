# Kalk OBT - settings

The plugin stores settings in `data.json`, like other Obsidian plugins.

## Default values

```json
{
  "generator": [10, 76],
  "modulo": 251
}
```

`ORDER_N` is not persisted separately. It is calculated as `modulo + 1`.

## Change settings in Obsidian

Open:

```text
Settings -> Community plugins -> Kalk OBT
```

The settings tab allows changing:

- `ess251` - restores the default ESS251 parameters.
- `Generator G` - generator point coordinates as `x` and `y`.
- `Modulo` - finite field modulo.
