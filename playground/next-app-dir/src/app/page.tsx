import type { NextPage } from 'next';
import Link from 'next/link';
import { style } from './page.style';

const Home: NextPage = () => {
  return (
    <div className={style.container.str}>
      <Link className={style.link.str} href={'/client'}>
        Client Component
      </Link>
      <Link className={style.link.str} href={'/server'}>
        Server Component
      </Link>
    </div>
  );
};

export default Home;
