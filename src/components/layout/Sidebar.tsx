import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  AccountBalance as BudgetIcon,
  AccountBalance as FinanceIcon,
  BarChart as BarChartIcon,
  DirectionsCar as CarIcon,
  Bolt as ElecIcon,
  ExitToApp as LogoutIcon,
  Home,
  Settings as SettingsIcon,
  TrendingUp,
} from '@mui/icons-material';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../../store/useFinanceStore';
import { getEnvVar } from '../../utils/variables.utils';

const drawerWidth = 240;

interface NavGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function NavGroup({ icon, label, children, defaultOpen = true }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)} sx={{ borderRadius: 1, mx: 1 }}>
        <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255,255,255,0.6)' }}>{icon}</ListItemIcon>
        <ListItemText primary={label} sx={{ '& .MuiListItemText-primary': { fontWeight: 600, fontSize: '0.875rem' } }} />
        {open ? <ExpandLess sx={{ fontSize: 20, opacity: 0.5 }} /> : <ExpandMore sx={{ fontSize: 20, opacity: 0.5 }} />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children}
        </List>
      </Collapse>
    </>
  );
}

interface SidebarProps {
  onNavClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { enabledModules } = useFinanceStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const appTitle = getEnvVar('VITE_REACT_APP_TITLE');

  const isActive = (path: string) => location.pathname === path;

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <ListItemButton
      component={Link}
      to={to}
      selected={isActive(to)}
      onClick={onNavClick}
      sx={{
        borderRadius: 1, mx: 1,
        '&.Mui-selected': { bgcolor: 'rgba(99, 102, 241, 0.15)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: isActive(to) ? '#818cf8' : 'rgba(255,255,255,0.6)' }}>{icon}</ListItemIcon>
      <ListItemText
        primary={label}
        sx={{ '& .MuiListItemText-primary': { fontWeight: isActive(to) ? 700 : 500, fontSize: '0.875rem', color: isActive(to) ? '#818cf8' : 'inherit' } }}
      />
    </ListItemButton>
  );

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 2 }}>
        <FinanceIcon sx={{ color: '#6366f1' }} />
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -1, color: '#6366f1' }}>
          {appTitle}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ flexGrow: 1, py: 1 }}>
        {navItem('/dashboard', <Home />, t('navigation.dashboard'))}

        <NavGroup icon={<BarChartIcon />} label={t('nav.finance')}>
          {navItem('/salary', <TrendingUp />, t('salary.title'))}
          {navItem('/insights', <BarChartIcon />, t('insights.title'))}
        </NavGroup>

        <NavGroup icon={<TrendingUp />} label="Investments">
          {enabledModules?.investmentTracking && navItem('/invest', <TrendingUp />, t('investment.navInvestments'))}
          {navItem('/projections', <BarChartIcon />, t('nav.projections'))}
        </NavGroup>

        {enabledModules?.budgetTracking && navItem('/budget', <BudgetIcon />, t('nav.budget'))}
        {enabledModules?.carManagement && navItem('/car', <CarIcon />, t('car.title'))}
        {enabledModules?.utilityTracker && navItem('/utilities', <ElecIcon />, t('utilities.title'))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ py: 1 }}>
        {navItem('/config', <SettingsIcon />, t('navigation.config'))}
        <ListItemButton
          onClick={() => { /* logout handled by parent */ }}
          sx={{ borderRadius: 1, mx: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#ef4444' }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary={t('common.logout')} sx={{ '& .MuiListItemText-primary': { fontWeight: 500, fontSize: '0.875rem', color: '#ef4444' } }} />
        </ListItemButton>
      </List>
    </Box>
  );

  if (isMobile) {
    return <>{sidebarContent}</>;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: '#0f172a',
          borderRight: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default Sidebar;
