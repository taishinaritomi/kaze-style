import type { NextPage } from 'next';
import Link from 'next/link';
import { classes } from './page.style';

const Home: NextPage = () => (
  <div className={classes.container}>
    <Link className={classes.link} href={'/client'}>
      Client Component
    </Link>
    <Link className={classes.link} href={'/server'}>
      Server Component
    </Link>
  </div>
);

export default Home;
