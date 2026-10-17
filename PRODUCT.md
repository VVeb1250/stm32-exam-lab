# STM32 Signal Lab

Thai self-study experience for EN813202, from first encounter with a microcontroller to exam practice. Technical terms stay in English. The user's request authorizes building, pushing and publishing GitHub Pages under their VVeb1250 account; repository naming is delegated. The read-only Z80 project files outside this folder are a separate platform.

## Learning contract

- `#learn` is one continuous reading document with three depth zones: foundations, exam-ready mechanisms, and advanced extras. Zone and chapter links scroll to their positions. Reading is never gated by tabs or quizzes.
- Full assistant-authored teaching content is copied from four authorized conversation messages in `src/chat-content.js`: 505 / 165 / 340 lesson blocks and 586 practice-source blocks. Rendering removes duplicate message titles and chat controls. The teaching snapshot retains tables, MathML, code, 25 Intelligent UI SVG diagrams and seven Mermaid flow diagrams. `src/reading.js` owns the presentation and question boundaries.
- `#practice` lists all 82 original open-response prompts with native answer disclosures. No selection, written reason or previous/next action is required to read an explanation. Optional topic filters and question jump links preserve navigation. The seven Mermaid diagrams include one within an answer.
- `#exam` remains an optional, separate 70-question MCQ simulation with authored choices and self-assessment rubrics. It requires a choice and a reason for every item before submission, and does not claim automatic grading of reasoning.
- Nine concept labs remain available, with relevant experiments embedded as optional disclosures in the reading. They are deterministic educational models, not hardware emulation. The source PWM slider has a local native implementation.
- Existing lesson deep links jump into full source headings. Reading marks, explanation views and optional exam answers persist in localStorage. Storage denial is visible; reset requires confirmation. Source technical qualifications are shown in the reading and on `#sources`.

## Source boundary

The referenced ChatGPT conversation was successfully read through the signed-in browser DOM after the thread connector returned placeholders. Six attachment images were inspected. Instructor announcements ground the blueprint; the original model-written questions remain generated practice. Image files, personal portraits, screenshots of the actual exam and unrelated Z80 documents are not published.

MCU model and course HAL version are not confirmed. Technical snippets use ST's F4 HAL1 v1.8.3 as a named reference, with configuration and version limitations shown in the product. No claim of testing on a physical board.

## Direction contract (agent-selected from the user's brief)

THESIS: Read the complete explanation continuously, inspect the signal when helpful, and reveal reasoning at your own pace.

OWN-WORLD: A quiet Thai lab notebook with a green signal surface. Paper #f8f9f4, ink #18392f, signal green #164b40 and lime #d3f4a4. Noto Sans Thai for reading, monospace only for code and measurements. SVGs are native diagrams, not imitation photographs.

STORY: Button and LED first, bits and timing next, conversion and system scheduling after that. The main path has progressively richer mechanisms; deep details are optional.

FIRST VIEWPORT: Identify the course and next action while showing a live PC13-to-PA5 logic model. On narrow screens the introduction is shorter and all primary navigation remains visible.

FORM: Code-led interactive course. No approved raster comp or claim of pixel reproduction. The user requested concise ambiguity handling and delegated routine implementation, so the local prototype proceeds without a separate taste interview or image-comp workshop.

Method disclosure: the Impeccable concept-seed, QUALITY BAR board and decision-comp mechanisms were not run. The implementation uses Whip's local code-led prototype and direct rendered comparison, under the user's explicit constraint to keep ambiguity questions to necessary account/repo/deploy decisions. No generated seed/card, user visual approval, or comp fidelity is claimed.

## Visual references and comparison

Inspected the real Wokwi Diagram Editor documentation screenshot (`evidence/reference-wokwi.png`): keep persistent topic navigation, a calm reading column and explicit technical labels. Adapt by putting the working signal demo beside the first explanation and by offering depth-zone jump links. The course is not a reproduction of Wokwi. The latest reading revision uses the actual source conversation as its primary content and layout reference, with continuous prose and inline diagrams.

SparkFun Serial Communication returned a Human Verification page, so that screenshot is not used as visual evidence. Its blocked state is retained in `evidence/reference-capture.json`. A reference is not evidence of learning effectiveness.

Compared initial desktop/mobile captures with the implemented course. Mobile's horizontally clipped menu was replaced by visible wrapped navigation, introductory copy was shortened to reach the lab sooner, and long API names were allowed to wrap at 320px. Before/final comparison is recorded in the evidence folder. No participant study or owner aesthetic approval is claimed.

## Acceptance evidence

`npm test`: data contracts, calculation/trace units and build/server integration. `npm run test:e2e`: actual browser journeys including all questions, the 70-question exam, persistence/reset, labs, search, keyboard control, responsive widths and axe checks. `evidence/test-results.json` records the observed run. Build output contains only static runtime assets, uses relative URLs and hash routes, and is exercised under `/stm32-exam-lab/`.

## Reading revision visual review

The user explicitly rejected the earlier card-by-card learning/practice flow. Compared the live before state with continuous reading (`evidence/reading-comparison.png`, `evidence/practice-comparison.png`) and a content-only capture of the original UART question (`evidence/reference-chat-question.png`). Source geometry and teaching text are retained; colors and sizing are adapted to the light reading surface. Inspected the diagram contact sheet and individual renders. Corrected clipped mobile SVG sizing, missing ADC gradient definitions, code chrome, source colors below contrast requirements, and preserved the original flow diagrams with local styling. No claim of user approval or participant validation.
