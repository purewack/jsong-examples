import styles from '@/styles/slide.module.css'
import clsx from 'clsx';
import { Props } from 'next/script';
import { CSSProperties, ReactNode, useEffect } from 'react';
import { InView, useInView } from 'react-intersection-observer';
export type SlideType = 'slide' | 'side' | 'down';

export default function SectionSlide({type = 'slide', className='', onInView, tag='', style, children} 
: {
    children: ReactNode, 
    type?: SlideType,
    className?:string, 
    tag?: string,
    style?: CSSProperties,
    onInView?:(tag:string)=>void
}){
    const { inView, ref, entry } = useInView({threshold: 0.5});
   
    useEffect(()=>{
        if(inView) onInView?.(tag)
    },[inView])

    return (type === 'side' || type === 'down') ? <article style={style} className={clsx(className,styles.gallery, styles[type], styles.snap, 'fullpage')}>
        {children}
    </article>
    :
    <section style={style} ref={ref} className={clsx('fullpage central ',styles.slide,styles.snap,className)}>
        {children}
    </section>
}