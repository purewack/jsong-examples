import {CSSProperties, useContext, useEffect, useRef, useState } from "react"
import JSONg from 'jsong';
import style from '@/styles/nav.module.css'

import clsx from "clsx";
import { PlayerContext } from "@/pages/_app";

export default function PlayerNav({show=true, pending=false}){

    const jsongplayer = useContext<JSONg>(PlayerContext);
    const [playerState, setPlayerState] = useState(null)
    const [loopProgress, setLoopProgress] = useState([0,0]);
    const isPlaying = playerState === 'playing';
    const [isMute, setIsMute] = useState(false);
    const [nowPlaying, setNowPlaying] = useState('')
    
    useEffect(()=>{
        const player = jsongplayer.current
        const onstate = (e)=>{
            console.log('new state', e.detail)
            setPlayerState(e.detail)
        } 
        const ontransport = (e)=>{
            const {position, loopBeatPosition} = e.detail
            console.log(loopBeatPosition[0])
            if(loopBeatPosition){
                setLoopProgress(loopBeatPosition);
            }
        }
        const onsectionstart = ()=>{
            console.log('play', player?.playingNow?.name);
            setNowPlaying(player?.playingNow?.name)
        }
        player.addEventListener('onTransport', ontransport)
        player.addEventListener('onStateChange',onstate)
        player.addEventListener('onSectionPlayStart', onsectionstart)

        console.log('add');
        return ()=>{
            console.log('rm');
            player.removeEventListener('onTransport', ontransport)
            player.removeEventListener('onStateChange',onstate)
            player.removeEventListener('onSectionPlayStart', onsectionstart)
        }
    },[])


    const nodeRef = useRef(null);
    return <nav ref={nodeRef} className={clsx(style.nav, true && style.show, pending && style.pending)}>
        <h2>JSONg</h2>
        <span className={style.progress} style={{
            '--progress': isPlaying ? (1+loopProgress[0]) / loopProgress[1] : 0
        } as CSSProperties}>
            {isPlaying ? 
                <>{nowPlaying} : {loopProgress[0] + 1} / {loopProgress[1]}</>
            : playerState }
        </span>
{/*     
        <button onClick={()=>{player.stop()}}>Stop</button>
        <span className={'material-symbols-outlined'} onClick={()=>{
            setIsMute(m => {
                if(!m) player.muteAll()
                else player.unMuteAll()
                return !m;
            })
        }}>{isPlaying && !isMute ? 'volume_up' : 'volume_off'}</span> */}
    </nav>
}