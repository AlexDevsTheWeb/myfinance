# MUI Dialogs

## ADDED Requirements

### Requirement: Native alert() replaced with MUI AlertSnackbar
The system SHALL replace all native `alert()` calls with MUI `Snackbar` + `Alert` components.

#### Scenario: ConfigPage import backup error uses Snackbar
- **WHEN** user imports a backup with errors in ConfigPage
- **THEN** a MUI Snackbar displays the error message instead of `alert()`

#### Scenario: ConfigPage restore success uses Snackbar
- **WHEN** backup is restored successfully in ConfigPage
- **THEN** a MUI Snackbar displays the success message instead of `alert()`

#### Scenario: ConfigPage restore error uses Snackbar
- **WHEN** backup restore fails in ConfigPage
- **THEN** a MUI Snackbar displays the error message instead of `alert()`

#### Scenario: ConfigPage cannot delete non-empty category uses Snackbar
- **WHEN** user tries to delete a category with items in ConfigPage
- **THEN** a MUI Snackbar displays the warning instead of `alert()`

### Requirement: Native confirm() replaced with MUI ConfirmDialog
The system SHALL replace all native `window.confirm()` calls with a reusable MUI `Dialog`-based confirmation component.

#### Scenario: ConfigPage category delete uses ConfirmDialog
- **WHEN** user clicks delete on a category in ConfigPage
- **THEN** a MUI Dialog asks for confirmation instead of `window.confirm()`

#### Scenario: ConfigPage subcategory delete uses ConfirmDialog
- **WHEN** user clicks delete on a subcategory item in ConfigPage
- **THEN** a MUI Dialog asks for confirmation instead of `window.confirm()`

#### Scenario: ConfigPage account delete uses ConfirmDialog
- **WHEN** user clicks delete on an account in ConfigPage
- **THEN** a MUI Dialog asks for confirmation instead of `window.confirm()`

#### Scenario: ConfigPage recurring template delete uses ConfirmDialog
- **WHEN** user clicks delete on a recurring template in ConfigPage
- **THEN** a MUI Dialog asks for confirmation instead of `window.confirm()`

#### Scenario: InvestmentPage ETF transaction delete uses ConfirmDialog
- **WHEN** user clicks delete on an ETF transaction in InvestmentPage
- **THEN** a MUI Dialog asks for confirmation instead of `window.confirm()`

#### Scenario: TransactionTable finance transaction delete uses ConfirmDialog
- **WHEN** user clicks delete on a finance transaction in TransactionTable
- **THEN** a MUI Dialog asks for confirmation instead of `window.confirm()`
