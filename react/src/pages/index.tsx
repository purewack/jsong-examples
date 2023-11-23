import styles from '@/styles/index.module.css'
import { Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react'

import Head from 'next/head';
import Link from 'next/link';
import { PlayerContext } from './_app';
import JSONg from 'jsong-audio';

export default function Home({setIntroDone} : {setIntroDone : Dispatch<SetStateAction<boolean>>}) {

  const player = useContext(PlayerContext) as JSONg;

  const StartButton = ({children} : {children : ReactNode})=><button className={styles.button}
  onClick={()=>{
    player.play();
    setIntroDone(true);
  }} 
  >{children}</button>

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
          <StartButton >Let&apos;s hear it!</StartButton>
        </Link>
        <span>- or -</span>
        <Link href="story">
          <StartButton >Hear use case</StartButton>
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
