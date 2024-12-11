import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import styles from '@/styles/story.module.css'
import Image from "next/image";
import clsx from "clsx";
import { PlayerContext } from "./_app";
import { InViewHookResponse, useInView } from "react-intersection-observer";
import JSONg from "jsong-audio/src";
import InViewContainer from "@/components/InViewContainer";

export default function Story({introDone}: {introDone:boolean}){
    const player = useContext(PlayerContext) as JSONg;
    const router = useRouter()
    useEffect(()=>{
        console.log('introDone', introDone)
        if(!introDone) router.push('/');
    },[introDone])

    const {
        ref,
        inView,
        entry
    } : InViewHookResponse = useInView({threshold: 0.8})

    return introDone && <div className={clsx(styles.story, 'pageenter')}>
        {/* <button onClick={()=>{player?.play()}}>Next</button> */}

        <InViewContainer once onInView={async ()=>{
            
            // player.rampTrackVolume('lead', -24,0);
            // player.rampTrackVolume('guitar',-9,0);

            // player.rampTrackFilter('drums',0.02,0);
            // player.rampTrackFilter('bass',0.02,0);
            // player.rampTrackFilter('lead',0.10,0);
            // player.rampTrackFilter('guitar',0.10,0);

        }}>
            <section className="fullpage central">
            <h1>Once upon a time...</h1>
            </section>
        </InViewContainer>

        <InViewContainer once onInView={()=>{
            
        }} >
        <section className={clsx(styles.sideways, styles.long)}>            
            <p>There lived a guy called Frank</p>
            <img alt='groovy' src={'images/groovy.svg'}/>
        </section>
        </InViewContainer>
        
        <InViewContainer once onInView={()=>{
            // player.rampTrackFilter('drums',1, '2m')
            // player.rampTrackFilter('bass',1, '2m')
        }} >
        <section className={clsx(styles.A,styles.blob)}>
            <Divider/>
            <div className={ styles.sideways }>
                <img alt='dancing' src={'images/dancing.svg'}/>
                <p>Frank loved to listen to music</p>
            </div>
            <Divider/>
        </section> 
        </InViewContainer>
        
        <InViewContainer once onInView={()=>{
            // player.rampTrackVolume('guitar',9,1)
            // player.rampTrackFilter('guitar',1, 2)
        }} >
        <section className={clsx(styles.sideways, styles.long)}>            
            <p>When he did not walk...</p>
            <img alt='dancing' src={'images/strolling.svg'}/>
        </section>
        </InViewContainer>

        <section className={clsx(styles.B,styles.blob)}>
            <Divider/>
            <div className={ styles.sideways }>
                <img alt='ballet' src={'images/ballet.svg'}/>
                <p>He was lost in dance</p>
            </div>
            <Divider alt/>
        </section>

        <InViewContainer once onInView={()=>{
            // player.rampTrackVolume('lead',0,2)
            // player.rampTrackFilter('lead',1, 3)
        }} >
        <section className={clsx(styles.sideways, styles.long)}>            
            <p>There was not a day where he would skip music</p>
            <img alt='jumping' src={'images/jumping.svg'}/>
        </section>
        </InViewContainer>
        
        <InViewContainer once onInView={async ()=>{
            // player.rampTrackFilter('drums',0.01,2)
            // await player.play()
            // player.rampTrackFilter('drums',1,0)
        }} >
        <section className={clsx(styles.C,styles.blob)}>
            <Divider alt/>
            <div className={ styles.sideways }>
                <img alt='selfie' src={'images/selfie.svg'}/>
                <p>It was in his soul, which he shared with love</p>
            </div>
            <Divider/>
        </section>
        </InViewContainer>
        
    </div>
}

function Divider({alt = false}){
    return !alt ? 
    (<div className={clsx(styles.divider, styles.alt)}>
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" ></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" ></path>
        </svg>
    </div>
    )
    : 
    (<div className={styles.divider} >
        <svg style={{height: '100%', width: '100%'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
    </div>)
}