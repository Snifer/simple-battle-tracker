# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-05-23

### Added
- Sidebar panel with initiative order strip.
- Load combatants from any vault notes via searchable modal.
- Auto-load from a configured folder (bestiary support).
- Configurable YAML field mapping (initiative, hp, hp_max, ac, type).
- Unlimited extra numeric fields (mp, stamina, stress, ki…).
- Damage / healing modal per combatant.
- Conditions / status effects modal with customizable condition list.
- Quick notes per combat.
- HP bar with color coding (green / yellow / red).
- Defeat / revive combats.
- Round counter.
- Settings tab for all field names and conditions.
- Combat template notes: `TEMPLATE_Combat.md` (English) and `PLANTILLA_COMBATIENTE` (Spanish).
- Dual language support (English / Spanish) switch in settings, dynamically translating the interface, condition lists, headers, and file names.
- Dynamic combat log system:
  * Prompts to create a new note, use an existing note (searchable list), or run in-memory only.
  * Chronologically appends logs under a customizable Markdown header in the note.
  * Automatically handles missing folder creation and file naming patterns with `{date}`.
- Refactored code architecture into a clean, modular structure under `src/` directory:
  * `main.ts` (Entry Point & Commands)
  * `types.ts` (Data Models)
  * `localization.ts` (Translations)
  * `settings.ts` (Config & Setting Tab Panel)
  * `view.ts` (Battle Tracker View Panel & Combats Flow)
  * `modals.ts` (UI Popups & Choice Modals)
