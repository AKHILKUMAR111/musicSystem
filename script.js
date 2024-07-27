
let currentSong=new Audio();   // so that not all song plays on click 
//??
let mute=false;
let currFolder;
let songs=[];
//timeupdate gives time in seconds:mmilliseconds so this fuction converts it into minutes:second format
function secondsToMinutesSeconds(totalSeconds) {
      // Calculate the minutes and the remaining seconds
      if(isNaN(totalSeconds) || totalSeconds<0){
        return "00:00"
      }
      const minutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = Math.floor(totalSeconds % 60);
  
      // Format the minutes and seconds to always show two digits
      
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
  
      // Combine formatted minutes and seconds
      return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder=folder
    console.log(folder)
   
    let a=await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response =await a.text();
    // console.log(response)
    let div=document.createElement("div")
    div.innerHTML= response;
    let as=div.getElementsByTagName("a")
    songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    playMusic(songs[0],true)
    console.log(songs)
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
     songUL.innerHTML=""
    //placing songs in library section
    for(const song of songs){
    songUL.innerHTML =songUL.innerHTML + `<li> 

        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div> ${song}</div>
            <div>Akhil</div>
            
        </div>
        <div class="playnow">
            <span>play Now</span>
            <img class="invert" src="img/play.svg" alt="">
        </div>
    </li>` ;
    }
   

    // attch an eventlistner to each song
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{ 
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })

    return songs 
    
  
}

const playMusic = (track, pause = false) => {
   
//    let audio=new Audio("/songs/"+track)  it was playing each song on click 
   currentSong.src=`/${currFolder}/` + track
   if(!pause)
    {
        currentSong.play()
        play.src="img/pause.svg"
    }
    else
    {
        play.src="img/play.svg"
    }
   
    
   document.querySelector(".songinfo").innerHTML=track   //if you are getting an incoded name use decodeURI(track)
   document.querySelector(".songtime").innerHTML="00:00/00:00"



}


async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
    <path d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
</svg>
            </div>

            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            // playMusic(songs[0])

        })
    })
}


async function main(){

    
    //get the list of songs
    
    await getSongs("songs/cs")


    //display all the album on the page
    displayAlbums()

    //attach an event listner to play
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="img/pause.svg"
        }
        else
        {
            currentSong.pause()
            play.src="img/play.svg"
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left= (currentSong.currentTime/currentSong.duration)*100 +"%"
    })
    
    //adding an eventlistner to seek bar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;  //offsetX=loction of element(circle) in seekbar;  e.target.getBoundingClientRect().width =total width available to travel  
        document.querySelector(".circle").style.left= percent+"%";
        currentSong.currentTime = (currentSong.duration)*percent/100;
    })

    //adding eventlistner for hamberger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })

    //adding eventlistner to close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    //add an eventlistner to previous
    previous.addEventListener("click",()=>{
        let index =songs.indexOf(currentSong.src.split("/").slice(-1)[0])  //explain
        let length=songs.length
        if((index)==0){
            playMusic(songs[length-1]);
        }
        else{
            playMusic(songs[index-1]);
        }
    })

      //add an eventlistner to next
    next.addEventListener("click",()=>{
        let index =songs.indexOf(currentSong.src.split("/").slice(-1)[0])  //explain
        let length=songs.length
        if((index+1)>=length){
            playMusic(songs[0]);
        }
        else{
            playMusic(songs[index+1]);
        }
      })
    

      //add an event to volume
      document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume = parseInt(e.target.value)/100
        let img =document.querySelector(".volume").getElementsByTagName("img")[0]
         
        if(currentSong.volume==0){
            img.src="img/mute.svg"
        }
        else{
            img.src = "img/volume.svg"
        }
      })



      //add eventlistner to mute the 
      document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click",(e)=>{
        console.log(e.target.src)
        let vol=document.querySelector(".range").getElementsByTagName("input")[0]
        
        if(mute==true){
            e.target.src = "img/volume.svg"
             vol.value=50
             currentSong.volume = parseInt(vol.value)/100
            mute=false
        }
        else{
            e.target.src = "img/mute.svg"
            vol.value=0
             currentSong.volume = parseInt(vol.value)/100
            mute=true
        }
      })


          // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
          

        })
    })
}
main()