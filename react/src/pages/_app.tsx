import PlayerNav from '@/components/PlayerNav'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Dispatch, MutableRefObject, SetStateAction, createContext, use, useEffect, useReducer, useRef, useState } from 'react'
import JSONg from 'jsong-audio';
import { VerboseLevel } from 'jsong-audio/dist/JSONg';
import { usePathname } from 'next/navigation';

export const PlayerContext = createContext<JSONg | null>(null)

export default function App({ Component, pageProps }: AppProps) {
  
  const [player, setPlayer] = useState<JSONg | null>(null)
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(()=>{
    setPlayer(new JSONg(VerboseLevel.all))
  },[])

  useEffect(()=>{
    if(!player) return 
    setReady(true);
    const willstart = ()=>{
      setPending(true);
    }
    const didstart = (e: CustomEvent)=>{
      setPending(false);
      console.log('start',e.detail.index)
    }
    const cancelstart = ()=>{
      setPending(false);
    }
    player.addEventListener('onSectionWillStart', willstart);
    player.addEventListener('onSectionDidStart', didstart);
    player.addEventListener('onSectionCancelChange', cancelstart);

    return ()=>{
      player.removeEventListener('onSectionWillStart', willstart);
      player.removeEventListener('onSectionDidStart', didstart);
      player.removeEventListener('onSectionCancelChange', cancelstart);
      player.stop(0);
      setPlayer(null);
    }
  },[player])

  const path = usePathname();

  const [introDone, setIntroDone] = useState(false)

  return ready && player && <>
    <PlayerContext.Provider value={player}>
      <PlayerNav show={path !== '/'} pending={pending}/>
      <Component {...pageProps} introDone={introDone} setIntroDone={setIntroDone}/>
    </PlayerContext.Provider>
  </>
}
