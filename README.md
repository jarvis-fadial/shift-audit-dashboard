# Shift Audit Dashboard

Static dashboard for auditing VA/QGenda Grid By Staff schedule exports by federal pay period.

## Data refresh

1. In the CDP-enabled Chrome session, log into QGenda and generate **Schedule → Reports → Grid By Staff → Excel** through today's date.
2. Save the captured workbook from browser memory:

```bash
node scripts/save-qgenda-report-from-browser.mjs schedule.xlsx
```

3. Rebuild the dashboard payload:

```bash
uv run --with pandas --with openpyxl python export_workload_data.py
```

Backup shifts are counted as shifts/backups but contribute **0.0 included hours**.

## Verify

```bash
uv run --with pandas --with openpyxl --with pytest python -m pytest test_schedule_parser.py -q
npm run build
```

`npm run lint` currently reports pre-existing React Compiler lint issues in scaffolded components; production build passes.

## Deploy GitHub Pages

```bash
GITHUB_PAGES=true npm run build
git worktree add /tmp/shift-audit-gh-pages gh-pages
rsync -a --delete out/ /tmp/shift-audit-gh-pages/
touch /tmp/shift-audit-gh-pages/.nojekyll
cd /tmp/shift-audit-gh-pages && git add . && git commit -m "deploy: update workload dashboard" && git push origin gh-pages
cd - && git worktree remove /tmp/shift-audit-gh-pages
```
