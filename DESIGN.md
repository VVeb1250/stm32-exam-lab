---
name: STM32 Signal Lab
description: Thai learning notebook with interactive signal models
colors:
  signal-green: "#164b40"
  deep-green: "#11382f"
  signal-lime: "#d3f4a4"
  paper: "#f8f9f4"
  surface: "#ffffff"
  ink: "#18392f"
  muted: "#54665c"
  line: "#d9e0d5"
  focus: "#b65513"
typography:
  display:
    fontFamily: "LabThai, Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "clamp(2.25rem, 3.5vw, 3.45rem)"
    fontWeight: 700
    lineHeight: 1.36
    letterSpacing: "-0.035em"
  body:
    fontFamily: "LabThai, Noto Sans Thai, Tahoma, sans-serif"
    fontSize: "16px"
    lineHeight: 1.85
  code:
    fontFamily: "Consolas, Courier New, monospace"
    lineHeight: 1.75
rounded:
  control: "7px"
  lab: "12px"
spacing:
  small: "8px"
  medium: "20px"
  large: "40px"
components:
  button-primary:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "11px 19px"
---

# Design System: STM32 Signal Lab

## Overview

Agent-selected direction: a quiet Thai lab notebook. Reading occupies a calm light field; interactive signals occupy dark green surfaces. This records the implemented system, not an assertion of user visual approval.

## Colors

Signal green marks actions and active navigation. Lime represents visible signals and binary states on dark green. Paper, ink, muted text and fine rules carry the reading surface. Error text uses the CSS `--red` token; focus uses a distinct brown outline. The normative values are in the frontmatter and source CSS.

## Typography

Self-hosted Noto Sans Thai variable font is named LabThai. Thai/English body text shares one face. Code and numerical measurements use monospace. Body text is 16px with 1.85 line height, 15px on mobile; reading paragraphs use 2.1–2.15. The reading measure is at most 72ch. Long API names wrap when necessary; preformatted code scrolls horizontally.

## Layout

Desktop shell uses a 224px navigation rail and fluid main content; at 1200px the rail becomes 190px. The home introduction uses copy beside a working GPIO demo and stacks at 950px. At 680px the rail becomes visible wrapped top navigation. Lesson reading and a 210px contextual aside share a row, stacking below 950px. Sections use whitespace and rules, while questions and labs use bounded surfaces.

## Elevation & Depth

Mostly flat tonal layers and borders. The home demonstration alone uses a soft offset shadow `0 16px 42px -24px #17372f5c`. No imitation metal, glass or photographic textures.

## Shapes

Controls use 6–7px corners; labs use 12px; home demonstration uses 14px. Diagram geometry is functional SVG. Signal paths use a consistent 3px stroke and a lime sample cursor. Round shapes are limited to signal nodes, LED indication and sequential learning steps.

## Components

Primary controls have green fill and white text, at least 46–47px target height. Selected depth/navigation uses color and `aria-pressed`/`aria-current`. Radio choices retain native inputs; correct answers also carry a text label. Rubrics retain native checkboxes. Focus is a 3px outline with 4px offset.

Labs pair a dark output area with a light control area. Charts preserve textual readouts and accessible names. Wide timing diagrams and tables scroll within their region. Forms keep labels, invalid-input messages and draft persistence. Motion is limited to meaningful direct updates, with reduced-motion support.

## Do's and Don'ts

- Do keep technical labels adjacent to their signals and explain idealized models.
- Do keep learning, choice correctness and self-assessed reasoning separate.
- Do use native inputs and semantic headings before adding custom interaction.
- Do preserve the same reading system across depth levels.
- Don't present simulated results as measured hardware behavior.
- Don't use colors alone to distinguish exam correctness.

Known limits are in PRODUCT.md and the verification report. No unreadable or inaccessible state is canonized as a design rule.
