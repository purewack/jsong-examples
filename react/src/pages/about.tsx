import Head from "next/head"
import { useRouter } from "next/router";
import React, { ElementType, JSXElementConstructor, ReactElement, useContext, useEffect, useState } from "react"
import clsx from "clsx";
import _ from 'lodash'

import { PlayerContext } from "./_app"
import Scroller from "@/components/Scroller";

import { ChangeEvent, QueueEvent, TransportEvent } from "jsong-audio/dist/types/events";
import JSONg from "jsong-audio";
import { json } from "stream/consumers";

type TimingInfo = {tick:number, sBeat: number}

export default function AboutPage(){

  const player = useContext(PlayerContext) as JSONg;  
  
  const router = useRouter()
  useEffect(()=>{
    if(player.audioContext.state !== 'running')
      router.push('/')
    else
      player.play([0])
  },[])
  
  const [timing,setTiming] = useState<TimingInfo>({tick:0, sBeat:0})

  const [playing, setNowPlaying] = useState(-1);
  const [pending, setPlayingPending] = useState(-1);
  useEffect(()=>{
    const willStart = (ev: QueueEvent) => {
      if(ev.to)
        setPlayingPending(ev.to?.index[0]);
    }
    const didStart = (ev: ChangeEvent) => {
      setPlayingPending(-1)
      if(ev.to)
        setNowPlaying(ev.to?.index[0]);
    }
    const transport = (e: TransportEvent) => {
      // setTick(e.progress[0])
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

  function start(index: number){
    if(player.state === 'stopped')
      player.play([index])
    else
      player.continue([index])
  }
  const queuedStyle = '!bg-yellow-300 !border-yellow-800 text-yellow-950 animate-pulse duration-300'
  const notActive = 'bg-indigo-300 border-indigo-800 text-white'
  
  return (
    <div className={clsx('pageenter min-h-screen  font-josefin font-normal')}>
      <Head>
        <title>About JSONg Audio</title>
      </Head>
      
      <h1 className="text-6xl p-12 bg-yellow-100 text-orange-900 border-r-[2rem] border-orange-900">How it works?</h1>
      <article className="font-thin text-2xl max-w-[90ch] mx-auto p-12">
        <p className="">
          This format is designed specifically to provide dynamic instructions to a dynamic music interpreter (a JSONg player) on how to manage tracks, volumes, looping and user interactions.
          <br/><br/>
          The .jsong file itself has instructions on how to playback the music based on dynamic user input events, such as a page scroll, or mouse hover...
          <br/><br/>
          The .jsong file can also contain music encoded as data URI to allow a standalone, single file approach.
          <br/><br/>
          JSONg is modelled after <a className="underline transition-colors hover:text-green-400" href="https://www.ableton.com/en/">Ableton Live's</a> playback handling abilities.
        </p>

        <h2 className="py-8 text-4xl font-thin underline">Example definition:</h2>
        <div className="mx-auto grid grid-cols-2 items-center">
          <ExampleJSONgFile/>
          <div>
            <p className="p-4 text-right">
              The file contains a number of section. 
              <br/>
              The most important section is <b className="font-bold">Playback</b>,
              where the tempo, time signature and section outlines live.
            </p>
            
            <p className="p-4 text-right">
              Each section has a start bar number and an end bar number
              <br/>
              In this example <code>"into"</code> starts at bar 0 and end at bar 1, giving a 1 bar section.
            </p>

            <section className="flex flex-col gap-2 items-end">
              Here you can select which sections should play:
              <button onClick={()=>start(0)} className={clsx("w-[10ch]", pending === 0 && queuedStyle, playing !== 0 && notActive)}>Play: Intro</button>
              <button onClick={()=>start(1)} className={clsx("w-[10ch]", pending === 1 && queuedStyle, playing !== 1 && notActive)}>Play: Intro-2</button>
              <button onClick={()=>start(2)} className={clsx("w-[10ch]", pending === 2 && queuedStyle, playing !== 2 && notActive)}>Play: Verse</button>
              <button onClick={()=>start(3)} className={clsx("w-[10ch]", pending === 3 && queuedStyle, playing !== 3 && notActive)}>Play: Bridge</button>
              <button onClick={()=>start(4)} className={clsx("w-[10ch]", pending === 4 && queuedStyle, playing !== 4 && notActive)}>Play: Chorus</button>
            </section>
          </div>
        </div>
        <br/>
        <p className='text-center'>A whole lot more information about how to use the library can be found at the <a className="underline transition-colors hover:text-green-400" href="https://github.com/purewack/jsong-audio">GitHub page</a></p>
      </article>


      <h1 className="text-6xl p-12 bg-green-100 text-green-900 border-r-[2rem] border-green-900">Why use it?</h1>
      <article className="font-thin text-2xl max-w-[90ch] mx-auto p-12">
        <section>
          <h2 className="py-8 text-4xl font-thin underline">
          Seamless Integration of Music and Interactivity
          </h2>
          <p>
          The library provides an easy way to integrate music into web apps with precision timing, allowing developers to sync music sections with app functionality. This could be essential for:
          </p>
          <ul className="list list-inside list-disc">
            <li className="list-item p-2">Games needing dynamic soundtracks that respond to player actions.</li>
            <li className="list-item p-2">Apps where music enhances user experience, such as guided meditations or fitness apps, web page presentations...</li>
            <li className="list-item p-2">Educational apps can use music transitions to emphasize key concepts.</li>
            <li className="list-item p-2">Marketing websites can create dynamic, music-enhanced product tours.</li>
          </ul>
        </section>

        <section>
          <h2 className="py-8 text-4xl font-thin underline">
          Event-Driven Music Control
          </h2>
          <p>
          The library emits events for timing, section transitions, and state changes, making it ideal for apps that need real-time updates tied to audio:
          </p>
          <ul className="list list-inside list-disc">
            <li className="list-item p-2">Reacting to beats and section changes with animations or visual effects</li>
            <li className="list-item p-2">Synchronizing gameplay or user interactions with music for immersive experiences.</li>
            <li className="list-item p-2">Games where different loops create a sense of progression or tension.</li>
          </ul>
        </section>


        <section>
          <h2 className="py-8 text-4xl font-thin underline">
          Event-Driven Music Control
          </h2>
          <p>
          The library emits events for timing, section transitions, and state changes, making it ideal for apps that need real-time updates tied to audio:
          </p>
          <ul className="list list-inside list-disc">
            <li className="list-item p-2">Reacting to beats and section changes with animations or visual effects</li>
            <li className="list-item p-2">Synchronizing gameplay or user interactions with music for immersive experiences.</li>
            <li className="list-item p-2">Games where different loops create a sense of progression or tension.</li>
          </ul>
        </section>

        <section>
          <h2 className="py-8 text-4xl font-thin underline">
          Focus on Creativity, Not Boilerplate
          </h2>
          <p>
          The library abstracts away technical challenges like managing audio buffers or timing, allowing developers to focus on creative implementations:
          </p>
          <ul className="list list-inside list-disc">
            <li className="list-item p-2">Designing unique user interactions tied to music.</li>
            <li className="list-item p-2">Experimenting with innovative uses of audio in their apps.</li>
          </ul>
        </section>
      </article>
    </div>
  )
}


function ExampleJSONgFile(){
  const text = `
{
  "type": "jsong",
  "version": "J/1",
  "meta": {
    "title": "Intro to JSONg",
    "author": "Damian Nowacki",
    "createdOn" : "20231108",
    "timestamp" : "",
    "projectVersion": "1.0.0",
    "createdUsing": ""
  },
  "playback": {
    "bpm": 109.0,
    "meter": [6,8],
    "metronome": ["B5","G4"],
    "metronomeDB": -3,
    "grain": 12,
    "map": {
      "intro" : [0, 1],
      "intro2" : [1, 3],
      "verse" : [3, 5],
      "bridge" : [5, 7],
      "chorus" : [7, 11]
    },
    "flow": [
      "intro", 
      "intro2", 
      "verse", 
      "bridge",
      "chorus" 
    ]
  },
  "tracks": [
    {"name": "drum"},
    {"name": "bass"},
    {"name": "melody" }
  ],
  "sources" : {
    "bass" : "./bass.mp3",
    "drum" : "./drum.mp3",
    "melody": "./melody.mp3"
  }
}
  `

  return <code className="text-sm  text-gray-100 bg-gray-800 rounded-lg p-2 max-h-[60vh] overflow-scroll"><pre>{text}</pre></code>
}