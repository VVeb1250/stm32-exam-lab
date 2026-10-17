# Verification evidence

Observed 18 October 2026, Asia/Tokyo. This report distinguishes automated behavior from educational or hardware validation.

## Local checks

- `npm test`: 12/12 unit and integration checks passed. Covers exact 70/12 counts and topic proportions, question/lesson relations, UART 0x41 frame and timings, ADC endpoint arithmetic, Timer +1 arithmetic, uint32 wrap, three debounce traces, self-assessed scoring, storage validation and static build/server behavior under the repository subpath.
- `npm run test:e2e`: 14/14 browser checks passed on Edge. Actually answered all 82 practice questions and completed a 70-question exam through UI controls. Checked withheld feedback, reason requirement, resumed drafts, self-assessment, wrong-answer review, retry, reset confirmation, denied/corrupt storage, search and keyboard control. See `test-results.json`.
- Responsive check: 18 lessons × 3 depths × 5 viewport widths (320/390/768/1280/1440), plus primary routes and nine labs. No body horizontal overflow in the checked states. Wide tables/code/waveforms use intentional internal scrolling.
- Eight axe audits in the full journey reported zero WCAG2A/AA and WCAG2.1AA violations. This is an automated sample, not full accessibility certification.
- No page or console runtime errors during the full journey.
- Scoped post-review diagram checks: four widths, four ADC word sizes (8/10/12/16 bits), PWM0/25/100%, three further axe audits. Passed. See `diagram-fix-tests.json`.
- Oxlint passed. Gitleaks working-tree scan reported no leaks. OSV scan of the lockfile reported no vulnerabilities. No production runtime dependencies.

## Visual and independent review

Inspected all supplied screenshots; compared the actual Wokwi documentation reference with the calm reading/navigation design and compared initial/final render screenshots. SparkFun returned Human Verification, which is not counted as a useful reference.

Initial checks found clipped mobile navigation, an escaped null terminator issue, long API/choice overflow at320px, misplaced Timer CCR label and a wrapped ADC binary word. Fixed and rechecked affected states. `mobile-comparison.png`, `desktop-comparison.png` and `reference-comparison.png` are inspectable comparisons, not pixel-fidelity scores.

One independent reviewer role was unavailable because its configured model was unsupported; a fresh replacement reviewer inspected screenshots and sampled code. The replacement requested the CCR/binary fixes and explicit method provenance. The verdict pass returned `ship` for those three resolved findings only, with no visible regression in that fix batch. It did not claim exhaustive content certification. The shipped Impeccable helper names were not registered; the actual host's independent review interface was used with the retained reviewer protocol. Design documentation was extracted locally from the actual artifact.

## Limits

- Not tested on an STM32 board. Labs model concepts, not cycle-accurate peripheral behavior.
- The course MCU/HAL version is unknown. Examples name F4 HAL1 v1.8.3 as a technical reference, not as an instructor-confirmed environment.
- No automatic correctness grading of written reasons. `/140` is explicitly learner self-assessment against rubrics.
- No participant usability/learning study or user aesthetic approval is claimed.
- No concept-seed, QUALITY BAR board, generated image comp or comp-diff was run. This was a code-led implementation under the user's concise-question constraint.
- Original chat lessons and questions were read from the browser after the connector's placeholder limitation; public content is a structured adaptation with added choices/rubrics, not a verbatim transcript or real exam paper.

GitHub Actions runs the full checks again before deploying. The live deployment is verified separately after its actual run completes.
