const http = require("http"); 
const fs = require("fs"); 
//fs is short for file system to read the index.html 

const crypto = require("crypto"); 

const { spawn } = require("child_process"); 
/*spawn lets Node start our C program, gives us 
    shell.stdin     // Node → C program
    shell.stdout    // C program → Node
    shell.stderr    // C errors → Node
*/

const WebSocket = require("ws"); 
//adds websocket to the code 

const server = http.createServer((req, res) => {
    const SESSION_SECRET = crypto.randomBytes(32).toString("hex"); 

    /*creates a secret key for each session 
    so all the communication in the backend goes through 
    if the frontend is verified, 
    no unverified platforms can access 
    */
    fs.readFile("../frontend/index.html", (err, data) => {
        if(err){
            res.writeHead(500); 
            //gives server error response 
            res.end("Could not load index.html"); 

            /*
            1xx status codes are informational 
            2xx status codes are successful operation 
            3xx status codes are redirection 
            4xx status codes are client-side errors 
            5xx status codes are server-side errors 
            */

            return; 
        }

        res.writeHead(200, {"Content-Type" : "text/html" }); 
        //prints success codes 

        data = data.toString().replace("__SESSION_SECRET__", SESSION_SECRET); 
        //sends placeholder to the frontend only

        res.end(data); 
    }); 
    //reads the html file 
}); 
//initializing the http server 

const wss = new WebSocket.Server({ server }); 
// ({ server }); asks server to use the current one we just made 

wss.on("connection", (ws) => {
    const shell = spawn("./shell"); 
    //this line accesses the shell code to run the C program 

    console.log("Browser connected"); 

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString()); 
        //this parses into the JSON input given by the user 

        if(data.secret != SESSION_SECRET) {
            ws.close(); 
            return; 
        }
        //closes the websocket connection if found to be different than expected

        const command = data.message; 

        shell.stdin.write(command + "\n"); 
    }); 

    shell.stdout.on("data", (data) => {
        ws.send(JSON.stringify({message : data.toString()})); 
    }); 
    //this helps communicate the response of C shell to the frontend 

    shell.stderr.on("data", (data) => {
        ws.send(JSON.stringify({message : data.toString()})); 
    }); 
    //this prints all the errors from the browser for better error handling 

    ws.on("close", () => {
        shell.kill(); 
    }); 
    //handles the disconnecting of the browser 
}); 

/*
Defining the port number with IP, instead of localhost keeps Jarvis secure 
As potentially devices on the same network can access the shell, and other parts 
It binds the server to the computer, and only accepts requests from it
Thus, 127.0.0.1. is the loopback address, not Wifi LAN. 
*/

server.listen(3000, "127.0.0.1", ()=>{
//this tells the server to listen at 3000
    console.log("Server running at http://127.0.0.1:3000"); 
    //prints the port name 
}); 