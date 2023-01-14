import type { AppProps } from 'next/app';
import '@/styles/app.style'

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};
export default App;
