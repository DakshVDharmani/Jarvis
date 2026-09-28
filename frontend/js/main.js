import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/+esm";

import { createSphere, updateSphere } from "./sphere.js";
import { createParticles, updateParticles } from "./particles.js";

/*
const is one of the ways to make variables in javascript, 
after initializing with const, variable cannot be reassigned but modified 
*/

const input = document.getElementById("command"); 
const output = document.getElementById("output");
const terminal = document.getElementById("terminal");

const voiceButton = document.getElementById("voice-button"); 
const systemMode = document.getElementById("system-mode"); 

let mediaRecorder; 
//it will control recording of the microphone 
let audiochunks = []; 
//stores bits of audio in chunks 

const scene = new THREE.Scene(); 
const sphere = createSphere(); 
scene.add(sphere); 

const particles = createParticles(); 
scene.add(particles); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100); 
camera.position.z = 3; 

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true}); 
renderer.setSize(window.innerWidth, window.innerHeight); 

const sphereContainer = document.getElementById("jarvis-sphere"); 
sphereContainer.appendChild(renderer.domElement); 
//this draws our canvas to show the sphere 

function animate(time){
    requestAnimationFrame(animate); 
    updateSphere(sphere, time); 
    updateParticles(particles, time);
    renderer.render(scene, camera); 
    //this renders the THREE.js scene and camera
}

animate(); 

const commandHistory = []; 
let historyIndex = 0; 

terminal.addEventListener("click", () =>{
    input.focus(); 
    //this way when clicked in the terminal, the cursor focuses on the input 
})

const SESSION_SECRET = "__SESSION_SECRET__"; 

const connection = new WebSocket(`ws://127.0.0.1:3000`); 
//hooks the frontend to the websocket server 

connection.onopen = () => {
    console.log("Connected to Jarvis' Server"); 
}; 

function sendCommand(command){
    if(command.trim()==="") return; 

    commandHistory.push(command); 
    historyIndex = commandHistory.length; 
    //saves the history of commands in an array of commands 

    output.textContent += command + "\n"; 

    connection.send(JSON.stringify({
            message : command, 
            secret : SESSION_SECRET
    })); 

}

voiceButton.addEventListener("click", async()=>{
    console.log("MIC BUTTON CLICKED"); 
    //in case the button doesn't respond 
    
    if(mediaRecorder && mediaRecorder.state === "recording"){
        mediaRecorder.stop(); 
        //stops recording when button is clicked again
        return; 
    }

    const stream = await navigator.mediaDevices.getUserMedia({audio: true}); 
    //waits for audio to be switched on by the user, while getUserMedia asks user permission
    mediaRecorder = new MediaRecorder(stream); 
    //MediaRecorder is the browser provided class 
    audiochunks = [];
    
    //this function is to turn the bits of audio into an audio file 
    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audiochunks, {type: mediaRecorder.mimeType }); 
        //audioBlob combines all the audiochunks that eventually be sent to whisper.cpp 
        systemMode.textContent = "MODE: TRANSCRIBING"; 
        voiceButton.textContent = "MIC"; 

        console.log("Audio recorded: ", audioBlob.size, "bytes"); 
        //allows to verify that the audio files exist using DevTools 
        stream.getTracks().forEach(tracks => tracks.stop()); 
        //this stops the microphone from recording 

        const formData = new FormData(); 
        formData.append("audio", audioBlob, "recording.webm"); 

        console.log("Audio prepared for transcription"); 
        const response = await fetch("/transcribe", {
            method: "POST", 
            body: formData
        }); 

        const data = await response.json(); 
        const transcript = data.transcript; 
        input.value = transcript; 
        //now server.js will have an option to create transcript
    }; 

    mediaRecorder.ondataavailable = (event) => {
        audiochunks.push(event.data); 
    }; 

    mediaRecorder.start(); 
    //starts recording our microphone 
    systemMode.textContent = "MODE: Listening"; 
    voiceButton.textContent = "STOP"; 
    console.log("Voice recording started"); 
    //for better error handling 
}); 

input.addEventListener("keydown", (event) =>{
    if(event.key == "Enter"){
        const command = input.value; 
        //this stores whatever was typed before ENTER into command variable 
        sendCommand(command); 

        input.value = ""; 
        //thus the box becomes empty for the next command \
    }

    else if(event.key == "ArrowUp"){
        if(historyIndex>0){
            historyIndex--; 
            input.value = commandHistory[historyIndex]; 
        }
    }
    //adds scroll through previous commands, without deleting anything from the prev commands 

    else if(event.key == "ArrowDown"){
        if(historyIndex<commandHistory.length-1){
            historyIndex++; 
            input.value = commandHistory[historyIndex]; 
        }

        else{
            historyIndex = commandHistory.length; 
            input.value = ""; 
        }
    }
}); 
//detects ENTER has been pressed to take input 

connection.onmessage = (event) => {
    const data = JSON.parse(event.data); 
    //convert JSON into js object given by the shell through websocket 

    if(data.message.includes("\x1b[2J\x1b[H")){
        output.textContent = ""; 
        data.message = data.message.replace("\x1b[2J\x1b[H", ""); 
        //removes only the input characters, leaves Jarvis:C:\Jarvis$ alone
    }

    output.textContent += data.message; 
    terminal.scrollTop = terminal.scrollHeight; 
    //scrolls to the bottom whenever the output comes 
}; 
//displays the output of the input 