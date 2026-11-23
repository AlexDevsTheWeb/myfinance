import { Close } from '@mui/icons-material';
import { Box, Button, Divider, Drawer, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface EntityDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
  children: React.ReactNode;
}

/**
 * Shared right slide-over for settings entities (account, card, category,
 * recurring template). Mirrors the transaction drawer: 480px on desktop, full
 * viewport on mobile, pinned header and footer with safe-area padding.
 */
const EntityDrawer: React.FC<EntityDrawerProps> = ({
  open,
  title,
  subtitle,
  onClose,
  onConfirm,
  confirmLabel,
  confirmDisabled,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted={false}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 480 },
            height: { xs: '100dvh', sm: '100%' },
            bgcolor: 'colors.surface',
            borderLeft: '1px solid',
            borderColor: 'colors.border',
            backgroundImage: 'none',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', px: 2.5, py: 2, gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose} aria-label={t('common.close')} sx={{ color: 'colors.subtle' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'colors.border' }} />

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children}
        </Box>

        <Divider sx={{ borderColor: 'colors.border' }} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            px: 2.5,
            pt: 2,
            pb: 'calc(16px + env(safe-area-inset-bottom))',
          }}
        >
          <Button onClick={onClose} sx={{ textTransform: 'none', color: 'colors.subtle', minHeight: 48 }}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            disabled={confirmDisabled}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              minHeight: 48,
              px: 3,
              bgcolor: 'colors.cyan',
              color: '#04141a',
              '&:hover': { bgcolor: '#0891b2' },
            }}
          >
            {confirmLabel}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default EntityDrawer;
