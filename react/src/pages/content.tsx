import Head from "next/head"
import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "./_app"
import style from '@/styles/content.module.css'
import clsx from "clsx";
import SectionSlide from "@/components/SectionSlide";

export default function Content(){

  const [section, setSection] = useState('');
  // useEffect(()=>{
  //   console.log('=========section',section);
  // },[section])

  const jsongplayer = useContext(PlayerContext);
  const [nowPlaying, setNowPlaying] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(()=>{
    const player = jsongplayer.current;
    const willStart = () => {
        setPending(true);
    }
    const didStart = () => {
        setNowPlaying(player.playingNow?.name)
        setSection(player.playingNow?.name)
        setPending(false);
    }
    const transport = (e) => {
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

  const play = (section: number[])=>{
    console.log('++++++++++playing section', section)
    jsongplayer.current.play(section)
  }


  return (
    <>
      <Head>
        <title>JSONg Audio: {pending ? '...' : ''}{nowPlaying}</title>
      </Head>

      <SectionSlide type='down'>
        <SectionSlide tag='A' className={clsx(style.A)}>
          <h1 className={'title'}>
            An Interactive Music format...
          </h1>
          <button onClick={()=>{
            jsongplayer.current.play();
          }}>Next</button>
          {/* <p>{nowPlaying}</p> */}
        </SectionSlide>

        <SectionSlide tag='B' onInView={()=>{play([1])}} className={clsx(style.B)}>
          <h1 className={'title'}>
            ...responding to your actions!
          </h1>
          <button onClick={()=>{
            jsongplayer.current.play([4]);
          }}>Next</button>
        </SectionSlide>

        {<SectionSlide type="side">
          <SectionSlide tag='C' onInView={()=>{play([3])}} className={clsx(style.C)}>
            <h1 className={'title'}>
              JSONg audio format allows for multiple tracks.
            </h1>
          </SectionSlide>

          {<SectionSlide tag='D' onInView={()=>{play([4])}} className={clsx(style.D)}> 
            <h1 className={'title'}>
              Music playback can be changed dynamically.
            </h1>
          </SectionSlide>}
        </SectionSlide>}
      </SectionSlide>
    </>
  )
}