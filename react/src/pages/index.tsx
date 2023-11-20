import styles from '@/styles/index.module.css'
import { useContext, useEffect, useRef, useState } from 'react'
import JSONg from 'jsong'
import Head from 'next/head';
import Link from 'next/link';
import { PlayerContext } from './_app';

export default function Home() {

  const player = useContext(PlayerContext);

  return (
    <>
      <Head>
        <title>JSONg Audio</title>
      </Head>
      <main className={'fullpage central'}>
        <h1 className={'title'}>
          What is JSONg Audio?
        </h1>
        <Link href="content">
        <button className={styles.button}
        onClick={()=>{
          player.play();
        }} 
        >Let&apos;s hear it!</button>
        </Link>
        {/* <button onClick={()=>{
          player.current?.stop()
        }}>Stop</button> */}
      </main>
    </>
  )
}
