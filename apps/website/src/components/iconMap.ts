import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import AndroidIcon from '@mui/icons-material/Android';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BarChartIcon from '@mui/icons-material/BarChart';
import CarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DesktopIcon from '@mui/icons-material/DesktopMac';
import FolderIcon from '@mui/icons-material/Folder';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ShieldIcon from '@mui/icons-material/Shield';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

/**
 * Icon lookup by name, so `content/site.ts` can name an icon in plain data
 * without importing a component into a content module.
 *
 * The icons are imported individually rather than from the `@mui/icons-material`
 * barrel: each one is its own module, so the bundler only keeps the fourteen
 * used here. Names are the content-facing ones (`car`, `chart`) rather than
 * MUI's (`DirectionsCar`, `BarChart`), because those strings are what appears in
 * the content file.
 */
export const ICON_MAP = {
  allInclusive: AllInclusiveIcon,
  android: AndroidIcon,
  autorenew: AutorenewIcon,
  car: CarIcon,
  chart: BarChartIcon,
  checkCircle: CheckCircleIcon,
  close: CloseIcon,
  delete: DeleteIcon,
  desktop: DesktopIcon,
  folder: FolderIcon,
  lock: LockIcon,
  phoneIphone: PhoneIphoneIcon,
  shield: ShieldIcon,
  trendingUp: TrendingUpIcon,
  visibilityOff: VisibilityOffIcon,
} as const;

export type IconName = keyof typeof ICON_MAP;

export const isIconName = (value: string): value is IconName => value in ICON_MAP;
