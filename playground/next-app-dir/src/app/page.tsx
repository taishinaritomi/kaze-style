import type { NextPage } from 'next';
import Link from 'next/link';
import { style } from './page.style';

const Home: NextPage = () => {
  return (
    <div className={style.container}>
      <Link className={style.link} href={'/client'}>
        Client Component
      </Link>
      <Link className={style.link} href={'/server'}>
        Server Component
      </Link>
    </div>
  );
};

export default Home;
