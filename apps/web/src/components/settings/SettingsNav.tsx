import { Box, ButtonBase, Paper, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';

export interface SettingsSection {
  id: number;
  label: string;
  icon: React.ReactNode;
  /** Optional counter rendered as a pill (active accounts, templates, …). */
  badge?: number;
}

interface SettingsNavProps {
  sections: SettingsSection[];
  value: number;
  onChange: (id: number) => void;
}

/**
 * Settings navigation: a 240px vertical rail on desktop, scrollable pills on
 * mobile. Both render from the same section list so the two never drift.
 */
const SettingsNav: React.FC<SettingsNavProps> = ({ sections, value, onChange }) => {
  const isDesktop = useMediaQuery(useTheme().breakpoints.up('md'));

  if (!isDesktop) {
    return (
      <Tabs
        value={value}
        onChange={(_, next) => onChange(next)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="inherit"
        indicatorColor="primary"
        sx={{
          minHeight: 44,
          borderBottom: '1px solid',
          borderColor: 'colors.border',
          '& .MuiTab-root': { minHeight: 44, fontSize: '0.75rem', fontWeight: 600, textTransform: 'none', px: 1.5 },
        }}
      >
        {sections.map((section) => (
          <Tab key={section.id} value={section.id} label={section.label} />
        ))}
      </Tabs>
    );
  }

  return (
    <Paper
      component="nav"
      aria-label="Settings sections"
      sx={{
        p: 1,
        borderRadius: 3,
        bgcolor: 'colors.surface',
        border: '1px solid',
        borderColor: 'colors.border',
        alignSelf: 'start',
        position: 'sticky',
        top: 88,
      }}
    >
      {sections.map((section) => {
        const active = section.id === value;
        return (
          <ButtonBase
            key={section.id}
            onClick={() => onChange(section.id)}
            aria-current={active ? 'page' : undefined}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 1.25,
              py: 1.1,
              mb: 0.25,
              borderRadius: 2,
              justifyContent: 'flex-start',
              color: active ? 'colors.cyan' : 'colors.subtle',
              bgcolor: active ? 'colors.active' : 'transparent',
              borderLeft: '2px solid',
              borderColor: active ? 'colors.cyan' : 'transparent',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              '&:hover': { bgcolor: active ? 'colors.active' : 'rgba(148,163,184,0.08)', color: active ? 'colors.cyan' : 'colors.subtle' },
            }}
          >
            <Box sx={{ display: 'flex', '& svg': { fontSize: 18 } }}>{section.icon}</Box>
            <Typography noWrap sx={{ flex: 1, fontSize: '0.8rem', fontWeight: active ? 700 : 500, textAlign: 'left' }}>
              {section.label}
            </Typography>
            {typeof section.badge === 'number' && section.badge > 0 && (
              <Box
                component="span"
                sx={{
                  fontFamily: (theme) => theme.colors.mono,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  px: 0.6,
                  py: 0.1,
                  borderRadius: 1,
                  bgcolor: active ? 'rgba(6,182,212,0.18)' : 'colors.surfaceNested',
                  border: '1px solid',
                  borderColor: active ? 'rgba(6,182,212,0.4)' : 'colors.border',
                }}
              >
                {section.badge}
              </Box>
            )}
          </ButtonBase>
        );
      })}
    </Paper>
  );
};

export default SettingsNav;
