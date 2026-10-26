# [FEATURE] [FEATURE] Financial Projections — Smart Tax & Inflation Modeling

> Source: GitHub Issue [#93](https://github.com/AlexDevsTheWeb/myfinance/issues/93)
> State: OPEN
> Labels: feature
> Created: 2026-06-27

## Objective
Add inflation adjustment to the projections module for more accurate real-value estimates.

## Current Limitation
Projections use a flat 26% Italian tax rate on nominal gains but ignore inflation and tracking fees (TER).

## Requirements
- Add a toggle in `/projections` called \"Adjust for Inflation (2%)\".
- Calculate \"Real Value\" vs \"Nominal Value\" of future capital.
- Give a more accurate representation of future purchasing power.

## Related
- Source: [raw/ux-improvments/ux-improvments.md](raw/ux-improvments/ux-improvments.md)
