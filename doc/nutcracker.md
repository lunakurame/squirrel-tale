# Nutcracker script interpreter

## Description

Nutcracker is an interpreter for the scripts used to animate entities, script
NPCs and interactions with other objects.

## Example

```json
[
	"log Hello world!",
	"nop",
	"set view master 0",
	"let nextFrame 1",
	"nop 500",
	"set frame $nextFrame",
	"nop 200",
	"set view loopy",
	"",
	"# this is a comment",
	"lbl loop",
	"set frame 2",
	"nop 100",
	"set frame 3",
	"nop 100",
	"jmp loop"
]
```

## Specification

Nutcracker reads the script line by line from an array of strings, each line is
an element of the array.

### Ignored lines:

- empty lines,
- lines containing only whitespace,
- lines starting with `#`,
- lines starting with any number of whitespace characters followed by `#`.

Whitespace is whatever your JavaScript interpreter thinks it is. If in doubt,
check the documentation of `String.prototype.trim()`. Ignored lines still count
for line numbering (eg. when you jump to a specified line number). During script
execution, Nutcracker just immediately jumps to the next line if the current
line matches any of the rules for ignored lines.

### Instructions:

- `dlg PARAM1 PARAM2 PARAM3 PARAM4`  
`PARAM1` - dialogue object name.  
`PARAM2` - dialogue object's item index OR action.  
`PARAM3` - configuration parameter.  
`PARAM4` - parameter.  
`PARAM5` - parameter.  
If `PARAM2` equals `show`, it shows a dialogue with all defined configuration
parameters. Note that `show` is synchronous on the nut thread, so it will wait
for player interaction and jump to the next instruction when the dialogue
disappears from the screen. Other `dlg` instructions jump to the next one
immediately. If the dialogue is being replaced by another nut (eg. when
triggering a choice option), it will not jump to the parent dialogue's next
instruction.
`PARAM1`, `PARAM3` and `PARAM4` might be variable names.  
Configuration parameters:
	- `text`  
	  Adds text `PARAM4` to the dialogue object.
	- `choice`  
	  Adds a choice option to the dialogue object. The displayed text is
	  `PARAM5` and it jumps to the nut named `PARAM4` when the user selects
	  that option. Note that the target nut must be of type "choice".
- `lbl PARAM1`  
Sets a label named `PARAM1`, then jumps to the next instruction.
- `let PARAM1 PARAM2`  
If `PARAM1` is not defined, throws warning to the console.
Otherwise defines a variable, which is visible in the scope of the currently
executed script. There are three variable types: `string`, `number`, `null`.
The type is determined automatically. `PARAM1` is the variable name, `PARAM2` is
the variable value. To define a null variable, omit `PARAM2`.
At the end, always jumps to the next instruction.
- `log PARAM1`  
Logs `PARAM1` to the JavaScript console, then jumps to the next instruction.
`PARAM1` might be a variable name.
- `jmp PARAM1`  
If `PARAM1` is not defined, throws warning to the JavaScript console.
If `PARAM1` is numeric, jumps to the line `PARAM1` of the script.
Otherwise, tries to find the first occurence of label `PARAM1` in the script. If
found, jumps to that line, if not, throws a warning.
`PARAM1` might be a variable name.
- `map PARAM1 PARAM2`  
If `PARAM1` is not defined, throws a warning. Otherwise, loads map named
`PARAM1`, variant `PARAM2`. Always jumps to the next instruction.
`PARAM1` and `PARAM2` might be variable names.
- `nop PARAM1`  
If `PARAM1` is not defined or is not numeric, jumps to the next instruction.
Otherwise, waits for `PARAM1` milliseconds, then jumps to the next instruction.
`PARAM1` might be a variable name.
- `nut PARAM1`  
If `PARAM1` is not defined or doesn't point to an existing nut (another script
in the same JSON file), throws a warning. Otherwise jumps to the nut named
`PARAM1`. Doesn't jump to the next instruction of the parent nut.
`PARAM1` might be a variable name.
- `ret`  
Exit the script.
- `set PARAM1 PARAM2 PARAM3`  
If `PARAM1` is not defined, throws a warning, then jumps to the next
instruction.
If `PARAM1` equals `view`, sets view `PARAM2` and frame `PARAM3`.
If `PARAM1` equals `frame`, sets frame `PARAM2`.
If `PARAM2` or `PARAM3` is not defined, the currently set view or frame will be
reloaded. If not set, the defaults will be loaded (view `master`, frame `0`). At
the end, always jumps to the next instruction.
`PARAM1`, `PARAM2` and `PARAM3` might be variable names.
- Any other instructions throw a warning to the console and jump to the next
instruction.
