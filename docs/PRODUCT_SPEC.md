# Product specification

## Problem
Help homeowners understand what scale of home may fit a budget, which assumptions drive cost, and what to discuss with a local architect.

## Initial audience
Tamil Nadu, India; English first, Tamil-friendly localization later. Currency INR. Land cost excluded by default.

## MVP journey
1. Enter location, plot dimensions, total budget, building type, floors, bedroom count, and finish level.
2. See an indicative built-up-area range, itemized cost breakdown, assumptions, and budget gap/surplus.
3. Review original concept layouts when structured geometry generation is ready.
4. Adjust inputs and compare alternatives.
5. Export a concept brief. Accounts and cloud-saved projects come after the anonymous flow is reliable.

## Functional requirements
- FR-01 Validate positive budget and plot dimensions.
- FR-02 Calculate budget-supported area from explicit rate configuration.
- FR-03 Separate base construction, site/utilities, professional/approval allowance, contingency, and total.
- FR-04 Show region, source, effective date, and rate version.
- FR-05 Never claim code compliance from location alone.
- FR-06 Keep core calculator usable without a paid AI service.
- FR-07 Future plans use a structured geometry model, not an unrelated generated image.
- FR-08 Version saved project inputs and outputs when persistence is added.
- FR-09 Responsive, accessible forms and clear errors.
- FR-10 Test calculations and geometry constraints.

## Non-functional requirements
Deterministic explainable calculations; mobile-first accessibility; no committed secrets; server-side validation; SEO metadata and sitemap; modular code; privacy notice before storing personal home details.

## Out of scope for first release
Permit-ready drawings, structural design, guaranteed code compliance, unverified live supplier pricing, payments, memberships, and native mobile app.

## First usable release acceptance
User can enter budget/location/plot/floors/rooms; results explain area and cost assumptions; invalid input never yields misleading estimates; tests cover normal and edge cases; page is mobile-friendly and deployable.