import JSONg from 'jsong-audio'

function test(){
    console.log("running test")
    const j = new JSONg()
    j.addEventListener('state', (ev)=>{
      console.log(ev)
    })
    j.parseManifest('audio.jsong').then((m)=>{
      console.log(m)
      if(m)
        j.useManifest(m).then(()=>{
          j.play()
          console.log("ok")
        })
    })
    console.log(j)
  }

const b = document.querySelector('#btn-main')
b.addEventListener('click',test)