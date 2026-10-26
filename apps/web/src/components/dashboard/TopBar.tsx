import {
  Add as AddIcon,
  ChevronRight,
  DirectionsCar as CarIcon,
  NotificationsNone as BellIcon,
  Search as SearchIcon,
  TrendingUp as InvestIcon,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUiStore } from '../../store/useUiStore';

interface Reminder {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  path: string;
}

const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enabledModules, carMileage, transactions } = useFinanceStore();
  const openTransactionDrawer = useUiStore((s) => s.openTransactionDrawer);

  const [search, setSearch] = React.useState('');
  const [notifAnchor, setNotifAnchor] = React.useState<HTMLElement | null>(null);

  const reminders = React.useMemo<Reminder[]>(() => {
    const list: Reminder[] = [];
    const today = dayjs();

    const isFirstOfMonth = today.date() === 1;
    const hasReadingThisMonth = carMileage.some(
      (m) => m.month === today.month() + 1 && m.year === today.year(),
    );
    if (enabledModules.carManagement && isFirstOfMonth && !hasReadingThisMonth) {
      list.push({
        id: 'car-km',
        icon: <CarIcon fontSize="small" />,
        title: t('dashboard.mileageReminder'),
        message: t('dashboard.mileageReminderText'),
        path: '/car',
      });
    }

    const isSecondOfMonth = today.date() === 2;
    const hasPacThisMonth = transactions.some(
      (tx) => tx.category === 'Investimenti' || tx.category === 'Investments',
    );
    if (enabledModules.investmentTracking && isSecondOfMonth && !hasPacThisMonth) {
      list.push({
        id: 'pac',
        icon: <InvestIcon fontSize="small" />,
        title: t('dashboard.notifications.pacTitle'),
        message: t('dashboard.notifications.pacMessage'),
        path: '/investments',
      });
    }

    return list;
  }, [carMileage, enabledModules, transactions, t]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      navigate('/transactions');
    }
  };

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: 'colors.sidebar',
        borderBottom: 1,
        borderColor: 'colors.border',
        px: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100%', sm: 320, lg: 384 },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <SearchIcon
          sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'colors.subtle' }}
        />
        <InputBase
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder={t('dashboard.searchPlaceholder')}
          sx={{
            width: '100%',
            bgcolor: 'colors.surfaceInput',
            border: 1,
            borderColor: 'colors.border',
            borderRadius: 1,
            py: 0.75,
            pl: 4.5,
            pr: 1.5,
            fontSize: '0.75rem',
            color: 'text.primary',
            '& input::placeholder': { color: 'colors.muted', opacity: 1 },
            '&.Mui-focused, &:focus-within': { borderColor: 'colors.cyan' },
          }}
        />
      </Box>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, ml: 'auto' }}>
        <IconButton
          onClick={(e) => setNotifAnchor(e.currentTarget)}
          sx={{
            borderRadius: 1,
            bgcolor: 'colors.surfaceInput',
            border: 1,
            borderColor: 'colors.border',
            color: 'colors.subtle',
            p: 1,
            '&:hover': { color: 'text.primary', borderColor: 'colors.borderLight' },
          }}
        >
          <Badge
            color="warning"
            variant="dot"
            invisible={reminders.length === 0}
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <BellIcon fontSize="small" />
          </Badge>
        </IconButton>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openTransactionDrawer('expense')}
          sx={{
            bgcolor: 'colors.emerald',
            color: '#0B0F17',
            fontWeight: 700,
            fontSize: '0.75rem',
            px: 2,
            py: 1,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#059669' },
          }}
        >
          {t('dashboard.newOperation')}
        </Button>
      </Stack>

      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 320, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('dashboard.notifications.title')}
          </Typography>
        </Box>
        <Divider />
        {reminders.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'colors.subtle' }}>
              {t('dashboard.notifications.empty')}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {reminders.map((reminder) => (
              <ListItemButton
                key={reminder.id}
                onClick={() => {
                  setNotifAnchor(null);
                  navigate(reminder.path);
                }}
                sx={{ alignItems: 'flex-start', py: 1.25 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'colors.cyan', mt: 0.25 }}>
                  {reminder.icon}
                </ListItemIcon>
                <ListItemText
                  primary={reminder.title}
                  secondary={reminder.message}
                  slotProps={{
                    primary: { sx: { fontSize: '0.8rem', fontWeight: 600 } },
                    secondary: { sx: { fontSize: '0.72rem', color: 'colors.subtle', whiteSpace: 'normal' } },
                  }}
                />
                <ChevronRight fontSize="small" sx={{ color: 'colors.muted', alignSelf: 'center' }} />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </Box>
  );
};

export default TopBar;
