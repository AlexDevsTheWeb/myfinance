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
import { alpha, useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
          mx: collapsed ? 0 : 1,
          px: collapsed ? 1 : undefined,
          justifyContent: collapsed ? 'center' : undefined,
          cursor: 'pointer',
          '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.15), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } },
        }}
      >
        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: collapsed ? 'center' : undefined, color: active ? 'primary.main' : 'rgba(255,255,255,0.6)' }}>
          {icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={label}
            sx={{ '& .MuiListItemText-primary': { fontWeight: active ? 700 : 500, fontSize: '0.875rem', color: active ? 'primary.main' : 'inherit' } }}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <BalancrLogo size={56} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 2 }}>
          <BalancrLogo size={48} />
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -1, color: 'common.white', whiteSpace: 'nowrap' }}>
            {APP_TITLE}
          </Typography>
        </Box>
      )}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {navItem('/dashboard', <Home />, t('navigation.dashboard'))}
        {navItem('/transactions', <Receipt />, t('navigation.transactions'))}

        {navItem('/finance', <BarChartIcon />, t('nav.finance'))}

        {enabledModules?.investmentTracking && navItem('/investments', <TrendingUp />, 'Investments')}

        {enabledModules?.budgetTracking && navItem('/budget', <BudgetIcon />, t('nav.budget'))}
        {enabledModules?.carManagement && navItem('/car', <CarIcon />, t('car.title'))}
        {enabledModules?.utilityTracker && navItem('/utilities', <ElecIcon />, t('utilities.title'))}
      </List>

      {/* Collapse toggle */}
      {!isMobile && (
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ alignSelf: collapsed ? 'center' : 'flex-end', mr: collapsed ? 0 : 1, mb: 1, opacity: 0.5 }}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      )}

      {/* User section */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ py: 1 }}>
        {navItem('/config', <SettingsIcon />, t('navigation.config'))}
        {!collapsed && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}>
            <Avatar
              src={user.photoURL || undefined}
              alt={user.displayName || 'User'}
               sx={{ width: 32, height: 32, border: '2px solid rgba(67, 100, 247, 0.5)' }}
            >
              {user.displayName?.charAt(0)}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && user && (
          <Tooltip title={user.displayName || 'User'} placement="right">
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                sx={{ width: 32, height: 32, border: '2px solid rgba(67, 100, 247, 0.5)' }}
              >
                {user.displayName?.charAt(0)}
              </Avatar>
            </Box>
          </Tooltip>
        )}
        <ListItemButton
          onClick={logout}
          sx={{ borderRadius: 1, mx: collapsed ? 0 : 1, px: collapsed ? 1 : undefined, justifyContent: collapsed ? 'center' : undefined, cursor: 'pointer' }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: collapsed ? 'center' : undefined, color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText primary={t('common.logout')} sx={{ '& .MuiListItemText-primary': { fontWeight: 500, fontSize: '0.875rem', color: 'error.main' } }} />
          )}
        </ListItemButton>
      </List>
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
          bgcolor: 'background.default',
          borderRight: '1px solid rgba(255,255,255,0.1)',
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
