import {
  AccountBalance as BudgetIcon,
  BarChart as BarChartIcon,
  Bolt as ElecIcon,
  ChevronLeft,
  ChevronRight,
  DirectionsCar as CarIcon,
  ExitToApp as LogoutIcon,
  Home,
  Receipt,
  Settings as SettingsIcon,
  TrendingUp,
} from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useLogout } from '../../hooks/useLogout';
import { useAuthStore } from '../../store/useAuthStore';
import BalancrLogo from '../BalancrLogo';

const APP_TITLE = 'BALANCR';

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 64;

interface SidebarProps {
  onNavClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { enabledModules } = useFinanceStore();
  const { user } = useAuthStore();
  const logout = useLogout();
  const isMobile = useMediaQuery('(max-width: 899.95px)');
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItem = (to: string, icon: React.ReactNode, label: string) => {
    const active = isActive(to);
    const item = (
      <ListItemButton
        component={Link}
        to={to}
        selected={active}
        onClick={onNavClick}
        sx={{
          borderRadius: 1,
          mx: collapsed ? 0 : 1.5,
          px: collapsed ? 1 : 1.5,
          py: 1.25,
          minHeight: 40,
          flexGrow: 0,
          flexShrink: 0,
          justifyContent: collapsed ? 'center' : undefined,
          cursor: 'pointer',
          color: active ? 'colors.cyan' : 'colors.subtle',
          border: '1px solid transparent',
          transition: 'background-color 0.15s ease, color 0.15s ease',
          '&:hover': { bgcolor: active ? 'colors.active' : 'colors.surface', color: active ? 'colors.cyan' : '#E2E8F0' },
          '&.Mui-selected': {
            bgcolor: 'colors.active',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            '&:hover': { bgcolor: 'colors.active' },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed ? 0 : 1.5,
            justifyContent: 'center',
            color: 'inherit',
            '& svg': { fontSize: 18 },
          }}
        >
          {icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            sx={{ '& .MuiListItemText-primary': { fontWeight: 500, fontSize: '0.875rem', color: 'inherit' } }}
          />
        )}
      </ListItemButton>
    );

    if (collapsed) {
      return <Tooltip key={to} title={label} placement="right">{item}</Tooltip>;
    }
    return item;
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo / Title */}
      {collapsed ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 64, borderBottom: 1, borderColor: 'colors.border' }}>
          <BalancrLogo size={32} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 64, px: 2.5, borderBottom: 1, borderColor: 'colors.border' }}>
          <BalancrLogo size={40} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: '0.08em', color: 'common.white', lineHeight: 1 }}>
              {APP_TITLE}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: 'colors.subtle', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.4 }}>
              Finanza Personale
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItem('/dashboard', <Home />, t('navigation.dashboard'))}
        {navItem('/transactions', <Receipt />, t('navigation.transactions'))}

        {navItem('/finance', <BarChartIcon />, t('nav.finance'))}

        {enabledModules?.investmentTracking && navItem('/investments', <TrendingUp />, 'Investments')}

        {enabledModules?.budgetTracking && navItem('/budget', <BudgetIcon />, t('nav.budget'))}
        {enabledModules?.carManagement && navItem('/car', <CarIcon />, t('car.title'))}
        {enabledModules?.utilityTracker && navItem('/utilities', <ElecIcon />, t('utilities.title'))}
        {navItem('/config', <SettingsIcon />, t('navigation.config'))}
      </List>

      {/* Collapse toggle */}
      {!isMobile && (
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ alignSelf: collapsed ? 'center' : 'flex-end', mr: collapsed ? 0 : 1, mb: 1, opacity: 0.5 }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      )}

      {/* User section */}
      <Divider sx={{ borderColor: 'colors.border' }} />
      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        {collapsed ? (
          <>
            {user && (
              <Tooltip title={user.displayName || 'User'} placement="right">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                  <Avatar
                    src={user.photoURL || undefined}
                    alt={user.displayName || 'User'}
                    sx={{ width: 32, height: 32, bgcolor: 'colors.surface', border: 1, borderColor: 'colors.border', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    {user.displayName?.charAt(0)}
                  </Avatar>
                </Box>
              </Tooltip>
            )}
            <Tooltip title={t('common.logout')} placement="right">
              <IconButton onClick={logout} sx={{ display: 'flex', mx: 'auto', color: 'colors.subtle', '&:hover': { color: 'error.main' } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: 1,
              borderRadius: 2,
              bgcolor: 'colors.surface',
              border: 1,
              borderColor: 'colors.border',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
              <Avatar
                src={user?.photoURL || undefined}
                alt={user?.displayName || 'User'}
                sx={{ width: 32, height: 32, bgcolor: 'colors.sidebar', border: 1, borderColor: 'colors.border', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}
              >
                {user?.displayName?.charAt(0)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayName}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'colors.subtle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Tooltip title={t('common.logout')}>
              <IconButton size="small" onClick={logout} sx={{ color: 'colors.subtle', flexShrink: 0, '&:hover': { color: 'error.main' } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return <>{sidebarContent}</>;
  }

  const w = collapsed ? drawerWidthCollapsed : drawerWidthExpanded;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: w,
        flexShrink: 0,
        transition: 'width 0.2s ease',
        '& .MuiDrawer-paper': {
          width: w,
          boxSizing: 'border-box',
          bgcolor: 'colors.sidebar',
          borderRight: '1px solid',
          borderColor: 'colors.border',
          overflowX: 'hidden',
          transition: 'width 0.2s ease',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
