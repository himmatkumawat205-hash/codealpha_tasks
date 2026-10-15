# Sum — Everyday Calculator

## Run

Double-click index.html to open the source version in a modern browser. Keep its files together. No installation or build step is required.

The separate Calculator.html deliverable bundles the HTML, CSS, JavaScript, and favicon into one file. Double-click it to run.

## Features

- Addition, subtraction, multiplication, and division, with normal operator precedence.
- Result updates while you type; Enter or = completes the calculation.
- AC clears the calculation; Backspace deletes one character.
- Decimals, positive/negative toggle, percent, and clear division-by-zero feedback.
- Eight recent calculations, stored only in this browser when storage is available. Click a history result to reuse it.
- Responsive layout, visible keyboard focus, screen-reader labels, and reduced-motion support.
- Copy result and a keyboard shortcuts dialog.

## Keyboard

Numbers and decimal: 0–9 and .
Arithmetic: + - * /
Complete calculation: Enter or =
Clear: Escape or Delete
Delete one character: Backspace
Percent: %
Toggle sign: F9

## Behavior

Percent divides the current operand by 100. Example: 200 × 10 % = 20.
Typing a digit after = starts a new calculation. Typing an operator continues from the previous answer.
Consecutive operators replace the pending operator. Use +/− or F9 for a negative second operand.
Up to 15 digits can be entered per operand; displayed answers use up to 12 significant digits, or scientific notation for extreme values. This is a general-purpose JavaScript calculator, not arbitrary-precision arithmetic.

## Files

index.html — page structure and accessible controls
styles.css — colors, layout, responsive styling
calculator.js — arithmetic and calculator state, with no eval
app.js — mouse and keyboard input, display, history, clipboard
favicon.svg — calculator icon
test-calculator.cjs — 22 arithmetic and input checks; run with node test-calculator.cjs

The calculator works offline. Google Fonts are optional and fall back to system fonts when unavailable. Clipboard and persistent history depend on browser permissions; local-file restrictions do not stop calculations.

Validation: 22 automated engine checks passed. Browser checks covered live keyboard entry, operator precedence, Enter, division-by-zero recovery, history persistence and recall, shortcut help, and desktop/mobile layouts.
