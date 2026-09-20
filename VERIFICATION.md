# Verification

Verified on 2026-09-21 using Microsoft Edge through Playwright and Node's built-in test runner.

- 9 unit/scenario checks passed: chat preference extraction; budget semantics; complete day coverage from 3–30 days; budget and routing warnings; solo pricing; invalid inputs; non-delivery of demo enquiries; destination/beach package matching; explicit over-budget alternatives.
- Browser checks passed: package filtering and dialog, package-to-planner handoff, chat preference changes, proposal creation, brief download, demo enquiry status, inline ranked package cards and match reasons, in-chat tailoring, beach itinerary, dialog dismissal with Escape, clearing stale results after edits, conversation reset.
- All six displayed image elements successfully decoded after scrolling into view (three reusable bundled assets).
- No horizontal overflow at 320, 390, 768, and 1440 pixels in the checked page states. Desktop and mobile previews inspected visually.
- No JavaScript runtime errors in the exercised end-to-end flows.

Not performed: live service integration, real supplier pricing validation, payment/email delivery, exhaustive screen-reader audit, Safari/iOS testing, or actual GitHub publication. These are outside this static demo's connected capabilities.

## n8n integration update

- 13 total Node checks pass, including public response allowlisting, original currency/price basis preservation, empty-result handling, rejection of malformed responses, template JSON parsing, no copied Telegram credentials, and execution of request/response Code-node logic using local fixtures.
- Added a disabled, uncredentialed n8n import template and a Persian setup guide based on the supplied automation. No n8n instance or SafariPicked MCP endpoint was contacted, imported into, or changed.
- Full n8n import compatibility and provider/tool schema correctness still require verification on the user's instance. The gateway is an implementation contract, not deployed infrastructure. Structural validation does not guarantee model output matches authoritative supplier records.
- Browser fixture checks passed in n8n mode: exact EUR group-price display, original package details, discussion without creating a mock proposal, no fictional fallback for empty results, session rotation on reset, and form-to-connected-search routing. All gateway responses were intercepted local fixtures; no external calls were made. Default mock-mode conversational flow also passed after the update.
