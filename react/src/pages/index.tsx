import { Dispatch, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react'

import Head from 'next/head';
import Link from 'next/link';
import { PlayerContext } from './_app';
import JSONg from 'jsong-audio';
import clsx from 'clsx';
import { useRouter } from 'next/router';

export default function Home() {
  const route = useRouter()

  const player = useContext(PlayerContext) as JSONg;

  const StartButton = ({children, href} : {children : ReactNode, href:string})=>
  <button
  onClick={async ()=>{
    const m = await player.parseManifest('aboutit.jsong')
    if(m)
    await player.useManifest(m)
    route.push(href)
  }} 
  >{children}</button>

  return (
    <>
      <Head>
        <title>JSONg Audio</title>
      </Head>
      <main className={clsx( 'pageenter', 'fullpage', 'central')}>
        <h1 className={'title'}>
          What is JSONg Audio?
        </h1>
        <StartButton href='/intro'>Let&apos;s hear about it!</StartButton>
        <span>- or -</span>
        <StartButton href='/about'>Read about it</StartButton>
      </main>
    </>
  )
}
