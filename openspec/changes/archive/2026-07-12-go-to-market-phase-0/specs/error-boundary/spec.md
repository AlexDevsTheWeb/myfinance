# Error Boundary

## ADDED Requirements

### Requirement: Error boundary catches render crashes
The system SHALL wrap the application root with a React error boundary that catches unhandled render errors.

#### Scenario: Render crash shows fallback UI
- **WHEN** any component throws during render
- **THEN** the error boundary displays a centered fallback UI with an error icon, friendly message, and retry button

#### Scenario: Retry resets error state
- **WHEN** user clicks retry button on error fallback
- **THEN** the error boundary resets its error state and re-renders child components

#### Scenario: Normal renders pass through
- **WHEN** no render errors occur
- **THEN** the error boundary renders children transparently with no UI change

### Requirement: Fallback UI is professional
The error fallback SHALL use MUI components (Paper, Typography, Button, Icon) in dark theme.

#### Scenario: Fallback matches app theme
- **WHEN** error boundary fallback is displayed
- **THEN** it uses the app's MUI dark theme with consistent styling
