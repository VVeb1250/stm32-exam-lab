# Verification evidence

Observed 18 October 2026, Asia/Tokyo. Latest scope: replace the earlier lesson/practice interaction with continuous conversation-style reading.

## Current checks

- `npm test`: 15/15 unit and integration checks passed. Includes source-message block counts, all original 82 question boundaries/explanations, 25 Intelligent UI SVGs plus seven Mermaid flows, preserved ADC gradient definitions, unsafe markup checks, all existing lesson deep links, calculation/trace units and static subpath build/server integration.
- `npm run lint`: passed.
- `npm run test:e2e`: 13/13 browser checks passed on Edge, with nine axe audits reporting zero checked WCAG2A/AA and WCAG2.1AA violations and zero console/page runtime errors. Full raw results: `test-results.json`.
- Actually opened and closed all 82 explanations from the continuous list without entering any answer. Verified topic filtering, cross-topic question jumps, keyboard disclosure activation, explanation-view persistence, reading marks after reload, all three zones present, native source PWM control, and optional experiment behavior.
- Completed the separate 70-question exam through its controls, including incomplete submission prevention, resumed answers, submitted scores and learner-assessed reasoning. Existing local data remains readable.
- Checked continuous lessons, practice with every answer open, optional exam and nine labs at widths 320/390/768/1280/1440. No body horizontal overflow in tested states. UART source bit words remain in one horizontal sequence at every width, with internal scrolling where needed.
- Gitleaks scan of changed runtime source: no leaks (`reading-gitleaks.json`). Lockfile and dependencies are unchanged from the prior verified deployment; no new dependency-vulnerability scan is claimed for this revision. No production runtime dependencies.

## Visual evidence and corrections

Compared the previous live catalogue and one-question card with the implemented continuous pages. `reading-comparison.png` and `practice-comparison.png` show before/after captures. `reference-chat-question.png` contains only the authorized teaching section of the original conversation, with sidebar/account content cropped out.

Retained source teaching prose, tables, MathML, code, 25 Intelligent UI SVGs and seven original Mermaid flows. Inspected diagram renders and the contact sheet, plus desktop/mobile reading and expanded answers. Corrected oversized/clipped mobile SVGs, source colors below contrast requirements, missing SVG gradient definitions, removed chat/code chrome and restored flow labels/arrows through scoped local styling. Kept UART bit sequence horizontal rather than wrapping it into a misleading multi-row arrangement.

Earlier independent review concerned the previous deployment; it is not presented as an independent review of this revision. This revision was checked directly through source inspection, automated journeys and rendered screenshots using the existing WhipUI/Combo workflow.

## Limits

No STM32 board test, cycle-accurate simulation, participant learning study or user aesthetic approval is claimed. The course MCU/HAL version remains unconfirmed. F4 HAL1 v1.8.3 is the named technical reference, not a confirmed classroom environment. The original questions are generated practice. Optional exam reasoning points are self-assessed, not automatic text grading.

GitHub Actions reruns the required checks before deployment. The actual successful run and public-site smoke evidence are reported after deployment.
