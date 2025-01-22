import {CSSProperties, useContext, useEffect, useRef, useState } from "react"
import style from '@/styles/nav.module.css'

import clsx from "clsx";
import { PlayerContext } from "@/pages/_app";
import JSONg from "jsong-audio";
import { ChangeEvent, StateEvent, TransportEvent } from "jsong-audio/dist/types/events";

export default function PlayerNav({show=true, pending=false}){

    const player = useContext(PlayerContext) as JSONg;
    const [playerState, setPlayerState] = useState('')
    const [loopProgress, setLoopProgress] = useState([0,0]);
    const isPlaying = playerState === 'playing';
    const [isMute, setIsMute] = useState(false);
    const [nowPlaying, setNowPlaying] = useState('')
    
    useEffect(()=>{
        const onstate = (e: StateEvent)=>{
            setPlayerState(e.stateNow || '')
        } 
        const ontransport = (e: TransportEvent)=>{
            // console.log(e.progress)
            player.audioSafeCallback(()=>{
            setLoopProgress(e.progress);
            })   
        }
        const onsectionstart = (e: ChangeEvent)=>{
            setNowPlaying(e.to?.name || '')
        }
        player.addEventListener('transport', ontransport)
        player.addEventListener('state',onstate)
        player.addEventListener('change', onsectionstart)

        return ()=>{
            player.removeEventListener('transport', ontransport)
            player.removeEventListener('state',onstate)
            player.removeEventListener('change', onsectionstart)
        }
    },[])


    const nodeRef = useRef(null);
    return <nav ref={nodeRef} className={clsx('capitalize select-none',style.nav, true && style.show, pending && style.pending)}>
        <h2 className={clsx(style.title)}>JSONg</h2>
        <div>
        <span className={clsx(style.progress,'after:bg-green-300 opacity-40')} style={{
            '--progress': isPlaying ? (loopProgress[0]) / loopProgress[1] : 0
        } as CSSProperties}>
            {isPlaying ? 
                <>{nowPlaying} : {loopProgress[0]} / {loopProgress[1]}</>
            : playerState }
        </span>
     
        {/* <button onClick={()=>{player.stop()}}>Stop</button> */}
        <span className={clsx('material-symbols-outlined w-16 text-right', style.vol)} onClick={()=>{
            setIsMute(m => {
                if(!m) player.mute()
                else player.unmute()
                return !m;
            })
        }}>{!isMute ? 'volume_up' : 'volume_off'}</span>
        </div>
    </nav>
}