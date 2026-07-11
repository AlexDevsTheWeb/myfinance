## ADDED Requirements

### Requirement: Chart rendering parity

All charts SHALL render the same data with the same visual layout after migration from recharts to MUI X Charts. Data accuracy, axis labels, tooltip values, and legend entries MUST match the current recharts output for identical input data.

#### Scenario: Area chart visual parity
- **WHEN** an AreaChart receives the same data before and after migration
- **THEN** the rendered SVG SHALL display the same area fill, line path, axis ticks, and tooltip content

#### Scenario: Bar chart visual parity
- **WHEN** a BarChart receives the same data before and after migration
- **THEN** the rendered bars SHALL have the same height, color, spacing, and tooltip content

#### Scenario: Pie/donut chart visual parity
- **WHEN** a PieChart receives the same data before and after migration
- **THEN** the rendered slices SHALL have the same angles, colors, inner/outer radii, and legend entries

#### Scenario: Composed chart visual parity
- **WHEN** a ComposedChart (area + lines) receives the same data before and after migration
- **THEN** the rendered chart SHALL display the same area fill and line paths with matching styles

#### Scenario: Dual Y-axis chart visual parity
- **WHEN** a chart with left and right Y-axes receives the same data
- **THEN** both axes SHALL render correct scales and data SHALL align to the correct axis

#### Scenario: Empty state rendering
- **WHEN** a chart receives an empty data array
- **THEN** the chart SHALL render without errors and display appropriate empty state

### Requirement: Theme integration

Chart colors SHALL be driven by MUI theme tokens, not hardcoded hex values. Changing the theme mode (light/dark) SHALL update chart backgrounds and text colors accordingly.

#### Scenario: Dark mode chart rendering
- **WHEN** the app is in dark mode
- **THEN** chart backgrounds SHALL use theme background color and text/labels SHALL use theme text color

#### Scenario: Theme color token usage
- **WHEN** a chart renders a series
- **THEN** its color SHALL resolve from the theme's chart palette, not a hardcoded value

### Requirement: Responsive layout

Charts SHALL resize to fit their container width, matching the current responsive behavior.

#### Scenario: Container resize
- **WHEN** the chart container width changes
- **THEN** the chart SHALL redraw to fill the available width without distortion

### Requirement: Dependency cleanup

The recharts and victory-vendor packages SHALL be removed from the project after all charts are migrated.

#### Scenario: Package removal
- **WHEN** all 16 chart components have been migrated
- **THEN** `npm ls recharts` SHALL show the package is not installed
