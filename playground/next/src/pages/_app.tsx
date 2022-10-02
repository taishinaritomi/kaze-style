import { createGlobalStyle } from '@kaze-style/react';
import { resetStyle } from '@kaze-style/utilities';
import type { AppProps } from 'next/app';

createGlobalStyle(resetStyle);

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
};
export default App;
