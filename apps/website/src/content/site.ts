/**
 * All site copy, English only.
 *
 * The source export (`docs/YATF/raw/website/layout-example.html`) is in
 * Italian and this is a translation, not a transliteration. Content lives here
 * as typed data rather than inline JSX so that pricing in particular can be
 * rendered from one model instead of the export's habit of writing the same
 * figure into three different DOM nodes.
 */

export type BillingCycle = 'monthly' | 'annual' | 'lifetime';

/**
 * Where the live cockpit lives, i.e. the Firebase Hosting deployment of
 * `apps/web`. The marketing site and the app are separate hosting targets, so
 * every "open the app" link has to be absolute -- a bare `/` here would just
 * reload the landing page.
 *
 * The default is the default `web.app` host for the project id declared in
 * `firebase.json` and the preview workflow. That was not confirmed against a
 * live deployment, so it is overridable with `VITE_APP_ORIGIN` at build time.
 */
const envAppOrigin = import.meta.env.VITE_APP_ORIGIN as string | undefined;

export const APP_ORIGIN = (
  envAppOrigin?.trim() || 'https://myfinancetracker-b257e.web.app'
).replace(/\/+$/, '');

export const APP_LINKS = {
  /** The app's root route is the login page; see `apps/web/src/App.tsx`. */
  signIn: `${APP_ORIGIN}/`,
  /** Auth-guarded, so anonymous visitors are redirected to the login page. */
  dashboard: `${APP_ORIGIN}/dashboard`,
} as const;

export interface PlanPrice {
  /** Rendered as the large figure, e.g. "€ 6,58". */
  amount: string;
  /** Rendered beside the amount, e.g. "/ month". */
  period: string;
  /** Small print under the amount, e.g. "billed annually at € 79". */
  note?: string;
}

/**
 * Pricing was internally inconsistent in the export: `€ 9,99` monthly,
 * `€ 6,58` monthly billed annually at `€ 79`, `€ 199` lifetime -- and a stray
 * `€ 19,99` that matched no plan. Declared once here so the billing toggle
 * cannot desync the way the original `setBillingCycle` could.
 */
export const PRO_PRICES: Record<BillingCycle, PlanPrice> = {
  monthly: { amount: '€ 9.99', period: '/ month', note: 'billed monthly' },
  annual: { amount: '€ 6.58', period: '/ month', note: 'billed annually at € 79' },
  lifetime: {
    amount: '€ 199',
    period: '/ one time',
    note: 'perpetual licence, no renewal',
  },
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
  lifetime: 'Lifetime',
};

export const ANNUAL_DISCOUNT = 'Save 20%';

export interface Plan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  /** Fixed price, or `undefined` when it depends on the billing cycle. */
  fixedPrice?: PlanPrice;
  /** Tiers not offered on every cycle hide these entries. */
  features: { label: string; included: boolean }[];
  cta: { label: string; variant: 'contained' | 'outlined' | 'text' };
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Free forever',
    tagline:
      'For testing the Balancr architecture by hand and getting comfortable with the cockpit.',
    fixedPrice: { amount: '€ 0', period: '/ forever' },
    features: [
      { label: '1 portfolio account', included: true },
      { label: 'Up to 30 transactions per month', included: true },
      { label: 'Standard web cockpit access', included: true },
      { label: 'Native iOS / Android app', included: false },
      { label: 'Vehicle fleet tracking module', included: false },
    ],
    cta: { label: 'Get started without a card', variant: 'outlined' },
  },
  {
    id: 'pro',
    name: 'Balancr Pro',
    badge: 'Most chosen',
    tagline:
      'The complete toolkit for founders, professionals and self-directed investors.',
    features: [
      { label: 'Unlimited accounts and cards', included: true },
      { label: 'Unlimited transactions and recurrences', included: true },
      { label: 'Guaranteed native iOS & Android access', included: true },
      { label: 'Odometer fleet & utilities management', included: true },
      { label: '12-month predictive cash-flow algorithm', included: true },
      { label: 'Priority support and encrypted backups', included: true },
    ],
    cta: { label: 'Start 14-day free trial', variant: 'contained' },
    highlighted: true,
  },
  {
    id: 'lifetime',
    name: 'Founder Lifetime',
    badge: 'Limited edition',
    tagline:
      'Pay once and keep Balancr for good. Every future update included, nothing to renew.',
    fixedPrice: { amount: '€ 199', period: '/ one time' },
    features: [
      { label: 'Perpetual licence, no subscription', included: true },
      { label: 'Everything in the Pro plan', included: true },
      { label: 'Instant priority access to the iOS & Android beta', included: true },
      { label: 'Founder badge, reserved pricing on future add-ons', included: true },
    ],
    cta: { label: 'Become a founder', variant: 'outlined' },
  },
];

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Ecosystem', href: '#ecosystem' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
] as const;

export const HERO = {
  statusPill: 'Balancr Soft Beta v2.4 live · Native iOS & Android apps coming soon',
  headlineLead: 'Total control of your wealth.',
  headlineAccent: 'Without compromising privacy.',
  subhead:
    'Track liquidity, recurring expenses, investments and your vehicle fleet in a single encrypted financial cockpit. On the web at high responsiveness today, native on your phone in the very near future.',
  primaryCta: 'Start free for 14 days',
  secondaryCta: 'Explore the cockpit demo',
  trialNotice: 'No credit card required · Instant setup · Zero banking spam',
  trustBar: [
    { icon: 'lock', label: 'AES-256 vault encryption' },
    { icon: 'visibilityOff', label: 'Never shared with brokers' },
    { icon: 'folder', label: 'Isolated self-contained sandbox' },
  ],
} as const;

export const ECOSYSTEM = {
  eyebrow: 'Multi-device ecosystem',
  title: 'One sovereign account',
  lead:
    'Synchronised instantly everywhere. No hybrid porting, no sluggish web views. Balancr is built for full speed in the browser, and as genuinely compiled native code on your phone.',
  platforms: [
    {
      id: 'web',
      icon: 'desktop',
      status: 'Available now',
      statusTone: 'available' as const,
      title: 'Web cockpit',
      body:
        'The primary command centre for high-density sessions. Multi-monitor support, instant encrypted CSV export and advanced charting.',
      features: [
        'Keyboard shortcuts for data entry',
        'High-resolution predictive charts',
        'Zero external dependencies',
      ],
      action: { label: 'Open in browser', href: APP_LINKS.dashboard },
    },
    {
      id: 'ios',
      icon: 'phoneIphone',
      status: 'Coming soon · TestFlight',
      statusTone: 'soon' as const,
      title: 'Native iOS app',
      body:
        'Written entirely in Swift and SwiftUI to use your iPhone processor to the full. FaceID for instant unlock and lock-screen widgets.',
      features: [
        'iOS widgets and Dynamic Island tracker',
        'Expense capture via Apple Shortcuts and Siri',
        'Secure Enclave biometric authentication',
      ],
      action: { label: 'Join the TestFlight beta' },
    },
    {
      id: 'android',
      icon: 'android',
      status: 'Coming soon · Google Play',
      statusTone: 'soon' as const,
      title: 'Native Android app',
      body:
        'Built with Jetpack Compose and Material You standards. Discreet notifications for fixed costs and fast camera OCR for receipt scanning.',
      features: [
        'Material You with deep OLED dark theme',
        'Offline-first local synchronisation',
        'Biometric unlock, notifications and widgets',
      ],
      action: { label: 'Join the Google Play beta' },
    },
  ],
} as const;

export interface Pillar {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: string;
  features: string[];
  /** Optional illustrative figures rendered as a static, non-interactive panel. */
  mock?: {
    label: string;
    value: string;
    caption: string;
    rows: { label: string; amount: string; note?: string }[];
    total: { label: string; value: string };
  };
}

export const PILLARS: Pillar[] = [
  {
    id: 'subscriptions',
    eyebrow: 'Subscriptions & debts',
    title: 'Intelligent expense and recurrence tracking',
    icon: 'autorenew',
    body:
      'Netflix, cloud plans, insurance policies, mortgages and car instalments. Balancr recognises payment cycles and computes your real available cash flow in real time, subtracting expected debits before the month closes.',
    features: [
      'Clean separation of liquid and illiquid capital',
      'Automatic monthly savings-rate monitoring',
      'Integration with reference indices and benchmarks',
    ],
    mock: {
      label: 'Average annual saving from cancelled dormant subscriptions',
      value: '€ 340',
      caption: 'from subscriptions you forgot you were paying for',
      rows: [
        { label: 'YouTube Music & Premium', amount: '€ 11.99', note: 'renews in 3 days' },
        { label: 'Car finance instalment', amount: '€ 241.85', note: 'automatic debit' },
        { label: 'Milan condominium expenses', amount: '€ 498.93', note: 'one-off elevator levy' },
      ],
      total: { label: 'Projected 12-month capital trajectory', value: '+ € 18,240' },
    },
  },
  {
    id: 'cashflow',
    eyebrow: 'Predictive wealth analysis',
    title: 'Cash flow and capital evolution',
    icon: 'chart',
    body:
      'Understand exactly where every euro flows. Balancr cross-references your current savings against expected returns, so you can simulate future scenarios, major purchases or stock allocations without fear of illiquidity.',
    features: [
      'Net separation of liquid capital and illiquid assets',
      'Automatic monitoring of the monthly savings rate',
      'Integration with reference indices and benchmarks',
    ],
    mock: {
      label: 'Current liquidity ratio',
      value: '14 months',
      caption: 'estimated coverage of standard expenses',
      rows: [
        { label: 'Protected operating liquidity', amount: '€ 27,075' },
        { label: 'ETF & productive investments', amount: '€ 84,800' },
        { label: 'Emergency reserve capital', amount: '€ 15,000' },
      ],
      total: { label: 'Liquid capital total', value: '€ 27,075.42' },
    },
  },
  {
    id: 'fleet',
    eyebrow: 'TCO & unified mobility',
    title: 'Physical asset and fleet tracking',
    icon: 'car',
    body:
      'Cars and family vehicles are often the second-largest untracked cost. Balancr folds in odometer monitoring, service deadlines, fuel and electricity consumption, and depreciation.',
    features: [
      'Cost control per kWh and per real kilometre',
      'Reminders for scheduled servicing',
      'Depreciation and total cost of ownership over time',
    ],
    mock: {
      label: 'Peugeot 3008 GT · plate GL-921-AZ',
      value: '€ 0.22',
      caption: 'average cost per real kilometre',
      rows: [
        { label: 'Mixed usage', amount: '10,568 km' },
        { label: 'Next service in', amount: '4,432 km' },
        { label: 'Monthly mobility costs', amount: '€ 241.85 + € 78 charging' },
      ],
      total: { label: 'Estimated monthly total', value: '€ 320.00' },
    },
  },
];

export const SECURITY = {
  eyebrow: 'Privacy manifesto',
  title: 'Your financial data is not our currency',
  body:
    'Unlike most free finance apps that profile your spending habits to sell credit cards or mortgages, Balancr is paid software and independently owned. We have no commercial partnerships and no advertising brokers.',
  cards: [
    {
      icon: 'lock',
      title: 'Zero-knowledge encryption',
      body: 'Decoding keys never leave your device.',
    },
    {
      icon: 'delete',
      title: 'Real, instant deletion',
      body: 'One click destroys the entire database irreversibly.',
    },
    {
      icon: 'shield',
      title: 'Sandboxed vault',
      body: 'Your ledger stays in its own isolated store.',
    },
  ],
  spec: [
    { label: 'Encryption', value: 'AES-256-GCM' },
    { label: 'Third-party SDKs', value: '0 (zero)' },
    { label: 'Telemetry trackers', value: 'Disabled' },
    { label: 'GDPR compliance', value: 'EU secure' },
  ],
} as const;

export const FAQ = {
  eyebrow: 'Frequently asked',
  title: 'Everything worth knowing',
  lead: 'Still have a technical or billing question? Our desk is always available.',
  items: [
    {
      q: 'When will the native iOS and Android apps be available?',
      a: 'The iOS (Apple TestFlight) and Android (Google Play Early Access) releases are in final internal testing. Pro and Founder Lifetime subscribers get priority access in staggered waves. Availability on the public stores follows once the betas have stabilised.',
    },
    {
      q: 'Can I switch from a monthly or annual subscription to a Founder Lifetime licence?',
      a: 'Yes, at any time. You can convert your SaaS plan to a perpetual Lifetime licence directly from your account settings, and any unused annual credit is deducted from the purchase total.',
    },
    {
      q: 'Are my real bank credentials safe? Does Balancr read my passwords?',
      a: 'Balancr never has access to your banking credentials, account PINs or passwords. It operates as a protected, self-contained sandbox: you can keep your ledgers fully isolated, or import encrypted statements, retaining absolute control over any metadata.',
    },
    {
      q: 'Can I export all my data as CSV or JSON?',
      a: 'Yes. Data sovereignty is at the foundation of our ethics. You can generate a complete CSV or JSON dump of your records at any moment.',
    },
  ],
} as const;

export const FOOTER = {
  blurb:
    'A personal high-finance platform for sovereign wealth allocation, built for family offices, investors and executives.',
  columns: [
    {
      title: 'Product',
      links: ['Features', 'Ecosystem', 'App ledger & privacy', 'Pricing'],
    },
    {
      title: 'Company',
      links: ['Roadmap', 'Support', 'FAQ', 'Architecture'],
    },
    {
      title: 'Trust',
      links: ['Sandbox security', 'Custody', 'Institutional desk', 'Mobile availability'],
    },
  ],
  legal: ['Privacy notice', 'Terms of service', 'Legal notes'],
  copyright: '© 2025 Balancr Technologies Inc.',
  tagline: 'Absolute financial privacy.',
} as const;

export const WAITLIST = {
  title: 'Early access',
  body: 'Enter your email to receive your TestFlight or Play Store invite as soon as the rollout begins.',
  emailLabel: 'Email on your device',
  deviceLabel: 'Primary device',
  devices: ['iPhone (iOS 17 or 18)', 'iPad Pro / Air', 'Android smartphone (Material You)'],
  submitLabel: 'Confirm reservation',
  disclaimer:
    'Mobile apps · One-minute setup · No contractual lock-in · Support in English and Italian',
  /**
   * No backend exists yet (#193 out of scope), so this form validates and
   * confirms locally. It must not pretend to have submitted anything.
   */
  notWiredNotice:
    'This form is not connected to a backend yet. Your address is validated but not stored.',
} as const;

export const SEO = {
  title: 'Balancr — Private wealth, tracked precisely',
  description:
    'Track liquidity, recurring expenses, investments and your vehicle fleet in one encrypted financial cockpit. Free sandbox, native iOS and Android apps coming soon.',
  ogImage: '/og-image.png',
  siteUrl: 'https://balancr.finance',
} as const;