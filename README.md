# Sable & Sky — private safari MVP

A luxury English safari concept for Kenya and Tanzania. Built with HTML, CSS and vanilla JavaScript. No build step, framework, client-side keys, account, or payment integration. All travel inventory, prices, conversation responses and enquiries are demonstrations.

## راهنمای فارسی راه‌اندازی

### ۱. فایل‌ها را آماده کنید
فایل ZIP را استخراج کنید. **محتویات پوشه safari** را در ریشه مخزن قرار دهید؛ فایل `index.html` باید مستقیماً در ریشه باشد، نه داخل پوشه اضافی. پوشه‌های `js` و `assets` و فایل `styles.css` را هم با همان ساختار نگه دارید.

### ۲. یک مخزن GitHub بسازید
برای صفحه اصلی شخصی، نام مخزن را دقیقاً `YOUR_USERNAME.github.io` بگذارید؛ به جای YOUR_USERNAME نام کاربری GitHub خود را بنویسید. اگر چنین مخزنی دارید و سایت دیگری در آن فعال است، آن را بازنویسی نکنید: یک مخزن عمومی جدید به نام `safari` بسازید تا سایت در مسیر جداگانه منتشر شود.

از **Add file → Upload files** فایل‌ها و پوشه‌ها را آپلود و **Commit changes** را بزنید. ZIP را به‌تنهایی آپلود نکنید؛ باید فایل‌های استخراج‌شده را آپلود کنید. فایل مخفی `.nojekyll` را نیز منتقل کنید؛ در صورت نیاز آن را با Add file بسازید.

### ۳. GitHub Pages را فعال کنید
در همان مخزن به **Settings → Pages** بروید. در **Build and deployment**، گزینه **Deploy from a branch** را انتخاب کنید؛ سپس شاخه `main` و پوشه `/(root)` را انتخاب و **Save** کنید.

آدرس سایت شخصی `https://YOUR_USERNAME.github.io/` و آدرس مخزن safari برابر `https://YOUR_USERNAME.github.io/safari/` خواهد بود. انتشار ممکن است چند دقیقه طول بکشد. وضعیت را در زبانه Actions یا صفحه Pages ببینید.

### ۴. نسخه نمایشی را امتحان کنید
یک پکیج انتخاب کنید و **Make this journey mine** را بزنید. در برنامه‌ریز تعداد روزها، تعداد مسافر و **بودجه هر نفر به دلار** را وارد کنید. با **Create my journey** برنامه بسازید و با **Download my trip brief** خلاصه آن را دانلود کنید. در چت مثلاً بنویسید: `10 days in Tanzania, budget $7,000 per person, 3 travelers`.

### ۵. قبل از استفاده تجاری
نام Sable & Sky موقت است. اطلاعات واقعی برند، راه تماس، سیاست حریم خصوصی و شرایط فروش را جایگزین کنید. قیمت‌ها و برنامه‌ها فرضی‌اند. فرم تماس چیزی ارسال نمی‌کند و چت به هوش مصنوعی واقعی وصل نیست. تا زمانی که سرویس واقعی پیاده نشده، نوشته‌های Demo را حذف نکنید. اتصال واقعی نیازمند یک سرویس امن در پشت سایت است؛ کلید API هرگز نباید در GitHub عمومی یا فایل‌های سایت قرار گیرد.

## Preview locally

ES modules require an HTTP server. Double-clicking index.html via file:// is not a supported preview.

With Python installed, open a terminal in this directory:

```sh
python -m http.server 8080
```

Open http://localhost:8080. No package installation is required. Node users may use their preferred static HTTP server. The optional tests require Node 20+; run `node --test tests/*.test.mjs`.

## Files

- `index.html`: English content, semantic sections, forms, accessible dialog.
- `styles.css`: responsive editorial design, typography, reduced-motion support.
- `js/data.js`: sample customer-facing catalog.
- `js/config.js`: public demo/API mode switch; no secrets.
- `js/adapters.js`: mock service, preference parsing, estimates and future HTTP adapter.
- `js/app.js`: rendering and UI events; service-independent presentation.
- `assets/mark.svg`: original placeholder brand mark.
- `tests/adapters.test.mjs`: core scenario and boundary checks.
- `.nojekyll`: static GitHub Pages publishing.

All internal paths are relative, supporting both personal sites and repository subpaths. No bundler, rewrite rules, or server rendering is needed.

## What works now

Package filters and accessible detail dialogs; package-to-planner handoff; destination selection; constrained trip form; rule-based conversational preference updates; multi-turn in-memory chat with ranked package cards shown directly in the conversation, match reasons and in-chat personalization; sample route and budget warnings; per-person and party estimates; downloadable UTF-8 text brief; enquiry preview; mobile menu; native FAQ disclosures. Chat supports common English day counts, numeric traveler counts, destinations, selected interests, and USD budgets. It is intentionally limited and does not understand arbitrary requests or negation. Edit the form to correct any interpretation. Unsupported questions are not answered as factual advice.

No chat or contact content is persisted. Refreshing clears it. The demo does not use analytics, cookies, localStorage, or a database. Google Fonts receives normal browser requests. No supplier identities are exposed in the UI or sample data.

## Integration architecture (recommended design, not deployed)

```text
GitHub Pages browser
  → HTTPS backend / serverless API under your control
    → orchestration and customer-safe data normalization
      → AI provider
      → allowlisted MCP tools on server-side MCP clients
      → contracted DMC inventory / quotation adapters
      → CRM / consented enquiry delivery
```

GitHub Pages cannot execute this backend. Deploy it separately using a serverless platform or an application server. Keep supplier and AI credentials in its secret manager. The customer sees only your brand. Provider identities, contracts, margins, raw inventory and internal IDs must stay server-side. Normalize responses into a public catalog and public itinerary schema. MCP is an orchestration connection on the backend, not a browser-held credential or a direct supplier connection.

### Adapter contract

The UI calls a single `travel` service. MockTravelAdapter and ApiTravelAdapter implement:

| Method / route | Request | Response |
| --- | --- | --- |
| `listPackages()` / GET `/v1/packages` | None | Array of public package objects (see data.js) |
| `sendMessage()` / POST `/v1/concierge/messages` | `{message, trip, history}` | `{reply: string, trip: Trip, matches: MatchedPackage[]}` |
| `createProposal()` / POST `/v1/proposals` | `{trip}` | `Proposal` |
| `submitEnquiry()` / POST `/v1/enquiries` | `{name, email, message, trip}` | `{demo, delivered, message}` |

`Trip`: `{destination, days, travelers, budget, style, interests}`. Budget is numeric USD **per person**. Days 3–30, travelers 1–12, budget 500–100000. Destination values: Kenya, Tanzania, Both countries. Styles and interests are defined in index.html. Send validated enums only.

`MatchedPackage`: public package fields from data.js plus `{score, reasons: string[], budgetFit: boolean}`. Match destination first, then rank sample duration, price and interests. Above-budget alternatives must be clearly labeled, never represented as confirmed fits. Production responses should supply server-ranked matches; the demo can fall back to local ranking. Image paths in public packages must be safe, approved HTTPS URLs or relative assets.

`Proposal`: `{id, title, trip, stops:[{label,place,detail}], estimate, total, warnings:[], demo}`. Estimate is per person; total is the party amount. Real quotes should extend this with currency, expiration, confirmed inclusions, availability status and supplier-independent public quote ID; update UI accordingly. Sample calculations are not real pricing. Inter-country transfers and island connections require human itinerary review.

### Secure backend implementation sequence

1. Implement these endpoints, independently validate all input and output schemas, limit body sizes/history, and return sanitized errors. Add request IDs and timeouts. The provided HTTP adapter has a 90-second timeout but is only a frontend scaffold, not a production backend.
2. Store all provider credentials in backend secret storage. Configure CORS for your exact Pages/custom domain (not `*`). CORS alone is not authentication. Apply per-client rate limits, abuse controls, quotas and spending limits. For authenticated use, add a deliberate short-lived session design; the scaffold uses `credentials: omit`.
3. Keep authoritative pricing and availability in supplier systems. Use server-side adapters to translate DMC formats into internal models, then strip supplier details before responding. Never rely on client estimates or model text as a confirmed offer.
4. Have the AI generate structured, schema-checked proposals through allowlisted read tools. Treat user messages, supplier descriptions and tool outputs as untrusted data. Prevent arbitrary URL fetching, secret disclosure and unrestricted MCP tool calls. Require explicit human/customer confirmation before booking, payment, cancellation or other side effects. Use idempotency keys on actual booking actions.
5. Send enquiries only after implementing real delivery, consent text, retention/deletion rules, access control and an appropriate privacy policy. Log minimal metadata; redact names, email and conversation text from routine logs. Do not claim delivery before receiving an acknowledged result.
6. Configure `config.js` with `mode: 'api'` and `apiBase: 'https://your-api.example'`. API base URLs are public; credentials are not. Perform response-contract and error-state tests. Replace demo labels only after the corresponding live behavior is verified. Current page copy remains demo-specific by design.
7. Before selling: confirm supplier agreements and legal disclosures, current travel guidance, lodging rights, cancellation terms, insurance responsibilities and a hosted payment flow. Never collect card details in this static demo.

## Visual assets and customization

Three optimized WebP images are bundled in assets: elephants.webp, lion.webp and coast.webp. They were created with the built-in image generation tool for this concept; they are not documentary photographs of actual destinations, sightings or accommodation. Image-generation prompts are recorded in assets/IMAGE-NOTES.md. Replace them with verified licensed location photography when presenting a real commercial itinerary.

Font families Italiana and DM Sans load from Google Fonts; local serif/sans fallbacks work if blocked. All site imagery is local and does not need third-party image servers. No external image files or tracking pixels are requested.

Customize colors in `:root` of styles.css; replace the brand throughout index.html, app.js and this README; edit packages in data.js. The layout is responsive and tested at desktop and mobile sizes. Interactive copy is rendered with textContent rather than unsanitized HTML.

## Deployment references

- [GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart)
- [Configure the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Production scope

This is a complete runnable frontend MVP, not a booking service. No live AI, live prices, accommodation inventory, supplier connection, email delivery, payments, authentication or production legal documents are included. Nothing has been published to your GitHub account automatically.


## n8n / SafariPicked integration template

The supplied Telegram automation has been adapted to a website Webhook → AI Agent + model + memory + MCP → JSON response workflow. Import template, exact connection steps and Persian guidance: [integrations/n8n/README-FA.md](integrations/n8n/README-FA.md). Default mode remains mock; no webhook or MCP connection has been activated. In optional n8n mode, original returned package terms and currency/basis are preserved in chat cards, and no mock package fallback is used for live chat. The secure gateway is specified, not deployed.

