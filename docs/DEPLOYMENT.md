# Deployment checklist

## Before deploying
- [ ] Confirm the latest intended commit is on the deployment branch.
- [ ] Ensure CI passes: unit tests and production build.
- [ ] Verify the site uses the correct canonical URL and metadata.
- [ ] Confirm no secrets or private project data are in the bundle or repository.
- [ ] Verify all displayed rates are clearly labeled as verified or illustrative.
- [ ] Test mobile layout, keyboard navigation, and form validation.
- [ ] Test the feasibility result against known calculation examples.
- [ ] Confirm the professional-review warning is visible.

## Static frontend deployment
The initial frontend is a Vite static site. A static hosting provider can build it with:
- Build command: `npm run build`
- Publish directory: `dist`
- Node.js: 20 or compatible supported LTS

No backend is required for the current local feasibility prototype. Saved projects, authoritative server-side estimates, and account features are not implemented yet.

## After deployment
- [ ] Open the published URL in a private/incognito session.
- [ ] Check browser console and network errors.
- [ ] Test form with valid and invalid values.
- [ ] Confirm the exact deployed commit SHA.
- [ ] Record the URL, timestamp, and smoke-test evidence in the roadmap.
- [ ] Keep the previous deploy available for rollback.

Never claim deployment is complete until the published URL and smoke test have been verified.
