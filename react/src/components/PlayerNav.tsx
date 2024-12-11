import {CSSProperties, useContext, useEffect, useRef, useState } from "react"
import style from '@/styles/nav.module.css'

import clsx from "clsx";
import { PlayerContext } from "@/pages/_app";
import JSONg from "jsong-audio";

export default function PlayerNav({show=true, pending=false}){

    const player = useContext(PlayerContext) as JSONg;
    const [playerState, setPlayerState] = useState(null)
    const [loopProgress, setLoopProgress] = useState([0,0]);
    const isPlaying = playerState === 'playing';
    const [isMute, setIsMute] = useState(false);
    const [nowPlaying, setNowPlaying] = useState('')
    
    useEffect(()=>{
        const onstate = (e: CustomEvent)=>{
            setPlayerState(e.detail)
        } 
        const ontransport = (e: CustomEvent)=>{
            const {position, loopBeatPosition} = e.detail
            if(loopBeatPosition){
                setLoopProgress(loopBeatPosition);
            }
        }
        const onsectionstart = ()=>{
            setNowPlaying(player?.playingNow?.name)
        }
        player.addEventListener('onTransport', ontransport)
        player.addEventListener('onStateChange',onstate)
        player.addEventListener('onSectionDidStart', onsectionstart)

        return ()=>{
            player.removeEventListener('onTransport', ontransport)
            player.removeEventListener('onStateChange',onstate)
            player.removeEventListener('onSectionDidStart', onsectionstart)
        }
    },[])


    const nodeRef = useRef(null);
    return <nav ref={nodeRef} className={clsx(style.nav, true && style.show, pending && style.pending)}>
        <h2 className={style.title}>JSONg</h2>
        <div>
        <span className={style.progress} style={{
            '--progress': isPlaying ? (1+loopProgress[0]) / loopProgress[1] : 0
        } as CSSProperties}>
            {isPlaying ? 
                <>{nowPlaying} : {loopProgress[0] + 1} / {loopProgress[1]}</>
            : playerState }
        </span>
     
        <button onClick={()=>{player.stop()}}>Stop</button>
        <span className={clsx('material-symbols-outlined', style.vol)} onClick={()=>{
            setIsMute(m => {
                if(!m) player.muteAll()
                else player.unMuteAll()
                return !m;
            })
        }}>{isPlaying && !isMute ? 'volume_up' : 'volume_off'}</span>
        </div>
    </nav>
}