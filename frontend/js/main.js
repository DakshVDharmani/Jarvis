/*
const is one of the ways to make variables in javascript, 
after initializing with const, variable cannot be reassigned but modified 
*/

const input = document.getElementById("command"); 
const output = document.getElementById("output");
const terminal = document.getElementById("terminal");

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

input.addEventListener("keydown", (event) =>{
    if(event.key == "Enter"){
        const command = input.value; 
        //this stores whatever was typed before ENTER into command variable 
        commandHistory.push(command); 
        historyIndex = commandHistory.length; 
        //saves the history of commands in an array of commands 

        output.textContent += command + "\n"; 

        connection.send(JSON.stringify({
            message : command, 
            secret : SESSION_SECRET
        })); 

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