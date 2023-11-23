import style from '@/styles/slide.module.css'
import clsx from 'clsx'

type NextDirection = 'down' | 'left' | 'right' | 'up'

export default function SectionNext({direction = 'down'} : {direction?: NextDirection}){
    return <span className={clsx(style.next ,style[direction])}>
        ⟫
    </span>
}