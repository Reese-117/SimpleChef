# Progress report (LaTeX)

**Single source file:** `main.tex` contains the full report (no `\input` fragments).

**Repository cross-references:** Long-form requirements, traceability, API contract, architecture, and Figma UI specs live under the project root `docs/` and `frontend/` — see the table in Section 2 of the PDF (`Repository documentation`). Edit those Markdown files as the system evolves; update `main.tex` only for narrative progress and milestone changes.

**Figures:** Place PNGs under `figures/` (subfolders `auth/`, `home/`, `calendar/`, `add/`, `grocery/`, `profile/`). `main.tex` sets `\graphicspath{{figures/}}` and includes every asset in the **Implementation Evidence** section.

**Build:** From this directory, run `pdflatex main` (twice if references need settling) and `bibtex main` if the bibliography changes.
