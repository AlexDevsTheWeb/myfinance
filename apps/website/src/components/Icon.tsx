import type { SvgIconProps } from '@mui/material/SvgIcon';
import { ICON_MAP, isIconName } from './iconMap';

/**
 * Renders the content-named icon, falling back to a neutral glyph when the name
 * is unknown so a typo in `content/site.ts` cannot take the page down.
 */
export const Icon = ({ name, ...props }: { name: string } & SvgIconProps) => {
  const Component = isIconName(name) ? ICON_MAP[name] : ICON_MAP.checkCircle;
  return <Component {...props} />;
};
