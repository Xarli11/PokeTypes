# Privacy and consent

How PokeTypes handles consent with Google's CMP (AdSense > Privacy & messaging > European regulations), what is verified, and what is still pending. This is technical documentation, not legal advice: nothing here guarantees legal compliance, and every item marked **pending** needs the owner or a professional review. A short checklist for the tax and data protection adviser is in `docs/legal-checklist-asesor.md` (Spanish).

Context confirmed by the owner: PokeTypes is a personal project of a natural person resident in Spain, with no company and no self-employed registration. AdSense monetization has been applied for but is neither approved nor active (no ad units, no Auto ads).

## What loads and when

| Item | Behaviour |
|---|---|
| Consent defaults | `Layout.astro` sets `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` to `denied` before anything else (`wait_for_update: 500`). |
| Google Analytics (`gtag.js`) | **Not requested** unless Google's CMP reports consent mode data (`googlefc` `CONSENT_MODE_DATA_READY`) and `analytics_storage` is explicitly **granted**. Denied, unknown, not applicable and not configured all keep it blocked. |
| AdSense (`adsbygoogle.js`) | Loads on every page: it is what delivers the CMP message. No ad units, no `enable_page_level_ads`. Auto ads must stay off in the AdSense account. |
| Fonts | Served from `/fonts` (`src/styles/fonts.css`). No request to Google Fonts. |
| Reopen preferences | Footer button "Privacy and cookie settings" (`LegalFooter.astro`). |
| Legal pages | `/privacy` (GDPR information, EN + ES) and `/legal` (LSSI-CE art. 10 identification, only if the owner decides it applies). Production serves them only when complete (see "Publication gate"). |

## Consent Mode: basic vs advanced

Google's definitions (Tag Platform, "Consent mode overview" and "Set up consent mode on websites"):

| | Basic | Advanced |
|---|---|---|
| Google tag | Blocked until the user answers; loaded afterwards | Loaded on page open with the `denied` defaults |
| When consent is denied | "No data is transferred to Google at all, not even the consent status" | Consent state and measurements **without cookies** are sent |
| Modeling | General model (less detailed) | Advertiser-specific model, subject to a data-volume threshold Google does not state on those pages |
| Technical requirement with Google's CMP | Load the tags from the `CONSENT_MODE_DATA_READY` callback and check `getGoogleConsentModeValues()` | "Supported by default"; nothing else needed once enabled in Privacy & messaging |

### Recommendation: basic for Google Analytics

- Advanced's benefit is modeling for denied traffic, which depends on a volume threshold. PokeTypes is a small site, so the threshold is unlikely to be met (check the real volume in GA4).
- Advanced's cost is real: before any choice, Google receives a request from every visitor (IP, user agent, page URL, consent state). Basic removes that for Analytics.
- Basic is fail-closed: if the CMP never reports, Analytics never loads. That protects privacy but silently loses measurement, so it must be verified with the real CMP before production.
- Limit: `adsbygoogle.js` still contacts Google before consent (it delivers the message). Basic removes the Analytics requests, not every Google request.

### Behaviour outside the regions where the CMP shows a message

Three different things must not be confused:

| Behaviour | What Google receives | Implemented? |
|---|---|---|
| **Real basic block**: the Google tag is never loaded | Nothing from Analytics, not even the consent state | **Yes, for everyone who has not explicitly granted analytics** |
| **Cookieless measurement** (advanced): tag loaded with `denied` | Cookieless pings: consent state, IP, user agent, page URL | No (it was in an earlier revision of this PR for "not applicable" and was removed because it is not a block) |
| **Granted without a choice**: tag loaded with analytics `granted` | Full measurement with cookies | No |

Current code (`Layout.astro`): `gtag.js` loads only if `getGoogleConsentModeValues().analyticsStoragePurposeConsentStatus === 1` (GRANTED). Status 0 UNKNOWN, 2 DENIED, 3 NOT_APPLICABLE and 4 NOT_CONFIGURED never load it and never grant anything. The CMP only shows a message in the EEA, UK and Switzerland, so **visitors elsewhere can never grant and are not measured at all**, and neither are visitors in those regions who do not accept. Consequences: Analytics counts fall to the consenting visitors; the policy says the tag is only loaded after Google's consent tool reports consent.

Options for those visitors, each needing the owner's decision with advice and a policy text change:

1. **Keep the real block** (current): simplest and most protective; measurement only from consenting visitors.
2. **Cookieless measurement**: restore a static `gtag.js` `<script async>` after the consent default and `gtag('config')` (advanced mode). Google then receives pings from everybody, so the policy and the legal basis for that processing must say so.
3. **Grant by region**: map status 3 to `granted` for agreed regions. Needs a legal basis for cookies without a prompt in those regions, and the adviser must confirm whether consent is still required because the provider is established in Spain regardless of where the visitor is (question in the checklist).

Other limits: the callback mirrors the CMP's statuses into the four signals (1 granted, 2 denied; 0, 3, 4 never grant). Whether Google re-fires `CONSENT_MODE_DATA_READY` after a visitor rejects and later accepts from the footer is not documented (worst case Analytics starts on the next page view): verify.

Going back to advanced: restore the static tag and delete the callback block. Nothing else changes.

Outside the CMP regions nothing is granted automatically: the page never turns any signal to `granted` on its own, and a status other than GRANTED is treated as denied everywhere (defaults deny, only a change is mirrored). In practice a visitor outside the EEA/UK/CH sends no Analytics request, sets no analytics cookie and generates no `dataLayer` event.

## Analytics event lifecycle

Found by reproducing it on the previous revision: `trackEvent()` called `gtag('event', ...)` unconditionally, so a calculator action before consent put an event in `dataLayer` (`type_calculate` was there before any choice). When `gtag.js` loads after the visitor accepts it processes the whole queue, so that earlier interaction would have been sent retroactively. Withdrawal had a second gap: with `gtag.js` already loaded, `analytics_storage: denied` still lets the tag send cookieless pings, including its automatic events.

Corrections (`Layout.astro`, `analytics.js`):

- `window.pokeAnalyticsGranted()` reads Google's live consent status (`getGoogleConsentModeValues()`) at the moment of each call. `trackEvent()` returns without pushing anything unless it is GRANTED. Unknown, denied, not applicable, not configured, a missing `googlefc` and any exception all mean "do not send". Debounced events re-check when the timer fires.
- The same status drives a live `ga-disable-G-9D59NL7KTH` flag (a getter), the documented property that stops Google Analytics measurement. With the tag already loaded, a withdrawal stops every hit, automatic ones included, on the next hit, with no reload and without waiting for a callback. This relies on `gtag.js` reading the flag per hit (documented for opt-out); **not verified with the real tag**, add it to the Tag Assistant run.
- Consent updates are mirrored whenever the status changes (only changes are pushed, from `denied`), from the callback and from each event, so accept, withdraw, accept converges even if Google never re-fires `CONSENT_MODE_DATA_READY` after the reopen flow. A cleared record (UNKNOWN while the message is reopened) counts as withdrawn.
- A post-consent page view is not retroactive: on a page load the tag loads after consent and `config` records that page. An event that the app raises while the page restores state (for example `type_calculate` from the URL) is sent only if consent is already known at that moment.

Calculator actions do not depend on Analytics: `trackEvent()` returns `undefined`, no call site uses its result, nothing else in `src/js` touches `gtag`, `dataLayer` or `googlefc`, and the browser check runs the calculator with `googlefc` absent, throwing, `pokeAnalyticsGranted` throwing, and the Google tag stubbed or blocked.

## Reopening preferences: the documented API

Source: Privacy & Messaging JavaScript API (`developers.google.com/funding-choices/fc-api-docs`) and AdSense Help "Add European regulations message revocation links".

- `googlefc.showRevocationMessage()` clears the current EU regulations consent record and shows the message again. Per the docs, **if googlefc has not loaded when the link is clicked, the click does nothing**.
- `callbackQueue` entries are maps keyed by data-availability name (`CONSENT_API_READY`, `CONSENT_DATA_READY`, `CONSENT_MODE_DATA_READY`...). A bare function is a legacy form, treated as `CONSENT_DATA_READY`. The code uses map entries and calls the method directly, as the developer documentation's example does.
- The documented second example reads `gdprApplies` with `__tcfapi('addEventListener', 0, ...)` inside a `CONSENT_API_READY` callback to hide the link where consent does not apply. The footer does the same read but never hides the button: if `gdprApplies` is false, or googlefc is not available, the click goes to `/privacy#cookies` instead of doing nothing.
- AdSense Help says AdSense adds a revocation link by itself on approved sites showing European regulations messages; ours is manual and always visible. Check that two links do not appear after publishing.

## Verification with Tag Assistant (not only `gcs`)

Do this on a Cloudflare preview deployment after the message is published for that hostname (see the AdSense section), or right after production. Use a clean browser profile per scenario. Send hits to a test GA4 property or filter internal traffic; never test against the production property.

Tag Assistant (tagassistant.google.com) shows, per message, the **Consent** tab with the state of the four types (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) and whether each came from an on-page default or an on-page update. That is the primary evidence. `gcs` (and `gcd`) on `/g/collect` requests in DevTools Network is secondary confirmation.

| Scenario | Expected |
|---|---|
| EEA IP, first visit, before answering | No request to `googletagmanager.com/gtag/js`; no `_ga*` cookies; Tag Assistant sees no Google tag |
| Accept all | `gtag.js` requested once; Consent tab: four types default denied, then update granted; `/g/collect` with `gcs=G111`; `_ga` and `_ga_<id>` cookies |
| Reject all | No `gtag.js` request; no `_ga*`, `__gads`, `__gpi` cookies |
| Accept ads, reject analytics (if the message allows) | `ad_*` granted, `analytics_storage` denied; `gtag.js` not requested |
| Withdraw: footer "Privacy and cookie settings" after accepting, then reject | Message reopens; update with four types denied; any new `/g/collect` with `gcs=G100`; reload: `gtag.js` no longer requested. Note whether existing `_ga` cookies persist: consent mode does not delete them |
| Reject then accept through the footer link | Message reopens; after accepting, check whether `gtag.js` loads without reload or on the next page view (open question above) |
| Before answering, use the calculator, then accept | The earlier actions never appear: in `dataLayer` and in Tag Assistant only events after accepting |
| After withdrawing with `gtag.js` already loaded, use the calculator and scroll or click outbound links | No `/g/collect` at all (not even `gcs=G100`), no automatic events; confirms the `ga-disable` flag works on the real tag |
| Accept, withdraw, accept again, with and without reload | Updates granted, denied, granted; events only while granted; `gtag.js` requested once per page load |
| Outside the EEA/UK/CH (for example a US IP) | No message; **no `gtag.js` request**, no `_ga*` cookies, no `/g/collect`; footer button goes to `/privacy#cookies` |
| Desktop and mobile (390 px) | Same results; footer links reachable; no horizontal overflow |

Console helper (documented `dataLayer` only; paste in DevTools to list consent commands in order):

```js
dataLayer.filter(a => a[0] === 'consent').map(a => [a[1], JSON.stringify(a[2])])
```

Automated coverage in the repo: `tests/consent-behavior.test.js` runs the real inline scripts against a fake `googlefc` that follows the documented contract (accept, reject, partial, unknown, not applicable, not configured, repeated callbacks, withdrawal; footer API with and without CMP). `tests/analytics-lifecycle.test.js` runs the real Layout script together with the real `trackEvent()` through no consent to accept, reject to accept, accept to withdraw to accept (with `gtag.js` loaded, with and without callbacks) and reloads, and guards that calculator code never depends on Analytics. Without the consent gate 9 of its tests fail. None of this shows what Google's scripts actually do, so it does not replace Tag Assistant.

## AdSense account-level effects (other sites such as Pokepedia)

- Messages are created per site, but the consent-mode flags on the European regulations Settings page are **account-level**: AdSense Help states they apply "to all of your European regulations messages shown on the web and in apps" (AMP excluded). Enabling them for PokeTypes changes how Google's CMP interprets consent for every site in the same AdSense account, including Pokepedia.
- Before publishing: open AdSense > Privacy & messaging > European regulations and list every message and the sites each covers. Create PokeTypes' message for `poketypes.app` only. Do not toggle account-level settings until the effect on Pokepedia has been checked. How Pokepedia loads Google tags and its consent setup is not in this repository and has **not** been assessed.
- The publisher ID is shared, `ads.txt` is per domain: `poketypes.app/ads.txt` is separate from the file Pokepedia needs.
- Google's CMP only updates consent for users who are shown a message; everything else comes from the page code.

## GDPR information vs LSSI-CE identification

Two different obligations, kept in two different places.

| | GDPR (privacy policy, `/privacy`) | LSSI-CE art. 10 (legal notice, `/legal`) |
|---|---|---|
| Purpose | Tell visitors how their personal data is processed | Identify the provider of an information-society service |
| Identity | Identity and contact details of the controller (art. 13) | Name, domicile or establishment address, email, NIF, registry data if registered (art. 10.1, verified on the BOE text) |
| Applies when | Personal data of visitors is processed (it is: IP at hosting and third parties, analytics, ads) | The site is a service of the information society; economic activity (ads, donations) is the usual trigger. **Whether it applies to this site, now or once AdSense is approved, is pending professional confirmation** |
| Where it lives | `src/pages/privacy.astro`: name and contact email only | `src/pages/legal.astro`: shown only if `lssi.applies` is `true` |
| Own decision flag | n/a | `lssi.applies`: `null` undecided (default), `true`, `false` |

Rules enforced in code (`src/lib/legal.js`, tests in `tests/legal.test.js`):

- A brand or alias (**PokeTypes**, **Xarli11**) is rejected as the legal identity: the field stays "missing".
- When `lssi.applies` is `true`, name, email, NIF and address are all required.
- The address must be the owner's residence (`addressKind: "residence"`), or any other kind (`establishment` or `other`) **only with `addressLegallyConfirmed: true`**. A postal box or a virtual address is **not** accepted by default as a valid solution; it needs legal confirmation first.
- Nothing is filled in automatically and nothing is assumed from the repository.

## Owner data and publication gate

No personal data is committed. `src/lib/legal.js` starts with every field `null`, `lssi.applies` undecided and `addressLegallyConfirmed: false`.

Providing the data without Git: a JSON string in the `POKETYPES_LEGAL` environment variable, merged over the defaults at build time by `astro.config.mjs` (`vite.define`) and compiled into the server bundle. Shape (placeholders only):

```json
{
  "controller": { "name": "...", "contactEmail": "..." },
  "lssi": { "applies": true, "taxId": "...", "address": "...", "addressKind": "residence" },
  "legalBases": { "hosting": "...", "calculator": "...", "analytics": "...", "advertising": "..." },
  "providers": { "google": { "role": "...", "transfer": "..." }, "cloudflare": {}, "pokeapi": {}, "github": {}, "showdown": {} },
  "retention": { "analytics": "...", "serverLogs": "...", "consentRecord": "..." },
  "minors": { "en": "...", "es": "..." },
  "supervisoryAuthority": "..."
}
```

- Local: `$env:POKETYPES_LEGAL = '{...}'` (PowerShell) before `npm run dev` or `npm run build`.
- Cloudflare Pages: a build variable `POKETYPES_LEGAL` in the project's settings. That is a Cloudflare setting for the owner to set; it has not been touched. A build variable is not a secret store and whatever is rendered on the pages is public; never put anything there that must stay private.
- `npm run check:legal` lists the pending fields (names only, never values) and exits 1 while anything is pending.
- Authorized alternative: if the owner explicitly authorizes committing a value that the law makes public anyway, it can go in `legal.js`. That has **not** been authorized.

Publication gate (`legalAccess`, hostname based):

| Host | Data incomplete | Data complete |
|---|---|---|
| `poketypes.app`, `www.poketypes.app` | `/privacy` and `/legal` answer **404**; footer legal links hidden; no incomplete text is ever public | `/privacy` indexed and linked; `/legal` only if `lssi.applies` is true and complete |
| Previews (`*.pages.dev`), localhost | Draft rendered, `noindex, nofollow`, banner listing the missing field names | Same as production |

Verified (dev server with a temporary edit that treated `localhost` as production, and environment values that were placeholders in a throwaway process, never saved): no data gives 404 on both pages and no footer links; complete GDPR data with LSSI not applicable gives `/privacy` 200 indexed, `/legal` 404; LSSI applicable but data missing gives `/legal` 404; non-residence address without confirmation gives `/legal` 404; confirmed address gives `/legal` 200 and a footer link.

Links never dangle: `/legal` is visible only if `/privacy` is also visible (it links to it), the footer shows `/legal` only inside the privacy block, and `/privacy` links to `/legal` only when it is visible. This was a real gap (a complete notice with an incomplete policy would have linked to a 404) and is covered for every data state on every host in `tests/legal-links.test.js`. Before publishing the CMP message run `npm run check:legal -- --live https://poketypes.app`: it fails unless `/privacy` (and `/legal` when it applies), `/ads.txt` and the logo answer 200 and are indexable.

Where the injected data can appear (checked by building with marker values): only in the server bundle (`dist/_worker.js`), which is not served (`/_worker.js` answers 404 on the preview and on production); never in client JavaScript, sourcemaps (none are produced), `.astro` caches, the build log or the dev log. Rendered pages: name, email, legal bases, provider roles and transfers only on `/privacy`; NIF and address only on `/legal`, so a NIF or address supplied while `lssi.applies` is false is compiled into the server bundle but rendered nowhere. Malformed JSON is swallowed without echoing it and the checks print field names only (`tests/legal-leaks.test.js`). Cloudflare shows the variable to project members in its dashboard and build logs may print environment variables if a build step does; do not echo it.

Consequences to plan for: the production `/privacy` URL does not exist until the data is complete, so the CMP message cannot point to it before then; and, because Analytics is basic and fail-closed, merging this to `main` before the CMP message is published stops Analytics until it is.

## What goes to AdSense privately vs what may have to be public

| Information | AdSense (private, to Google) | Public on the site |
|---|---|---|
| Name and postal address of the payee | Yes: the payments profile holds the name and address of the person payments go to; Google uses them to verify identity and mail a PIN, and invoices for VAT show them as in the account (AdSense Help). Nothing found says AdSense publishes them | Only if LSSI art. 10 applies and the owner decides the same data is the domicile to publish |
| Tax information (tax forms, tax IDs) | Yes: submitted under Payments profile > Manage tax info | NIF only if art. 10 applies (art. 10.1 e) |
| Bank account | Yes | Never |
| Email for privacy requests | Not needed by AdSense | Yes (GDPR contact; also art. 10 email if it applies) |
| Legal name | Yes, as payee | GDPR identity (art. 13) and, if it applies, art. 10 |
| Privacy policy URL | Required when configuring the message | Public by definition |
| Home address | Yes, if it is the payee address | Only if art. 10 requires a domicile and no other valid option is confirmed by an adviser |

AdSense does not decide what the law requires on the site. Whether the payee data and the public identification must match is a question in the checklist.

## Minors

- Evidence in the repo: no accounts, no forms, no age question. The audience is not documented; a Pokemon tool plausibly attracts young visitors but there is no data either way.
- The page says only what is true (no accounts, no age or personal details asked) and marks the rule for visitors under the age of digital consent as pending (`minors.en/es`).
- Pending: age of digital consent for the owner's jurisdiction (GDPR art. 8 sets 16 and lets member states lower it to 13; Spain's is stated as 14, **to be confirmed**); whether Google's child-directed or under-age-of-consent treatment settings for AdSense and Analytics should be used (check Google's current policies, not verified here); whether the site is directed to children in Google's or US COPPA terms.

## Providers

Observed on the live site (network requests and code). Role and transfer safeguard have **no evidence collected** for any provider and are pending (required by the gate).

| Provider | Observed use | Information link (HTTP 200 checked 2026-10-21) | Role | Transfer safeguard / DPA |
|---|---|---|---|---|
| Google (Analytics, AdSense, consent tool) | `gtag.js` (after granted), `adsbygoogle.js` | policies.google.com/privacy | pending | pending |
| Cloudflare | Hosting, CDN, SSR worker | cloudflare.com/privacypolicy | pending | pending |
| PokeAPI | Client fetches Pokemon details | pokeapi.co/docs/v2 (no privacy policy found) | pending | pending |
| GitHub | Sprites from `raw.githubusercontent.com` | docs.github.com GitHub General Privacy Statement | pending | pending |
| Pokemon Showdown | `play.pokemonshowdown.com/data/pokedex.json` fetched by `data.js` (competitive mode) | pokemonshowdown.com/privacy | pending | pending |
| Buy Me a Coffee, GitHub, Discord, Smogon | Outbound links only | n/a | n/a | n/a |

Cloudflare set no cookies on `/` when checked and no Cloudflare Web Analytics beacon was in the HTML; Cloudflare dashboard features (Web Analytics, Bot management) were not inspected.

## Fonts

Self-hosted from `public/fonts` (11 `woff2` files, same Google files and subsets; Syne 700-800, Outfit 300-800, JetBrains Mono 400/700/800; SIL Open Font License 1.1) with `font-display: swap`, same `unicode-range` blocks. Evidence: 8 full-page screenshots (4 pages, desktop and mobile) are pixel-identical before and after, the same number of font faces load per page, and no `fonts.googleapis.com` or `fonts.gstatic.com` request remains.

## Blocking items for production

1. Owner decisions and data (`legal.js` fields via `POKETYPES_LEGAL`), starting with whether LSSI art. 10 applies, and a professional review of the texts and of the cookie classification (that stored preferences and the service-worker cache are "strictly necessary" is a legal assessment).
2. Verify basic consent mode against the real, published CMP (table above). Unverified against Google.
3. Check AdSense account-level impact on Pokepedia before touching account-level settings.
4. Confirm Auto ads is off in the AdSense account.
5. Decision for visitors outside the CMP regions (keep the block, cookieless, or grant by region).
6. Minors policy and Google settings.
7. `www.poketypes.app` still answers 200 without redirecting to the apex; the policy URL must be the apex.

## Deployment and verification procedure

1. Owner decisions and data; professional review; `npm run check:legal` reports READY with the production values.
2. Merge to `develop` only with the owner's authorization; PR `develop` to `main` only with explicit authorization (a merge to `main` deploys to production). Set `POKETYPES_LEGAL` in Cloudflare Pages build variables first, or the legal pages stay hidden.
3. Preview (Cloudflare branch preview): `/ads.txt` returns 200; `/privacy` renders as a draft or complete; fonts load from `/fonts`; no Google Fonts requests.
4. In AdSense: check for updates on the site (ads.txt); create the EN and ES message for `poketypes.app` only, privacy policy URL `https://poketypes.app/privacy` (must return 200 first), logo `https://poketypes.app/icon-512.png`, default toggles off; publish. Remember Analytics stays off until this message reports consent.
5. Run the full scenario table on production from an EEA IP and a non-EEA IP with a test GA4 property or filter.
6. Rollback: Cloudflare Pages "Rollback" to the previous deployment, or `git revert -m 1 <merge commit>` on `main`; unpublish the message in AdSense.
