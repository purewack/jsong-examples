import {useEffect, type ReactNode} from 'react'
import { useInView } from "react-intersection-observer";

export default function InViewContainer({children, className = '', once = false, onInView}: {children?: ReactNode, className?: string, once?: boolean, onInView?: ()=>void}){
    const { inView, ref, entry } = useInView({threshold: 0.1, triggerOnce: once});
   
    useEffect(()=>{
        if(inView) {onInView?.()}
    },[inView, onInView])

    return <div ref={ref} className={className}>
        {children}
    </div>
}