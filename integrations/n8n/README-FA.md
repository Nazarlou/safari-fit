# اتصال سایت به اتومیشن n8n شما

این الگو از شماتیک ارسالی شما ساخته شده است. **اتصال زنده انجام نشده** و نسخهٔ قابل‌نمایش سایت همچنان در حالت mock است. فایل JSON از نظر ساختار و کد بررسی شده، اما داخل نسخهٔ n8n شما import یا اجرا نشده است.

## مسیر پیشنهادی

```text
Website chat (GitHub Pages)
    → Your HTTPS gateway / serverless backend
    → Authenticated n8n Website Webhook
    → Validate Website Request
    → AI Agent ↔ OpenAI Chat Model
               ↔ Simple Memory (separate session per visitor)
               ↔ SafariPicked MCP (read-only tools)
    → Normalize Public Response
    → Respond to Website
    → Reply + package cards in the same website chat
```

## چه چیزی نسبت به تلگرام تغییر کرده؟

| قبلی | نسخهٔ سایت |
|---|---|
| Telegram Trigger | POST Webhook |
| `message.text` | `body.message` |
| Telegram user ID | session معتبر و مستقل هر بازدیدکننده |
| Send a text message | Respond to Webhook با JSON |
| خروجی صرفاً فارسی و متنی | متن انگلیسی + فهرست پکیج برای کارت‌ها |
| کلید اتصال تلگرام | احراز هویت سرور سایت به وب‌هوک |

آدرس MCP داخل فایل شما به‌شکل لینک Markdown بود. مقدار واقعی endpoint باید این رشتهٔ ساده باشد:

`https://safaris-mcp.pierretokns.workers.dev/mcp`

این آدرس **وب‌هوک سایت نیست**؛ فقط داخل نود MCP استفاده می‌شود. هیچ درخواست شبکه‌ای برای کشف ابزارهای این endpoint ارسال نشده است. بک‌اسلش‌هایی مثل `ai\_tool` و `\_\_rl` در متن کپی‌شده نیز JSON استاندارد نیستند؛ فایل الگو نام‌های صحیح `ai_tool` و `__rl` دارد. شناسهٔ instance و credentialهای تلگرام شما به فایل جدید منتقل نشده‌اند.

## فایل‌ها

- `website-concierge.template.json`: الگوی workflow برای Import از فایل.
- `AGENT-PROMPT.txt`: دستور ایجنت با حفظ قیمت، واحد پول، برنامه و شرایط اصلی پکیج‌ها؛ عدم نمایش هویت تامین‌کننده؛ پاسخ انگلیسی.
- `../../js/response-contract.js`: قرارداد خروجی عمومی و کنترل ساختار، مشترک با نود پاسخ.
- `../../js/config.js`: انتخاب mock یا n8n؛ فقط تنظیمات عمومی، بدون کلید.

## مراحل تنظیم در n8n

۱. فایل template را در n8n وارد کنید. فعال‌سازی خودکار ندارد. نسخه‌های AI/MCP/Memory از فایل شما حفظ شده‌اند؛ اگر نسخهٔ نصب‌شده نودی را نشناخت آن را با نود متناظر همان نسخه جایگزین کنید.

۲. در Website Webhook یک **Header Auth credential** تعریف کنید، مثلاً نام هدر `X-Safari-Gateway-Token`. مقدار آن فقط در secret storage بک‌اند و credentials خود n8n قرار می‌گیرد. آن را داخل فایل سایت، README، مخزن یا چت قرار ندهید.

۳. credential مدل OpenAI را انتخاب کنید. `gpt-5-mini` همان انتخاب فایل شماست؛ دسترسی واقعی آن را در حساب خود بررسی کنید.

۴. نود SafariPicked MCP در الگو غیرفعال است. ابتدا authentication و transport موردنیاز سرور را تنظیم کنید، ابزارهای واقعی را ببینید و فقط ابزارهای **جست‌وجو و مشاهدهٔ جزئیات** را مجاز کنید؛ سپس نود را فعال کنید. نام و schema ابزارها از فایل شما مشخص نیست، بنابراین ابزار ساختگی تعریف نشده است.

۵. یک خروجی واقعی و بدون اطلاعات حساس از جست‌وجوی MCP بگیرید و نگاشت فیلدها را بررسی کنید. مبلغ، currency، مبنای قیمت (نفری/کل گروه)، itinerary، inclusions، exclusions و شروط باید از همان منبع حفظ شوند. مدل نباید دادهٔ تجاری تولید کند. نود Normalizer صرفاً ساختار را کنترل می‌کند؛ **صحت عدد یا منبع را اثبات نمی‌کند**. قبل از استفادهٔ تجاری، پیشنهاد مدل را به شناسه‌های رکوردهای معتبر محدود کنید و جزئیات کارت را در یک mapper قطعی از همان رکوردها بسازید. نام و لینک تامین‌کننده را در mapper حذف یا طبق برند عمومی تبدیل کنید؛ به prompt برای محرمانگی کامل تکیه نکنید.

۶. ابتدا با Test URL و Listen for test event بررسی کنید. سپس workflow را منتشر کنید و Production URL را در secret/config بک‌اند قرار دهید. آدرس خصوصی وب‌هوک یا هدر آن به مرورگر داده نمی‌شود.

۷. Simple Memory فعلی برای تست است. در استقرار production/queue آن را با حافظهٔ اشتراکی مناسب و retention مشخص جایگزین کنید. contextWindowLength الگو ۶ است. session سایت باید توسط gateway به هویت session معتبر گره بخورد؛ UUID مرورگر به‌تنهایی احراز هویت نیست. Start over شناسهٔ مرورگر را عوض می‌کند، اما دادهٔ ذخیره‌شده در سرور را حذف نمی‌کند؛ حذف/انقضا را جداگانه پیاده کنید.

## قرارداد gateway که باید جداگانه مستقر شود

در این تحویل gateway اجرایی یا زیرساخت cloud مستقر نشده است. بک‌اند شما باید:

- `POST /v1/concierge/messages` را دریافت کند؛ body حداکثر 16KB، message حداکثر 1500 کاراکتر.
- session امضاشده/احراز‌شدهٔ خودش را اعتبارسنجی کند و شناسهٔ browser را به session داخلی متصل کند؛ اجازهٔ انتخاب session متعلق به کاربر دیگر را ندهد.
- محدودیت نرخ، هزینه و هم‌زمانی داشته باشد؛ CORS فقط origin واقعی سایت را مجاز کند. CORS به‌تنهایی کنترل دسترسی نیست.
- فقط به Production Webhook ثابت n8n با هدر secret سروری درخواست بفرستد؛ URL مقصد از ورودی کاربر گرفته نشود.
- body ارسالی به n8n شامل `{message, trip, sessionId}` باشد. history مرورگر را برای حافظهٔ معتبر نپذیرد؛ حافظه در n8n نگه‌داری می‌شود.
- در موفقیت فقط قرارداد JSON عمومی پایین را برگرداند. خطاهای داخلی، stack trace، کلیدها و raw tool outputs را عبور ندهد؛ برای خطا/timeout پاسخ غیر 2xx و پیام عمومی بدهد.
- timeout و هزینهٔ مدل را کنترل کند. frontend حداکثر ۹۰ ثانیه منتظر می‌ماند؛ یک فراخوانی MCP در الگو ۶۰ ثانیه محدودیت دارد و چند فراخوانی ممکن است طولانی‌تر شوند. برای زمان‌های طولانی‌تر، job polling یا streaming را جداگانه پیاده کنید. پس از timeout خودکار retry نمی‌کنیم تا هزینه تکرار نشود.
- دسترسی به logs و داده‌های مکالمه و دورهٔ نگه‌داری را محدود کند؛ پیش از فعال‌سازی عمومی، متن حریم خصوصی واقعی سایت را تکمیل کنید.

### درخواست

```json
{
  "message": "We want 9 days in Tanzania, around $7000 per person.",
  "sessionId": "gateway-authenticated-session-id",
  "trip": {"destination":"Tanzania","days":9,"travelers":2,"budget":7000,"style":"Quiet luxury","interests":["Wildlife"]}
}
```

### پاسخ

```json
{
  "reply": "Here are the options returned for your preferences. Final availability requires confirmation.",
  "trip": {"destination":"Tanzania","days":9,"travelers":2,"budget":7000,"style":"Quiet luxury","interests":["Wildlife"]},
  "matches": []
}
```

آرایهٔ خالی یعنی پکیج معتبری پیدا نشده است؛ سایت در حالت متصل پکیج فرضی جایگزین نمی‌کند. شکل هر عضو matches در AGENT-PROMPT.txt مشخص است. `priceLabel` متن کامل قیمت منبع را حفظ می‌کند تا مبلغ گروهی یا ارز دیگر اشتباهاً «USD / person» نمایش داده نشود. کارت متصل دکمهٔ **Discuss this package** دارد؛ درخواست تغییر صرفاً به گفت‌وگو برمی‌گردد و جزئیات اصلی را تغییر نمی‌دهد.

## فعال‌سازی سمت سایت — بعد از تکمیل بک‌اند

در `js/config.js`:

```js
export const config = Object.freeze({
  mode: 'n8n',
  apiBase: 'https://YOUR-SECURE-GATEWAY.example'
});
```

مقدار apiBase آدرس عمومی gateway است؛ نه MCP و نه secret webhook. سایت را مجدد روی GitHub Pages منتشر کنید. صفحهٔ پکیج‌های اصلی و فرم تماس همچنان نمونه‌اند؛ mode n8n فقط چت و جست‌وجوی پکیج را متصل می‌کند. حالت پیش‌فرض mock کاملاً مستقل و قابل‌نمایش می‌ماند.

## آزمون پذیرش قبل از اتصال عمومی

دو session مستقل نباید خاطرهٔ یکدیگر را ببینند. جست‌وجوی بی‌نتیجه باید matches خالی بدهد. خطای MCP نباید محصول فرضی بسازد. قیمت غیر USD یا قیمت کل گروه باید همان مبنا را حفظ کند. روی «Discuss» نباید رزرو یا تغییر پکیج اتفاق بیفتد. خروجی نامعتبر JSON باید خطای قابل‌بازیابی بدهد. ابزارهای write باید در سطح ابزار غیرفعال باشند، نه فقط با prompt.

## منابع رسمی

- [Webhook و احراز هویت](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Respond to Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/)
- [Simple Memory](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/)
