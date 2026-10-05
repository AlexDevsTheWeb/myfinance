import { lazy, Suspense, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { ColorModeProvider } from './theme/ColorModeProvider';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EcosystemSection } from './components/EcosystemSection';
import { PillarsSection } from './components/PillarsSection';
import { PricingTable } from './components/PricingTable';
import { SecuritySection } from './components/SecuritySection';
import { FaqAccordion } from './components/FaqAccordion';
import { Footer } from './components/Footer';
import { SEO, type BillingCycle, type Plan } from './content/site';

/**
 * Title and description are authored once in `content/site.ts` and applied to
 * the document here, with `index.html` carrying the same values as a no-JS
 * fallback. Keeping the pair in one place stops the two from drifting.
 */
const useSeo = () => {
  useEffect(() => {
    document.title = SEO.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', SEO.description);
  }, []);
};

const BetaWaitlistDialog = lazy(() =>
  import('./components/BetaWaitlistDialog').then((module) => ({
    default: module.BetaWaitlistDialog,
  })),
);

export const App = () => {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [waitlist, setWaitlist] = useState<{ open: boolean; planName?: string }>({
    open: false,
  });

  useSeo();

  const openWaitlist = (planName?: string) => setWaitlist({ open: true, planName });
  const closeWaitlist = () => setWaitlist({ open: false });

  const handleSelectPlan = (plan: Plan) => openWaitlist(plan.name);

  return (
    <ColorModeProvider>
      <Box
        component="a"
        href="#main"
        sx={{
          position: 'absolute',
          left: -9999,
          top: 0,
          zIndex: 2000,
          p: 1.5,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          '&:focus': { left: 8, top: 8 },
        }}
      >
        Skip to main content
      </Box>

      <Navbar onOpenWaitlist={() => openWaitlist()} />

      <Box component="main" id="main">
        <HeroSection onOpenWaitlist={() => openWaitlist()} />
        <EcosystemSection onOpenWaitlist={() => openWaitlist()} />
        <PillarsSection />
        <PricingTable
          cycle={cycle}
          onCycleChange={setCycle}
          onSelectPlan={handleSelectPlan}
        />
        <SecuritySection />
        <FaqAccordion onOpenWaitlist={() => openWaitlist()} />
      </Box>

      <Footer />

      {/* The waitlist dialog pulls in Dialog, Menu, Select and Alert, which is
          a meaningful slice of this page's bundle for a form most visitors never
          open. It is split out and fetched on first intent. */}
      {waitlist.open && (
        <Suspense fallback={null}>
          <BetaWaitlistDialog
            open={waitlist.open}
            planName={waitlist.planName}
            onClose={closeWaitlist}
          />
        </Suspense>
      )}
    </ColorModeProvider>
  );
};

export default App;