import { createGlobalStyle } from '@kaze-style/react';
import { resetStyle } from '@kaze-style/themes';
import type { AppProps } from 'next/app';

createGlobalStyle(resetStyle);

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Component {...pageProps} />
  );
};
export default App;
