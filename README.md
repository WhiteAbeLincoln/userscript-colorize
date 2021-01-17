# colorize

A userscript to annotate css colors in website text with their color value.

## Example

### Before
![Before Image](https://raw.githubusercontent.com/WhiteAbeLincoln/userscript-colorize/master/images/before.png)

### After
![Before Image](https://raw.githubusercontent.com/WhiteAbeLincoln/userscript-colorize/master/images/after.png)

## Installation

Install the `index.user.js` file found in a [release](https://github.com/WhiteAbeLincoln/userscript-colorize/releases) using
your favorite userscript extension (like Violentmonkey).

## Usage

From the browser console, call `window['aw-userscript-colorize']()`. You can add a keybinding to automate this using another extension such as Tridactyl,
or write a userscript to add a UI. Calling this function again will remove any color values.

You can style the colored boxes using the `.aw-userscript-colorize` css class.
