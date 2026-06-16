---
type: popis
tags:
  - test
  - plugin
  - obsidian
author: yenda
---

# JS Action

JS Action is a small Obsidian plugin that renders named actions from Markdown code blocks.

It is meant as a simple testbed for action-style blocks like:

````markdown
```js-action
get_key1()
```
````

The plugin reads the action name, finds it in an internal action registry, runs it, and prints the result into the rendered Markdown preview.

## Installation

Place the plugin folder in your vault:

```text
<vault>/.obsidian/plugins/js-action/
|-- manifest.json
|-- main.js
|-- styles.css
|-- data.json
|-- setup.md
`-- js_action.md
```

Then enable it in Obsidian:

```text
Settings -> Community plugins -> JS Action
```

If the plugin does not appear, refresh the plugin list or restart Obsidian.

## Settings

The plugin stores its settings in `data.json`.

Default settings:

```json
{
  "key1": "string123",
  "volume": 50
}
```

Available settings:

- `Key 1`: a test string returned by `get_key1()`
- `Volume`: a numeric slider from `0` to `100`, returned by `get_volume()`

You can edit both values in:

```text
Settings -> Community plugins -> JS Action
```

## Code Block Syntax

Use a fenced Markdown code block with the `js-action` language:

````markdown
```js-action
action_name
```
````

Function-style calls are supported too:

````markdown
```js-action
action_name()
```
````

The parser also accepts JSON-style parameters for future actions:

````markdown
```js-action
some_action("text", 123, true)
```
````

Parameters are parsed safely as JSON-style values. The plugin does not use `eval`.

## Available Test Actions

### get_key1()

Returns the current `Key 1` setting.

Example:

````markdown
```js-action
get_key1()
```
````

Output:

```text
string123
```

The short form also works:

````markdown
```js-action
get_key1
```
````

### get_volume()

Returns the current `Volume` slider value.

Example:

````markdown
```js-action
get_volume()
```
````

Output with the default setting:

```text
50
```

### get_version()

Returns the plugin version from `manifest.json`.

Example:

````markdown
```js-action
get_version()
```
````

Current output:

```text
0.1.0
```

### get_datetime()

Returns the current local date and time.

Example:

````markdown
```js-action
get_datetime()
```
````

Output format:

```text
DD.MM | hh:mm
```

Example output:

```text
16.06 | 11:45
```

## Adding New Actions

Actions are registered in `main.js` inside `createActions()`.

Example:

```js
createActions() {
  return {
    get_key1: () => this.settings.key1,
    get_volume: () => this.settings.volume,
    get_version: () => this.manifest.version,
    get_datetime: () => formatDateTime(new Date()),
  };
}
```

To add a new action, add another function to this object:

```js
my_action: (value) => `Received: ${value}`,
```

Then call it from Markdown:

````markdown
```js-action
my_action("hello")
```
````

## Notes

- Only registered actions can be executed.
- Action parameters must use JSON-style values, such as strings, numbers, booleans, arrays, objects, or `null`.
- The rendered output is shown in a `<pre><code>` block.
- Errors are rendered directly in the preview, which makes testing easier.
