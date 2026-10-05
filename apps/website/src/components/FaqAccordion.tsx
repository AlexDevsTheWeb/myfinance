import { useId, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { FAQ } from '../content/site';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ExpandMore from '@mui/icons-material/ExpandMore';

interface FaqAccordionProps {
  onOpenWaitlist: () => void;
}

export const FaqAccordion = ({ onOpenWaitlist }: FaqAccordionProps) => {
  const theme = useTheme();
  const baseId = useId();
  // The export opened the first item on load; keeping that gives the section a
  // visible answer instead of four collapsed rows.
  const [expanded, setExpanded] = useState<string | false>(`${baseId}-panel-0`);

  return (
    <Box component="section" id="faq" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.2fr' },
          }}
        >
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              {FAQ.eyebrow}
            </Typography>
            <Typography variant="h2" id="faq-title">
              {FAQ.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {FAQ.lead}
            </Typography>
            <Button
              variant="contained"
              onClick={onOpenWaitlist}
              endIcon={<ArrowForward fontSize="small" />}
              sx={{ alignSelf: 'flex-start', mt: 1 }}
            >
              Talk to the desk
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            {FAQ.items.map((item, index) => {
              const panelId = `${baseId}-panel-${index}`;
              const buttonId = `${baseId}-button-${index}`;
              return (
                <Accordion
                  key={item.q}
                  // MUI v9 does not wire the question/answer relationship for
                  // you: `aria-controls` on the summary and a stable id on the
                  // region both have to be set through slot props, otherwise a
                  // screen reader announces a bare "collapsed, button".
                  slotProps={{
                    region: { id: panelId, 'aria-labelledby': buttonId },
                  }}
                  expanded={expanded === panelId}
                  onChange={(_event, isExpanded) => setExpanded(isExpanded ? panelId : false)}
                  disableGutters
                  elevation={0}
                  sx={{
                    borderRadius: '8px !important',
                    backgroundColor: theme.palette.surfaceLowest,
                    border: `1px solid ${theme.palette.divider}`,
                    '&::before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    slotProps={{ root: { id: buttonId, 'aria-controls': panelId } }}
                    expandIcon={<ExpandMore sx={{ color: 'text.secondary' }} />}
                    sx={{
                      px: 2.5,
                      py: 1.25,
                      '& .MuiAccordionSummary-content': { my: 1.25 },
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {item.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};