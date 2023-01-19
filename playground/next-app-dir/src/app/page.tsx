import type { NextPage } from 'next';
import Link from 'next/link';
import { style } from './page.style';

const Home: NextPage = () => (
  <div className={style.container.string()}>
    <Link className={style.link.string()} href={'/client'}>
      Client Component
    </Link>
    <Link className={style.link.string()} href={'/server'}>
      Server Component
    </Link>
  </div>
);

export default Home;
