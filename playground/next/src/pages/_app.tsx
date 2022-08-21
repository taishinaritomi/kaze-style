import type { AppProps } from 'next/app';
// import '@kaze-style/react/reset.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
};
export default App;
