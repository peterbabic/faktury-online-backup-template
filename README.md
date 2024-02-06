# Faktury-online.com backup script

- [invoices.json](./invoices.json)
- [offers.json](./offers.json)

A bit of details mentioned in
<https://peterbabic.dev/blog/faktury-online-backup-as-github-action/>

## Instructions

- configure secrets for `API_KEY`, `EMAIL` and `BASE_URL`, take these from
  <faktury-online.com>
- enable Github actions write permissions, as this creates automatic commits
- if you make any changes to `index.js` run `npm run buld` first
- runs at the beginning of the month or manually
- it is possible to run this somewhat manually via `act workflow_dispatch` but
  requires `GITHUB_TOKEN`
