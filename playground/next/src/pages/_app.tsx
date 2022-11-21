import { createGlobalStyle } from '@kaze-style/react';
import { globalTheme } from '@kaze-style/themes';
import type { AppProps } from 'next/app';

createGlobalStyle(globalTheme.reset());

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};
export default App;
