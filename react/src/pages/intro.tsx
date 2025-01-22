import Head from "next/head"
import { useRouter } from "next/router";
import React, { ElementType, JSXElementConstructor, ReactElement, useContext, useEffect, useRef, useState } from "react"
import clsx from "clsx";
import _ from "lodash"

import { PlayerContext } from "./_app"
import Scroller from "@/components/Scroller";

import { ChangeEvent, QueueEvent, TransportEvent } from "jsong-audio/dist/types/events";
import JSONg from "jsong-audio";

type TimingInfo = {tick:number, sBeat: number, queued: boolean}

export default function AboutPage(){

  const player = useContext(PlayerContext) as JSONg;

  //quick check to see if audio context is started, else nav back to home page
  const router = useRouter()
  useEffect(()=>{
    if(player.audioContext.state !== 'running')
      router.push('/')
    else
      player.play([0])
  },[])



  const [timing,setTiming] = useState<TimingInfo>({tick:-3, sBeat:0, queued:false})
  const [nowPlaying, setNowPlaying] = useState('');
  const [playingPending, setPlayingPending] = useState(false);

  useEffect(()=>{
    const willStart = (ev: QueueEvent) => {
        setPlayingPending(true);
        setTiming(t => ({...t,queued:true}))
    }
    const didStart = (ev: ChangeEvent) => {
        const name = ev.to?.name || ''
        setNowPlaying(name)
        setPlayingPending(false);
        setTiming(t => ({...t,queued:false}))
    }
    const transport = (e: TransportEvent) => {
      setTiming(t => ({...t,sBeat:e.progress[0], tick: t.tick+1}))
    }

    player.addEventListener('queue', willStart);
    player.addEventListener('change', didStart);
    player.addEventListener('transport', transport);
    return ()=>{
      player.removeEventListener('queue', willStart);
      player.removeEventListener('change', didStart);
      player.removeEventListener('transport', transport);
    }
  },[player])


  const [index, setIndex] = useState([0,0,0])
  function toSlide(i: number[]){
    player.continue().then(()=>{
      setIndex(i)
      setTiming({...timing, tick:0})
    })
  }

  function revealInfo(){
    router.push('/about')
  }

  return (
    <div className={clsx('pageenter min-h-screen')}>
      <Head>
        <title>JSONg Audio {playingPending ? '...' : '-'}{nowPlaying.toUpperCase()}</title>
      </Head>
      
      {<Scroller direction="right" currentIndex={index[0]}>
        <Slide1 timing={timing} ready={_.isEqual(index,[0,0,0])} onNext={()=>toSlide([1,0,0])}></Slide1>
        <Scroller direction="down" currentIndex={index[1]}>
          <Slide2 timing={timing} ready={_.isEqual(index,[1,0,0])} onNext={()=>toSlide([1,1,0])}></Slide2>
          <Scroller direction="left" currentIndex={index[2]}>
            <Slide3 timing={timing} ready={_.isEqual(index,[1,1,0])} onNext={()=>toSlide([1,1,1])}></Slide3>
            <Slide4 timing={timing} ready={_.isEqual(index,[1,1,1])} onNext={revealInfo}></Slide4>
          </Scroller>
        </Scroller>
      </Scroller>}
      {/* <nav className="absolute bottom-0 w-full flex justify-between">
      <button onClick={()=>setTiming({...timing,tick:timing.tick+1})}>Tick {timing.tick}</button>
      <button onClick={()=>setTiming({...timing,tick:0, sBeat:0})}>Reset</button>
      <button onClick={()=>setTiming({...timing,sBeat:(timing.sBeat+1) % 12})}>Beat {timing.sBeat}</button>
      </nav> */}
    </div>
  )
}


function Slide1({timing, ready, onNext}: {timing: TimingInfo, ready:boolean, onNext:()=>void}){
  const [reveal, setReveal] = useState(0)

  useEffect(()=>{
    if(!ready) return
    if(timing.tick > reveal)
    setReveal(timing.tick)
  },[timing, ready])

  const words = ['An','Interactive','Music','Format...']

  return <div className="flex justify-center items-center bg-blue-300 text-blue-500 w-screen h-screen"> 
    <div className="text-left p-8">
      {words.map((w,i) => 
      <span key={w+i} className={clsx("text-8xl title", reveal < i+1 ? 'opacity-0' : 'transition-opacity duration-300')}>{w} </span>
      )}
    </div>
    <i onClick={onNext} className={clsx(timing.queued && 'animate-spin', reveal < 7 && 'opacity-0', 'transition-opacity duration-300 bi bi-arrow-right-square-fill text-5xl p-4')}></i>
  </div>
}

function Slide2({timing, ready, onNext}: {timing: TimingInfo, ready:boolean, onNext:()=>void}){
  const [reveal, setReveal] = useState(0)

  useEffect(()=>{
    if(!ready) return
    if(timing.tick > reveal)
    setReveal(timing.tick)
  },[timing, ready])

  const words = ['...Responding','to','your','Actions !']

  return <div className="flex flex-col justify-center items-center  bg-indigo-500 text-indigo-200 w-screen h-screen"> 
    <div className="text-center flex flex-col">
      {words.map((w,i) => 
      <span key={w+i} className={clsx("text-8xl title", reveal < i+1 ? 'opacity-0' : 'transition-opacity duration-300')}>{w} </span>
      )}
    </div>
    <i onClick={onNext} className={clsx(timing.queued && 'animate-spin', reveal < 8 && 'opacity-0', 'transition-opacity duration-300 bi bi-arrow-down-square-fill text-5xl p-4')}></i>
  </div>
}

function Slide3({timing, ready, onNext}: {timing: TimingInfo, ready:boolean, onNext:()=>void}){
  const [reveal, setReveal] = useState(0)

  useEffect(()=>{
    if(!ready) return
    if(timing.tick > reveal)
    setReveal(timing.tick)
  },[timing, ready])

  const words = ['D','y','n','a','m','i','c']

  return <div className="flex flex-col justify-center items-center  bg-yellow-300 text-orange-800  w-screen h-screen"> 
    <div className={clsx("text-center title transition-colors duration-300 ", timing.sBeat === 3 && 'text-white')}>Become</div>
    <div className="text-center flex">
      {words.map((w,i) => 
      <span key={w+i} className={clsx("text-8xl", timing.sBeat === i+1 && 'scale-50',  'origin-bottom transition-transform duration-150')}>{w}</span>
      )}
    </div>
    <div className={clsx("text-center title transition-colors duration-300 ", timing.sBeat === 5 && 'text-white')}>Easily</div>
    <i onClick={onNext} className={clsx(timing.queued && 'animate-spin', reveal < 8 && 'opacity-0', 'transition-opacity duration-300 bi bi-arrow-left-square-fill text-5xl p-4')}></i>
  </div>
}



export function Slide4({timing, ready, onNext}: {timing: TimingInfo, ready:boolean, onNext:()=>void}){
  const [reveal, setReveal] = useState(0)

  useEffect(()=>{
    if(!ready) return
    if(timing.tick/2 > reveal)
    setReveal(timing.tick/2)
  },[timing, ready])
  const words = ['JSONg','audio','has']
  const words2 = ['multiple','audio','tracks!']

  const [ending, setEnding] = useState(false)
  function finalize(){
    player.trackVolumeControls['drum'].volume.rampTo(0,1)
    player.trackVolumeControls['bass'].volume.rampTo(0,1)
    player.trackVolumeControls['melody'].volume.rampTo(0,1)
    player.continue()
    setEnding(true)
    setTimeout(()=>{onNext()},1200)
  }

  const player = useContext(PlayerContext) as JSONg;

  const targetRef = useRef(null)
  const [faderValue, setFaderValue] = useState(0)
  function fader(ev: any){
    if(ending) return
    if(timing.tick < 4) return
    if(!targetRef.current) return
    const t = targetRef.current as HTMLElement
    const r = t.getBoundingClientRect();
    const f = 2*((ev.clientX/r.width)-0.5)
    setFaderValue(f)

    const bVol = Math.min(0,60 - ((1+f)* 60));
    const aVol = Math.min(0,60 - ((1-f)* 60));

    console.log(f)

    player.trackVolumeControls['bass'].volume.linearRampTo(aVol,0.05)
    player.trackVolumeControls['melody'].volume.linearRampTo(bVol,0.05)
  }

  return <div ref={targetRef} onMouseMove={fader} className="relative w-screen h-screen"> 
    <section  className={clsx("absolute left-0 top-0 w-1/2 h-full bg-green-300 text-green-800 grid place-items-center transition-transform duration-1000",ending && '-translate-x-full')}>
      <div className="text-right flex flex-col origin-right" style={{scale:75 + 25*(Math.max(0,-faderValue)) + '%'}}>
        {words.map((w,i) => 
        <span key={w+i} className={clsx("text-8xl title", reveal < i+1 ? 'opacity-0' : 'transition-opacity duration-300')}>{w} </span>
        )}
      </div>
    </section>
    <section className={clsx("absolute right-0 top-0 w-1/2 h-full text-green-300 bg-green-800 grid place-items-center transition-transform duration-1000",ending && 'translate-x-full')}>
        <div className="text-left flex flex-col origin-left" style={{scale:75 + 25*(Math.max(0,faderValue)) + '%'}}>
        {words2.map((w,i,a) => 
        <span key={w+i} className={clsx("text-8xl title", reveal < (a.length-i) ? 'opacity-0' : 'transition-opacity duration-300')}>{w} </span>
        )}
      </div>
    </section>
    <i onClick={finalize} className={clsx(reveal < 4 && 'opacity-0',ending && 'translate-y-60', 'border-4 border-green-600 rounded-lg absolute bottom-8 left-1/2 -translate-x-1/2 transition-all  duration-500 bi bi-arrow-left-right text-6xl p-1 text-green-600 mix-blend-exclusion')}></i>
  </div>
}
