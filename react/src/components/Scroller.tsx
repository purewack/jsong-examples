import clsx from "clsx"
import React, { ReactElement, useEffect } from "react"


export default function Scroller({direction, currentIndex, children}:{direction: string, currentIndex:number ,children: ReactElement<any, any>[]}){
  
  const natural   = direction === 'right' || direction === 'down'
  const start = !natural ? React.Children.count(children) : 0
  const hoz   = direction === 'left' || direction === 'right'
  const dirFlex = (direction === 'left' && 'flex-row-reverse') || (direction === 'down' && 'flex-col') || (direction === 'up' && 'flex-col-reverse')

  return <article className="relative w-screen h-screen overflow-hidden">
    <div
      className={clsx("slides flex transition-transform h-max w-max", dirFlex)}
      style={{ transform: `translate${hoz ? 'X' : 'Y'}(-${(start ? (start-1 - currentIndex) : currentIndex) * 100}v${hoz ? 'w' : 'h'})` }}
    >
      {children}
    </div>
  </article>
}
