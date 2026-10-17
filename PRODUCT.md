# STM32 Signal Lab

Thai self-study experience for EN813202, from first encounter with a microcontroller to exam practice. Technical terms stay in English. The user's request authorizes building, pushing and publishing GitHub Pages under their VVeb1250 account; repository naming is delegated. The read-only Z80 project files outside this folder are a separate platform.

## Learning contract

- Eighteen connected lessons, each with basic, exam-ready and deep reading. The learner can choose more depth or move to the next chapter. Reading marks and selected depth persist independently.
- Nine concept labs: GPIO active-low, bits, three debounce algorithms, UART 8N1 LSB-first, ADC conversion, sampling timing, Timer/PWM, system bandwidth and code tracing. These are deterministic educational models, not firmware/hardware emulation.
- The original conversation's 70 main questions retain numbering and topic order, with 12 advanced extras. Web choices and self-assessment rubrics are authored additions. Sources and qualifications live in `src/sources.js`.
- Attempt a choice and write a reason before practice feedback. In exam mode, withhold feedback until all 70 responses have both parts. Choice correctness and self-assessed reasoning points remain separate. The site does not claim automatic grading of free-text reasoning.
- Search lessons and question concepts. Resume on this browser with localStorage; show a visible warning if storage is denied. Reset requires an inline confirmation.

## Source boundary

The referenced ChatGPT conversation was successfully read through the signed-in browser DOM after the thread connector returned placeholders. Six attachment images were inspected. Instructor announcements ground the blueprint; the original model-written questions remain generated practice. Image files, personal portraits, screenshots of the actual exam and unrelated Z80 documents are not published.

MCU model and course HAL version are not confirmed. Technical snippets use ST's F4 HAL1 v1.8.3 as a named reference, with configuration and version limitations shown in the product. No claim of testing on a physical board.

## Direction contract (agent-selected from the user's brief)

THESIS: Learn by moving a signal and explaining the result, then test the explanation.

OWN-WORLD: A quiet Thai lab notebook with a green signal surface. Paper #f8f9f4, ink #18392f, signal green #164b40 and lime #d3f4a4. Noto Sans Thai for reading, monospace only for code and measurements. SVGs are native diagrams, not imitation photographs.

STORY: Button and LED first, bits and timing next, conversion and system scheduling after that. The main path has progressively richer mechanisms; deep details are optional.

FIRST VIEWPORT: Identify the course and next action while showing a live PC13-to-PA5 logic model. On narrow screens the introduction is shorter and all primary navigation remains visible.

FORM: Code-led interactive course. No approved raster comp or claim of pixel reproduction. The user requested concise ambiguity handling and delegated routine implementation, so the local prototype proceeds without a separate taste interview or image-comp workshop.

Method disclosure: the Impeccable concept-seed, QUALITY BAR board and decision-comp mechanisms were not run. The implementation uses Whip's local code-led prototype and direct rendered comparison, under the user's explicit constraint to keep ambiguity questions to necessary account/repo/deploy decisions. No generated seed/card, user visual approval, or comp fidelity is claimed.

## Visual references and comparison

Inspected the real Wokwi Diagram Editor documentation screenshot (`evidence/reference-wokwi.png`): keep persistent topic navigation, a calm reading column and explicit technical labels. Adapt by putting the working signal demo beside the first explanation and by offering depth controls. The course is not a reproduction of Wokwi.

SparkFun Serial Communication returned a Human Verification page, so that screenshot is not used as visual evidence. Its blocked state is retained in `evidence/reference-capture.json`. A reference is not evidence of learning effectiveness.

Compared initial desktop/mobile captures with the implemented course. Mobile's horizontally clipped menu was replaced by visible wrapped navigation, introductory copy was shortened to reach the lab sooner, and long API names were allowed to wrap at 320px. Before/final comparison is recorded in the evidence folder. No participant study or owner aesthetic approval is claimed.

## Acceptance evidence

`npm test`: data contracts, calculation/trace units and build/server integration. `npm run test:e2e`: actual browser journeys including all questions, the 70-question exam, persistence/reset, labs, search, keyboard control, responsive widths and axe checks. `evidence/test-results.json` records the observed run. Build output contains only static runtime assets, uses relative URLs and hash routes, and is exercised under `/stm32-exam-lab/`.
