# OpenCode Prompt: Add Transaction Drawer UI Refinement & Mobile Optimization

## Context & Objectives
The `AddTransactionDrawer` component has been successfully implemented, but requires a targeted UI/UX refinement pass to fix visual inconsistencies, input auto-formatting, color dynamics, hover states, and mobile responsiveness.

Reference screenshot: `Screenshot 2026-10-26 alle 14.53.21.png`.

---

## 1. Visual Consistency & Input Styling (MUI Overrides)

### A. DatePicker vs TextField / Select Parity
- **Problem**: The `DatePicker` (`@mui/x-date-pickers`) has different height, padding, background, and icon styling compared to standard `TextField` and `Select` components.
- **Fix**:
  - Standardize all inputs (`TextField`, `Select`, `DatePicker` slot) to share identical container styles:
    - Background: `#0B0E14` or `#1A233A`
    - Border radius: `8px` (`rounded-lg`)
    - Height / Padding: `size="medium"` (dense 48px touch-friendly height)
    - Font family: `Inter` for text labels, `JetBrains Mono` for dates and figures.
  - **DatePicker Calendar Icon**: Style the calendar end-adornment icon button color to subtle Cyan (`#0EA5E9`) or Muted Slate (`#94A3B8`), avoiding default harsh white or grey icons.

### B. Hover & Focus States (Fixing the White Hover Border)
- **Problem**: Hovering over inputs produces a harsh, high-contrast white border (`#FFFFFF`).
- **Fix**: Override MUI `OutlinedInput` hover and focus styles across the drawer (or theme level):
  ```tsx
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#0B0E14',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#1E293B',
      transition: 'border-color 0.2s ease-in-out',
    },
    '&:hover fieldset': {
      borderColor: '#334155', // Subtle slate hover, NEVER pure #FFFFFF
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0EA5E9', // Clean Cyan focus
      borderWidth: '1.5px',
    },
  }
  ```

---

## 2. Hero Amount Field Refinements

### A. Color Synchronization (Symbol + Digits)
- **Problem**: Only the `€` symbol or badge reflects the transaction type color, while the numerical digits remain white/grey.
- **Fix**: Both the `€` prefix symbol AND the numeric input text MUST dynamically inherit the active tab color:
  - **Expense Tab**: Coral Red (`#EF4444`) for BOTH `€` and digits.
  - **Income Tab**: Emerald Green (`#10B981`) for BOTH `€` and digits.
  - **Transfer Tab**: Cyan (`#0EA5E9`) for BOTH `€` and digits.
- Apply this directly to the `input` text color:
  ```tsx
  sx={{
    '& .MuiInputBase-input': {
      color: activeTab === 'expense' ? '#EF4444' : activeTab === 'income' ? '#10B981' : '#0EA5E9',
      fontSize: '2rem',
      fontWeight: 700,
      fontFamily: 'JetBrains Mono',
    }
  }}
  ```

### B. Currency Auto-Formatting while Typing
- **Problem**: Raw numbers entered by the user (e.g. `2123,00`) do not auto-format with thousands separators or handle Italian currency formatting cleanly.
- **Fix**:
  - Integrate a clean currency formatting handler (or `react-number-format` / custom mask / `Intl.NumberFormat('it-IT')` blur handler).
  - Automatically format thousands separators on input/blur (e.g., `2.123,00`).
  - Support both decimal comma `,` and period `.` inputs.
  - Set `inputMode="decimal"` on the `inputProps` so mobile devices open the numeric keypad with decimal support.

---

## 3. Mobile Responsiveness & Touch Optimization

### A. Responsive Drawer Layout
- **Desktop (`sm` breakpoint and above, >= 600px)**:
  - Slide-over drawer anchored to the right with fixed width `480px`.
- **Mobile (`xs` breakpoint, < 600px)**:
  - **Full-Screen / Bottom-Sheet Drawer**: Set `width: '100vw'`, `height: '100vh'` (or `100dvh`).
  - **Fixed Top Header**: Title + Close button remain pinned at the top.
  - **Sticky Bottom Action Bar**: `Annulla` and `Salva Operazione` buttons remain sticky at the bottom with safe area padding (`paddingBottom: 'calc(16px + env(safe-area-inset-bottom))'`).

### B. Touch Targets & Form Ergonomics
- Ensure all input fields, select dropdowns, and buttons have a minimum touch target height of `48px`.
- Add comfortable vertical scrolling for the form body (`overflowY: 'auto'`, `flex: 1`) so short mobile viewports easily scroll without cutting off the Save button.

---

## 4. Execution Workflow for OpenCode

1. **Modify `AddTransactionDrawer.tsx`**:
   - Apply the input hover/focus overrides and DatePicker parity styles.
   - Synchronize digits color with `€` prefix based on `activeTab`.
   - Add numeric input auto-formatting (`inputMode="decimal"`, comma/period handling, thousand separators).
   - Add responsive mobile layout rules (`xs: 100vw`, sticky header/footer, safe-area padding).
2. **Verification**:
   - Test layout in browser dev tools at desktop (1280px) and mobile viewport (375px / iPhone dimensions).
   - Run `npx tsc -b`, `npm run build`, and `npx vitest run`.
3. **Documentation & Merge Request**:
   - Update the implementation report in `docs/reports/` and OKF wiki documentation.
   - Open a follow-up PR or commit to `feat/add-transaction-drawer-refinement`.
