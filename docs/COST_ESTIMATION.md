# Cost-estimation policy

## Purpose
A transparent early planning range, not a binding contractor quote or professional quantity survey.

## Current Coimbatore research configuration
The frontend and API consume the same versioned file at shared/rates.v1.json. Configuration ID: market-range-2026-10-v2, checked 24 October 2026.

| Finish | Published research range | Representative midpoint |
|---|---:|---:|
| Basic | ₹1,500–₹2,100/sq ft | ₹1,800/sq ft |
| Standard | ₹1,850–₹2,600/sq ft | ₹2,225/sq ft |
| Premium | ₹2,550–₹4,000/sq ft | ₹3,275/sq ft |

These bands are transcribed from a third-party Coimbatore market article dated 23 July 2026. A second third-party calculator reports standard construction at ₹1,895–₹2,454/sq ft as of 12 August 2026. They are not independently verified contractor quotes, and their scopes may differ. The midpoint is used only to show a representative planning scenario; the supported-area range is calculated using both low and high rates.

Sources:
- [House Construction Cost in Coimbatore (23 July 2026)](https://infraura.com/house-construction-cost-coimbatore/)
- [Construction Cost in Coimbatore (updated 12 August 2026)](https://www.infralens.in/prices/coimbatore)
- [Tamil Nadu PWD Schedule of Rates 2025–26, Volume I](https://tnpwdea.org/files/tn-pwd-13-09-2025-05-30-44-133.pdf), effective 22 July 2025; item rates exclude GST and other taxes.
- [Tamil Nadu PWD downloads — Plinth Area Rates for Rough Cost Estimates 2025–26](https://tnpwdea.org/downloads.php?category_id=5), effective 1 August 2025.

Official PWD schedules are useful public-works references but are not automatically interchangeable with private turnkey quotes. Do not label the published market bands as verified, guaranteed, or officially approved. Obtain multiple dated local quotations with identical inclusions before upgrading the status. Use the structured [contractor quote template](../data/contractor-quote-template.csv) to capture scope, exclusions, taxes, area basis and verification evidence.

## Breakdown
1. Base construction benchmark using the selected rate band.
2. Provisional site and utilities allowance.
3. Provisional professional design, survey and approval allowance.
4. Contingency.
5. Explicit exclusions such as land, unusual foundations, major retaining work, interiors/furniture, compound wall, borewell/septic and taxes not already included.

The current calculator applies 5% site/utilities, 5% professional/approval and 10% contingency on the subtotal as explicit planning assumptions. Validate scope and avoid double-counting inclusions before using a real quotation.

## Regional rules and safety
Regional rule links are listed in shared/regional-rules.v1.json, but they are reference-only and not machine-applied. The Tamil Nadu Combined Development and Building Rules have amendments; check the latest Gazette and local authority. Cost does not establish legal buildability. Setbacks, FSI/FAR, coverage, height, access, soil and local approvals require site-specific professional review. Never label a concept approved, permit-ready or structurally safe without qualified professional review.
