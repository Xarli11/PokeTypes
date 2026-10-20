# Privacy and consent

How PokeTypes handles consent with Google's CMP (AdSense > Privacy & messaging > European regulations), what is verified, and what is still pending. This is technical documentation, not legal advice: nothing here guarantees legal compliance, and every item marked **pending** needs the owner or a legal review.

## What loads and when

| Item | Behaviour |
|---|---|
| Consent defaults | `Layout.astro` sets `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` to `denied` before anything else (`wait_for_update: 500`). |
| Google Analytics (`gtag.js`) | **Not requested** until Google's CMP reports consent mode data (`googlefc` `CONSENT_MODE_DATA_READY`) and `analytics_storage` is not denied. |
| AdSense (`adsbygoogle.js`) | Loads on every page: it is what delivers the CMP message. No ad units, no `enable_page_level_ads`. Auto ads must stay off in the AdSense account. |
| Fonts | Served from `/fonts` (`src/styles/fonts.css`). No request to Google Fonts. |
| Reopen preferences | Footer button "Privacy and cookie settings" (`LegalFooter.astro`). |

## Consent Mode: basic vs advanced

Google's definitions (Tag Platform, "Consent mode overview" and "Set up consent mode on websites"):

| | Basic | Advanced |
|---|---|---|
| Google tag | Blocked until the user answers; loaded afterwards | Loaded on page open with the `denied` defaults |
| When consent is denied | "No data is transferred to Google at all, not even the consent status" | Consent state and measurements **without cookies** are sent |
| Modeling | General model (less detailed) | Advertiser-specific model, subject to a data-volume threshold Google does not state on those pages |
| Technical requirement with Google's CMP | Load the tags from the `CONSENT_MODE_DATA_READY` callback and check `getGoogleConsentModeValues()` | "Supported by default"; nothing else needed once enabled in Privacy & messaging |

### Recommendation: basic for Google Analytics

- Advanced's benefit is modeling for denied traffic, which depends on a volume threshold. PokeTypes is a small site, so the threshold is unlikely to be met and the main benefit is probably not available (check the real volume in GA4).
- Advanced's cost is real: before any choice, Google receives a request from every visitor (IP, user agent, page URL, consent state). Basic removes that for Analytics.
- Basic is fail-closed: if the CMP never reports, Analytics never loads. That protects privacy but silently loses measurement, so it must be verified with the real CMP before production (see "Blocking items").
- Limits of Basic here: `adsbygoogle.js` still contacts Google before consent (it delivers the message). Basic does not make the page free of Google requests; it removes the Analytics ones.

### What the implementation does (`Layout.astro`)

1. Defaults denied (all four signals).
2. A `CONSENT_MODE_DATA_READY` callback reads `googlefc.getGoogleConsentModeValues()` and mirrors the CMP's answer: status 1 (GRANTED) becomes `granted`, 2 (DENIED) becomes `denied`; 0, 3 and 4 never grant. It mirrors the CMP's reported state rather than deciding anything, and makes the result independent of whether the account-level consent-mode flags are on.
3. It loads `gtag.js` (plus `js` and `config`) only if the analytics status is 1 (GRANTED), 3 (NOT_APPLICABLE) or 4 (NOT_CONFIGURED), following Google's documented unblock pattern. 0 (UNKNOWN) and 2 (DENIED) keep it blocked.
4. NOT_APPLICABLE (for example visitors outside the EEA, UK and Switzerland, where no message is shown) loads the tag in its **denied** state: no analytics cookies, cookieless pings only. Granting by default for other regions is a legal and business decision that has not been taken. If the owner decides to, the change is to map status 3 to `granted` for the regions agreed.

### Implications of changing the model

- Back to advanced: restore a static `gtag.js` `<script async>` after the consent default and `gtag('config')`, and delete the `CONSENT_MODE_DATA_READY` block. Nothing else changes.
- Analytics counts will drop versus today (GA loads unconditionally in production now): only visitors who allow analytics, and visitors outside regions where consent applies, are counted.
- A visitor who first rejects and later accepts through the footer link: the loader runs from the same callback, but whether Google re-fires `CONSENT_MODE_DATA_READY` after the reopen flow is not documented; worst case GA starts on the next page view. Verify (see below).

## Reopening preferences: the documented API

Source: Privacy & Messaging JavaScript API (`developers.google.com/funding-choices/fc-api-docs`) and AdSense Help "Add European regulations message revocation links".

- `googlefc.showRevocationMessage()` clears the current EU regulations consent record and shows the message again. Per the docs, **if googlefc has not loaded when the link is clicked, the click does nothing**.
- `callbackQueue` entries are maps keyed by data-availability name (`CONSENT_API_READY`, `CONSENT_DATA_READY`, `CONSENT_MODE_DATA_READY`...). A bare function is a legacy form, treated as `CONSENT_DATA_READY`. The first version of this PR pushed `showRevocationMessage` as a bare function (the AdSense Help form); it now calls the method directly, as the developer documentation's example does, and uses map entries for callbacks.
- Google's second example reads `gdprApplies` with `__tcfapi('addEventListener', 0, ...)` inside a `CONSENT_API_READY` callback to hide the link where consent does not apply. The footer does the same read but never hides the button: if `gdprApplies` is false, or googlefc is not available, the click goes to `/privacy#cookies` instead of doing nothing.
- The AdSense Help page says AdSense adds a revocation link by itself on approved sites showing European regulations messages; ours is manual and kept always visible. Check that two links do not appear after publishing.

## Verification with Tag Assistant (not only `gcs`)

Do this on a Cloudflare preview deployment, after the message is published for that hostname (see the AdSense section). Use a clean browser profile per scenario. Send hits to a test GA4 property or filter internal traffic; never test against the production property.

Tag Assistant (tagassistant.google.com) connects to the page and shows, per message, the **Consent** tab with the state of the four types (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) and whether each came from an on-page default or an on-page update. That is the primary evidence. `gcs` (and `gcd`) on `/g/collect` requests in DevTools Network is secondary confirmation.

| Scenario | Expected |
|---|---|
| EEA IP, first visit, before answering | No request to `googletagmanager.com/gtag/js`; no `_ga*` cookies; Tag Assistant sees no Google tag |
| Accept all | `gtag.js` requested once; Tag Assistant Consent tab: four types default denied, then update granted; `/g/collect` with `gcs=G111`; `_ga` and `_ga_<id>` cookies |
| Reject all | No `gtag.js` request; no `_ga*`, `__gads`, `__gpi` cookies |
| Accept ads, reject analytics (if the message allows) | `ad_*` granted, `analytics_storage` denied; `gtag.js` not requested |
| Withdraw: footer "Privacy and cookie settings" after accepting, then reject | Message reopens; update with four types denied; new `/g/collect` (if any) with `gcs=G100`; reload: `gtag.js` no longer requested. Note whether existing `_ga` cookies persist: consent mode does not delete them |
| Reject then accept through the footer link | Message reopens; after accepting, check whether `gtag.js` loads without reload or on the next page view (documented as an open question above) |
| Outside the EEA/UK/CH (for example a US IP) | No message; `gtag.js` loads with defaults denied; no update; `gcs=G100`; no `_ga` cookies; footer button goes to `/privacy#cookies` |
| Desktop and mobile (390 px) | Same results; footer links reachable; no horizontal overflow |

Console helper (documented `dataLayer` only; paste in DevTools to list consent commands in order):

```js
dataLayer.filter(a => a[0] === 'consent').map(a => [a[1], JSON.stringify(a[2])])
```

Automated coverage in the repo: `tests/consent-behavior.test.js` runs the real inline scripts against a fake `googlefc` that follows the documented contract (accept, reject, partial, not applicable, repeated callbacks, withdrawal; footer API with and without CMP). These do not replace Tag Assistant: they cannot show what Google's scripts actually do.

## AdSense account-level effects (other sites such as Pokepedia)

- Messages are created per site, but the consent-mode flags on the European regulations Settings page are **account-level**: AdSense Help states they apply "to all of your European regulations messages shown on the web and in apps" (AMP excluded). Enabling them for PokeTypes changes how Google's CMP interprets consent for every site in the same AdSense account, including Pokepedia.
- Before publishing: open AdSense > Privacy & messaging > European regulations and list every message and the sites each one covers. Create PokeTypes' message for `poketypes.app` only. Do not toggle account-level settings until the effect on Pokepedia has been checked. How Pokepedia loads Google tags and its consent setup is not in this repository and has **not** been assessed.
- Publisher ID is shared, `ads.txt` is per domain: `poketypes.app/ads.txt` is separate from the file Pokepedia needs.
- Google's CMP only updates consent for users who are shown a message; defaults for everyone else come from the page code.

## Owner identification (what to publish)

Nothing is collected or filled in automatically. `src/lib/legal.js` holds the fields; a field set to `null` shows a visible "to be completed" marker; `false` hides the row.

What the law asks depends on the owner's legal status and country, which this repository does not state:

- **Spain, LSSI-CE art. 10** (verified on the BOE text): a service provider with a website must make permanently available its name or company name, residence or domicile (or the address of a permanent establishment in Spain), email address and other data allowing direct and effective contact, commercial-registry data if registered, and its NIF. Whether it applies depends on the activity being a service of the information society (ads and donations are the usual trigger for "economic activity") and on the establishment being in Spain. **Pending legal confirmation.**
- **GDPR art. 13**: identity and contact details of the controller. A postal address is not the only way to give contact details; what is enough for an individual is a question for counsel.
- **Do not publish a private home address by default.** Alternatives to discuss with an adviser: a business or registered address, a professional mailbox, or a registered-agent service. Pick one, then fill `address`. If the status allows omitting a field, set it to `false`.
- Decision matrix to complete with legal advice: individual with no economic activity / self-employed / company; country; whether the AdSense payee data must match.

## Minors

- Evidence in the repo: no accounts, no forms, no age question. The audience is not documented; a Pokemon tool plausibly attracts young visitors but there is no data either way.
- The previous text "does not knowingly collect personal data from children" was removed: it was an assertion without evidence. The page now says only what is true (no accounts, no age or personal details asked) and marks the rule for visitors under the age of digital consent as pending.
- Pending: age of digital consent that applies to the owner's jurisdiction (GDPR art. 8 sets 16 and lets member states lower it to 13; Spain's is stated as 14, **to be confirmed by counsel**); whether Google's child-directed or under-age-of-consent treatment settings for AdSense and Analytics should be used (check Google's current policies, not verified here); whether the site is "directed to children" in Google's or US COPPA terms.

## Providers

Observed on the live site (network requests and code). Role and transfer safeguard have **no evidence collected** for any provider and are pending.

| Provider | Observed use | Information link (HTTP 200 checked 2026-10-21) | Role | Transfer safeguard / DPA |
|---|---|---|---|---|
| Google (Analytics, AdSense, consent tool) | `gtag.js` (after consent signal), `adsbygoogle.js` | policies.google.com/privacy | pending | pending |
| Cloudflare | Hosting, CDN, SSR worker | cloudflare.com/privacypolicy | pending | pending |
| PokeAPI | Client fetches Pokemon details | pokeapi.co/docs/v2 (no privacy policy found) | pending | pending |
| GitHub | Sprites from `raw.githubusercontent.com` | docs.github.com GitHub General Privacy Statement | pending | pending |
| Pokemon Showdown | `play.pokemonshowdown.com/data/pokedex.json` fetched by `data.js` (competitive mode) | pokemonshowdown.com/privacy | pending | pending |
| Buy Me a Coffee, GitHub, Discord, Smogon | Outbound links only | n/a | n/a | n/a |

Cloudflare set no cookies on `/` when checked and no Cloudflare Web Analytics beacon was in the HTML; Cloudflare dashboard features (Web Analytics, Bot management) were not inspected.

## Fonts

Self-hosted from `public/fonts` (11 `woff2` files, same Google files and subsets; Syne 700-800, Outfit 300-800, JetBrains Mono 400/700/800; SIL Open Font License 1.1) with `font-display: swap`, same `unicode-range` blocks. Evidence: 8 full-page screenshots (4 pages, desktop and mobile) are pixel-identical before and after, the same number of font faces load per page, and no `fonts.googleapis.com` or `fonts.gstatic.com` request remains. Static files get Cloudflare's default cache headers.

## Blocking items for production

1. Owner data (`controller`, `legalBases`, `providers`, `minors`, `analyticsRetention`, `supervisoryAuthority`) and a legal review of the text and of the cookie classification (the "strictly necessary" category for stored preferences and the service-worker cache is a legal assessment).
2. Verify the Basic implementation against the real, published CMP (table above). Until then it is unverified against Google's actual behaviour.
3. Check AdSense account-level impact on Pokepedia and other sites before touching account-level settings.
4. Confirm Auto ads is off in the AdSense account.
5. Decision on regions where consent is not requested (stay denied, or grant).
6. Minors policy and Google settings.
7. `www.poketypes.app` still answers 200 without redirecting to the apex; the policy URL must be the apex.

## Deployment and verification procedure

1. Complete `legal.js`; legal review; merge to `develop` only with the owner's authorization; PR to `main` only with explicit authorization (a merge to `main` deploys to production).
2. Preview (Cloudflare branch preview): `ads.txt` and `/privacy` return 200; fonts load from `/fonts`; run the Tag Assistant table above with the message published for the preview hostname if AdSense allows it, otherwise right after production.
3. In AdSense: check for updates on the site (ads.txt), create the EN and ES message for `poketypes.app` only, privacy policy URL `https://poketypes.app/privacy`, logo `https://poketypes.app/icon-512.png`, default toggles off, publish.
4. Run the full scenario table on production from an EEA IP with a test GA property or filter.
5. Rollback: Cloudflare Pages "Rollback" to the previous deployment, or `git revert -m 1 <merge commit>` on `main`; unpublish the message in AdSense.
