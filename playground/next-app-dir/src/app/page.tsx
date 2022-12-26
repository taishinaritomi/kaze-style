import { createStyle } from '@kaze-style/react';
import type { NextPage } from 'next';
import Link from 'next/link';

const classes = createStyle({
  container: {
    display: 'flex',
    gap: '5px',
  },
  link: {
    padding: '2rem',
  },
});

const Home: NextPage = () => {
  return (
    <div className={classes.container}>
      <Link className={classes.link} href={'/client'}>
        Client Component
      </Link>
      <Link className={classes.link} href={'/server'}>
        Server Component
      </Link>
    </div>
  );
};

export default Home;
