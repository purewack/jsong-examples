import PlayerNav from '@/components/PlayerNav'
import '@/styles/globals.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import type { AppProps } from 'next/app'
import { Dispatch, MutableRefObject, SetStateAction, createContext, use, useEffect, useReducer, useRef, useState } from 'react'
import JSONg from 'jsong-audio';
import { usePathname } from 'next/navigation';
import { StateEvent } from 'jsong-audio/dist/types/events';
export const PlayerContext = createContext<JSONg | null>(null)

export default function App({ Component, pageProps }: AppProps) {
  
  const [player, setPlayer] = useState<JSONg | null>(null)
  const [pending, setPending] = useState(false);

  useEffect(()=>{
    if(player) return 

    const _player = new JSONg()
    _player.output.volume.value = -6
    setPlayer(_player)
    
    
    const willstart = ()=>{
      setPending(true);
    }
    const didstart = ()=>{
      setPending(false);
    }
    const cancelstart = ()=>{
      setPending(false);
    }

    _player.addEventListener('queue', willstart);
    _player.addEventListener('change', didstart);
    _player.addEventListener('cancel', cancelstart);

    _player.addEventListener('state', (ev)=>{
      console.info("[jsong-state]",ev.stateOld,"->",ev.stateNow)
    })
    return ()=>{
      _player.removeEventListener('queue', willstart);
      _player.removeEventListener('change', didstart);
      _player.removeEventListener('cancel', cancelstart);
      _player.stop(false)
      setPlayer(null);
    }
  },[])

  const path = usePathname();

  return player && <>
      <PlayerContext.Provider value={player}>
      <PlayerNav show={path !== '/'} pending={pending}/>
      <Component {...pageProps} />
      </PlayerContext.Provider>
  </>
}
