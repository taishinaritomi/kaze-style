import type { FC, ReactNode } from 'react';
import './layout.style';

type Props = {
  children?: ReactNode;
};

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
