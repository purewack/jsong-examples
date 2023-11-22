import Head from "next/head"
import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "./_app"
import style from '@/styles/content.module.css'
import clsx from "clsx";
import SectionSlide from "@/components/SectionSlide";
import JSONg from "jsong-audio";

export default function Content(){

  const [section, setSection] = useState('');
  const [navList, setNavList] = useState({
    intro: false,
    intro2: false,
    bridge: false,
    chorus: false
  })
  
  const player = useContext(PlayerContext) as JSONg;
  const [nowPlaying, setNowPlaying] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(()=>{
    const willStart = () => {
        setPending(true);
    }
    const didStart = () => {
        setNowPlaying(player.playingNow?.name)
        setSection(player.playingNow?.name)
        setPending(false);
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
},[])

  const sectionInView = (section: number[])=>{
    player.play(section)
  }

  return (
    <>
      <Head>
        <title>JSONg Audio: {pending ? '...' : ''}{nowPlaying}</title>
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
        <SectionSlide tag='A' className={clsx(style.A)}>
          <h1 className={'title'}>
            An Interactive Music format...
          </h1>
          <button onClick={()=>{
            player.play();
          }}>Next</button>
          {/* <p>{nowPlaying}</p> */}
        </SectionSlide>

        <SectionSlide tag='B' onInView={()=>{sectionInView([1])}} className={clsx(style.B)}>
          <h1 className={'title'}>
            ...responding to your actions!
          </h1>
          <button onClick={()=>{
            player.play([4]);
          }}>Next</button>
        </SectionSlide>

        {<SectionSlide type="side">
          <SectionSlide tag='C' onInView={()=>{sectionInView([3])}} className={clsx(style.C)}>
            <h1 className={'title'}>
              JSONg audio format allows for multiple tracks.
            </h1>
          </SectionSlide>

          {<SectionSlide tag='D' onInView={()=>{sectionInView([4])}} className={clsx(style.D)}> 
            <h1 className={'title'}>
              Music playback can be changed dynamically.
            </h1>
          </SectionSlide>}
        </SectionSlide>}
      </SectionSlide>
    </>
  )
}