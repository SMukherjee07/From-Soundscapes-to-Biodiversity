# Local website — research journal v5

The website folder belongs at C:\Users\Samanwita\Downloads\from-soundscapes-to-biodiversity\website. The live website source is now in the same repository as the research.

## Run locally (PowerShell)

```powershell
Set-Location "C:\Users\Samanwita\Downloads\from-soundscapes-to-biodiversity\website"
npm ci
npm run dev -- --host 127.0.0.1 --port 3000
```

Open http://127.0.0.1:3000/. If port 3000 is occupied, stop the earlier server with Ctrl+C or choose --port 3001. No Python environment is required for the website.

## Check and build

```powershell
npm run check
npm run build
npm run preview -- --host 127.0.0.1
```

## Edit the research script

New chapter text: client/src/components/journal/researchContent.ts. Layout: ResearchChapters.tsx and research.css in the same folder. Original Introduction and research questions remain in client/src/IntroductionContent.tsx. Figures/CSV evidence: client/public/research; provenance.json records original artifact locations and hashes.

The Part 3 chapters expose Overview, Data Preparation, Code, Results and Conclusions, with three complete decision trees. Final-test results remain pending; development scores must not be presented as final-test estimates. Review the Introduction in your own words before submission. Biodiversity remains a pilot, not a validated richness estimator.

## Push subsequent edits

```powershell
Set-Location "C:\Users\Samanwita\Downloads\from-soundscapes-to-biodiversity"
git status
git add website docs/website-script-v5.md
git commit -m "Update research journal website"
git push origin forest-experience-integration
```

Do not add environments, raw research audio, model checkpoints, credentials or node_modules. Public expedition audio has its attribution in client/public/audio/expedition/CREDITS.md.
