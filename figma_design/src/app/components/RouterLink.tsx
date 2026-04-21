import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router';

export const RouterLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    return <Link ref={ref} {...props} />;
  }
);

RouterLink.displayName = 'RouterLink';
