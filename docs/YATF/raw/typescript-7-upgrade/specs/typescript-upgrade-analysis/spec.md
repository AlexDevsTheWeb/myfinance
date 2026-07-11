## ADDED Requirements

### Requirement: Upgrade feasibility analysis

The system SHALL produce a structured analysis of TS 6.0 → 7.0 upgrade feasibility for the myfinance project.

#### Scenario: Breaking change audit
- **WHEN** TS 7.0 is installed alongside TS 6.0
- **THEN** the analysis SHALL compare all tsconfig compilerOptions against TS 7.0's removed/deprecated options and report mismatches

#### Scenario: Diagnostic comparison
- **WHEN** `tsc --noEmit` is run with TS 7.0 on the current codebase
- **THEN** the analysis SHALL compare error/warning output with TS 6.0 and document any new, removed, or changed diagnostics

### Requirement: Ecosystem compatibility check

The analysis SHALL verify that key tooling works with TS 7.0 without regressions.

#### Scenario: Build pipeline test
- **WHEN** `npm run build` (tsc -b && vite build) is executed with TS 7.0
- **THEN** the analysis SHALL report whether the full build pipeline succeeds or fails

#### Scenario: Linter compatibility
- **WHEN** `npm run lint` is executed with TS 7.0 installed
- **THEN** the analysis SHALL report whether typescript-eslint runs successfully or errors out

### Requirement: Performance benchmark

The analysis SHALL measure and compare type-checking performance between TS 6.0 and TS 7.0.

#### Scenario: Cold type-check benchmark
- **WHEN** `tsc --noEmit` is run on a clean `.tsbuildinfo` state for both TS 6.0 and TS 7.0
- **THEN** the analysis SHALL report wall-clock time for each and the speedup ratio

#### Scenario: Warm type-check benchmark
- **WHEN** `tsc --noEmit` is run immediately after a previous successful run (cached state) for both versions
- **THEN** the analysis SHALL report wall-clock time for each and the speedup ratio

### Requirement: Risk assessment report

The analysis SHALL produce a final recommendation with documented risks.

#### Scenario: Go/no-go recommendation
- **WHEN** all analysis steps are complete
- **THEN** the analysis SHALL produce a clear recommendation (go / no-go / conditional) with supporting rationale and documented blockers
