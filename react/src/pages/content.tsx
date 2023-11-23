import Head from "next/head"
import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "./_app"
import style from '@/styles/content.module.css'
import clsx from "clsx";
import SectionSlide from "@/components/SectionSlide";
import JSONg from "jsong-audio";
import SectionNext from "@/components/SectionNext";
import { useRouter } from "next/router";

export default function Content({introDone}:{introDone: boolean}){
  const router = useRouter()
  useEffect(()=>{
    console.log('introDone', introDone)
    if(!introDone) router.push('/');
  },[introDone])

  const [navList, setNavList] = useState({
    intro: false,
    intro2: false,
    bridge: false,
    chorus: false
  })
  
  const player = useContext(PlayerContext) as JSONg;
  const [nowPlaying, setNowPlaying] = useState('');
  const [playingPending, setPlayingPending] = useState(false);
  useEffect(()=>{
    const willStart = () => {
        setPlayingPending(true);
    }
    const didStart = () => {
        setNowPlaying(player.playingNow?.name)
        setPlayingPending(false);
        setNavList(l => {
          return {...l, [player.playingNow.name]: true}
        })
    }
    const transport = (e: CustomEvent) => {
      // console.log('content', e.detail.loopBeatPosition)
    }

    player.addEventListener('onSectionWillStart', willStart);
    player.addEventListener('onSectionDidStart', didStart);
    player.addEventListener('onTransport', transport);
    return ()=>{
      player.removeEventListener('onSectionWillStart', willStart);
      player.removeEventListener('onSectionDidStart', didStart);
      player.removeEventListener('onTransport', transport);
    }
},[player])

  const sectionInView = (section: number[])=>{
    player.play(section)
  }

  const secActiveB = navList.intro
  const secActiveC = navList.intro && navList.intro2
  const secActiveD = navList.intro && navList.intro2 && navList.bridge
  
  return (
    <>
      <Head>
        <title>JSONg Audio: {playingPending ? '...' : ''}{nowPlaying}</title>
      </Head>

      <nav className={style.nav}>
        <ul>
          {Object.keys(navList).map(li => {
          const list = navList as {[key:string]:boolean};
          return <li key={li}>
            <input type='checkbox' readOnly checked={list[li]}></input>
          </li>})}  
        </ul>
      </nav>

      <SectionSlide type='down'>
        <SectionSlide className={clsx(style.A)}>
          <h1 className={'title'}>
            An Interactive Music format...
          </h1>
          <SectionNext />
        </SectionSlide>

        <SectionSlide style={{display: !secActiveB ? 'none' : undefined}} onInView={()=>{sectionInView([1])}} className={clsx(style.B)}>
          <h1 className={'title'}>
            ...responding to your actions!
          </h1>
          {navList.intro2 && <SectionNext />}
        </SectionSlide>

        {<SectionSlide style={{display: !secActiveC ? 'none' : undefined}} type="side" >
          <SectionSlide onInView={()=>{sectionInView([3])}} className={clsx(style.C)}>
            <h1 className={'title'}>
              JSONg audio format allows for multiple tracks.
            </h1>
            {navList.bridge && <SectionNext direction="right"/>}
          </SectionSlide>

          {<SectionSlide style={{display: !secActiveD ? 'none' : undefined}} onInView={()=>{sectionInView([4])}} className={clsx(style.D)}> 
            <h1 className={'title'}>
              Music playback can be changed dynamically.
            </h1>
          </SectionSlide>}
        </SectionSlide>}
      </SectionSlide>
    </>
  )
}