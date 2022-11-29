'use client';

import { createGlobalStyle } from '@kaze-style/react';
import { globalTheme } from '@kaze-style/themes';
import type { FC, ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

createGlobalStyle(globalTheme.reset());

const Layout: FC<Props> = ({ children }) => {
  return (
    <html>
      <head>
        <title>Kaze Style</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
