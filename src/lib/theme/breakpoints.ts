import { useWindowDimensions } from 'react-native';

/**
 * Width breakpoints (in dp). Mobile-first: a value applies from that width up.
 * - phone:   < md
 * - tablet:  md – lg
 * - desktop: >= lg
 */
export const breakpoints = {
  sm: 480, // large phones
  md: 768, // tablets (portrait)
  lg: 1024, // tablets (landscape) / small laptops
  xl: 1280, // desktop
};

export type DeviceSize = 'phone' | 'tablet' | 'desktop';

type ResponsiveValue<T> = {
  phone: T;
  tablet?: T;
  desktop?: T;
};

/**
 * Responsive layout helper driven by the live viewport size.
 * Re-renders on rotation / window resize (web) via useWindowDimensions.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isPhone = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;
  const isLandscape = width > height;
  const isSmallPhone = width < breakpoints.sm;

  const device: DeviceSize = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'phone';

  // Keep reading-app content comfortable instead of stretching edge-to-edge
  // on tablets and desktop. Phones use the full available width.
  const contentMaxWidth = isDesktop ? 760 : isTablet ? 620 : width;

  // Horizontal gutters grow with available space, shrink on small phones.
  const horizontalPadding = isDesktop ? 32 : isTablet ? 28 : isSmallPhone ? 16 : 20;

  /**
   * Pick a value by device size, falling back to the next-smallest defined tier.
   * pick({ phone: 1, tablet: 2, desktop: 3 })
   */
  function pick<T>(values: ResponsiveValue<T>): T {
    if (isDesktop && values.desktop !== undefined) return values.desktop;
    if ((isTablet || isDesktop) && values.tablet !== undefined) return values.tablet;
    return values.phone;
  }

  return {
    width,
    height,
    device,
    isPhone,
    isTablet,
    isDesktop,
    isSmallPhone,
    isLandscape,
    contentMaxWidth,
    horizontalPadding,
    pick,
  };
}
