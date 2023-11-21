import PlayerNav from '@/components/PlayerNav'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Dispatch, MutableRefObject, SetStateAction, createContext, useEffect, useReducer, useRef, useState } from 'react'
import JSONg from 'jsong-audio';
import { usePathname } from 'next/navigation';

export const PlayerContext = createContext<MutableRefObject<JSONg>>(null)

export default function App({ Component, pageProps }: AppProps) {
  
  const player = useRef<JSONg>();
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(()=>{
    if(player?.current) return;

    const _player = new JSONg(true);
    _player.parse('silent').then((reason)=>{
      setReady(true);
    })
    _player.addEventListener('onSectionWillStart',()=>{
      setPending(true);
    })
    _player.addEventListener('onSectionDidStart',(e)=>{
      setPending(false);
      console.log('start',e.detail.index)
    })
    _player.addEventListener('onSectionCancelChange', ()=>{
      setPending(false);
    })
    player.current = _player;
  },[])

  const path = usePathname();

  return ready && <>
    <PlayerContext.Provider value={player}>
      <PlayerNav show={path !== '/'} pending={pending}/>
      <Component {...pageProps} pending={pending}/>
    </PlayerContext.Provider>
  </>
}
