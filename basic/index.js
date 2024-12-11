import JSONg from 'jsong-audio/src'

const loaderLabel = document.getElementById("loader");
loaderLabel.innerText = 'Loading...'

const player = new JSONg(undefined,"all")

const songLoad = (song)=>{
player.loadManifest(song + '/audio.jsong').then((full)=>{
  loaderLabel.innerText = full ? 'Ready' : 'Partial Load'
}).catch((reason, data)=>{
  console.log("LOAD error",reason)
  if(reason === 'loading')
    loaderLabel.innerText = 'Error loading audio files'
  else{
    loaderLabel.innerText = 'Error parsing json file'
  }
})
}
songLoad('sample')


const state = document.getElementById("state")
player.addEventListener('onStateChange',(e)=>{
  const st = e.detail
  console.log(st)
  state.innerText = "State:" + st
})

const timeline = document.getElementById("timeline")
player.addEventListener('onTransport',(e)=>{
  const {position: pos, loopBeatPosition: section} = e.detail
  timeline.innerText = `T: ${pos} [${section[0]}/${section[1]}]`;
})
const ntimeline = document.getElementById("ntimeline")
  
const playbutton = document.getElementById("play")
playbutton.onclick = (ev) => {
  if(ev.target.innerText === 'Play')
    player.play()
  else
    player.cancel()
};

document.getElementById("stop").addEventListener("click", () => {
  player.stop()
});

document.getElementById("intro").addEventListener("click", () => {
  player.skipTo([0])
});
document.getElementById("from").addEventListener("click", () => {
  player.skipTo([1])
});

document.getElementById("offgrid").addEventListener("click", () => {
  player.skipOffGrid();
});
document.getElementById("skip").addEventListener("click", () => {
  player.skip();
});

document.getElementById("xa").addEventListener("click", () => {
  player.crossFadeTracks(['bass'],['guitar'],'1m');
});
document.getElementById("xb").addEventListener("click", () => {
  player.crossFadeTracks(['guitar'],['bass'],'1m');
});


// player.onSectionRepeat = (index, reps)=>{ 
//   document.getElementById("reps").innerText = JSON.stringify(index) + ' ' + reps
// }

const squeue = document.getElementById("prequeue")
const queue = document.getElementById("postqueue")

player.addEventListener('onSectionPlayStart' ,(e)=>{ 
  const {index} = e.detail
  queue.innerText = 'Now Playing: ' + index
  playbutton.innerText = 'Play'
})
player.addEventListener('onSectionPlayEnd' ,(e)=>{
  const {index} = e.detail
  squeue.innerText = 'Has Ended: ' + index
})
player.addEventListener('onSectionWillEnd' ,(e)=>{
  const {index} = e.detail
  if(!index) squeue.innerText = 'cancelled'
  squeue.innerText = 'Will End: ' + index
})

player.addEventListener('onSectionWillStart' ,(e)=>{
  const {index,when} = e.detail
  if(!index) {
    squeue.innerText = 'Cancelled'
    playbutton.innerText = 'Play'
  }
  else{
    queue.innerText = 'Will Play: ' + index
    ntimeline.innerText = 'NextT:' + when;
    playbutton.innerText = 'Cancel'
  }
})

player.onSectionCancelChange = ()=>{
  ntimeline.innerText = 'NextT:';
}

const onPlayerForceSection = (index)=>{
  console.log('switch to section', index)
  if(player.state === 'started')
  player.advanceSection(index)
}

const isObservingCallback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('Intersect')
      const s = entry.target.dataset?.forceSection
      if(s){
        onPlayerForceSection(JSON.parse(s))
      }
    }
  });
}

const observer100 = new IntersectionObserver(isObservingCallback, {
  root: document.body,
  rootMargin: '0px',
  threshold: 1.0,
});
const observer50 = new IntersectionObserver(isObservingCallback, {
  root: document.body,
  rootMargin: '0px',
  threshold: 0.5,
});

document.querySelectorAll('.scrollTrigger').forEach(t=>{
  observer50.observe(t)
});
