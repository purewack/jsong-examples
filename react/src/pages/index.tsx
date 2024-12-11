import styles from '@/styles/index.module.css'
import { Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react'

import Head from 'next/head';
import Link from 'next/link';
import { PlayerContext } from './_app';
import JSONg from 'jsong-audio/src';
import clsx from 'clsx';

export default function Home({setIntroDone} : {setIntroDone : Dispatch<SetStateAction<boolean>>}) {

  const player = useContext(PlayerContext) as JSONg;

  const [exiting, setExiting] = useState(false);

  const StartButton = ({children, song, auto = true} : {children : ReactNode, song: string, auto?: boolean})=><button className={styles.button}
  onClick={async ()=>{
    setIntroDone(true);
    console.warn(song)
    const m = await player.parseManifest(song)
    if(m)
    await player.loadManifest(m)
    if(auto)
    player.play();
  }} 
  >{children}</button>

  useEffect(()=>{
    // player.stop(false)
  },[])

  return (
    <>
      <Head>
        <title>JSONg Audio</title>
      </Head>
      <main className={clsx(styles.story, 'pageenter', 'fullpage', 'central')}>
        <h1 className={'title'}>
          What is JSONg Audio?
        </h1>
        <Link href="content">
          <StartButton song='test_song' >Let&apos;s hear it!</StartButton>
        </Link>
        <span>- or -</span>
        <Link href="story">
          <StartButton song='test_song2'>Hear use case</StartButton>
        </Link>
        {/* <button className={styles.button}
        onClick={()=>{
          player.stop(0);
        }} 
        >Stop</button> */}
        {/* <button onClick={()=>{
          player.current?.stop()
        }}>Stop</button> */}
      </main>
    </>
  )
}
