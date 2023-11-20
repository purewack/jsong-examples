import PlayerNav from '@/components/PlayerNav'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Dispatch, MutableRefObject, SetStateAction, createContext, useEffect, useReducer, useRef, useState } from 'react'
import JSONg from 'jsong-audio';
import { usePathname } from 'next/navigation';

export const PlayerContext = createContext<JSONg>(null)

export default function App({ Component, pageProps }: AppProps) {
  
  const player = useRef<JSONg>(null);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(()=>{
    if(player?.current) return;

    const p = new JSONg();
    player.current = p;
    p.parse('test_song2').then((reason)=>{
      if(reason === 'loading_full'){
      console.log('Full Load play')
      // p.play();
      setReady(true);
      }
    })
    p.addEventListener('onSectionWillStart',()=>{
      setPending(true);
    })
    p.addEventListener('onSectionPlayStart',(e)=>{
      setPending(false);
      console.log('start',e.detail.index)
    })
    p.addEventListener('onSectionCancelChange', ()=>{
      setPending(false);
    })
  },[])

  const path = usePathname();

  return player && ready && <>
    <PlayerContext.Provider value={player.current}>
      <PlayerNav show={path !== '/'} pending={pending}/>
      <Component {...pageProps} pending={pending}/>
    </PlayerContext.Provider>
  </>
}
