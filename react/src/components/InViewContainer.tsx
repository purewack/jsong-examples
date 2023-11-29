import {useEffect} from 'react'
import { useInView } from "react-intersection-observer";

export default function InViewContainer({children, className = '', once = false, onInView}){
    const { inView, ref, entry } = useInView({threshold: 0.75, triggerOnce: once});
   
    useEffect(()=>{
        if(inView) {onInView?.()}
    },[inView])

    return <div ref={ref} className={className}>
        {children}
    </div>
}