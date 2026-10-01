const http = require("http"); 
const fs = require("fs"); 
//fs is short for file system to read the index.html 
const path = require("path"); 
//if the frontend requests for a path
const os = require("os"); 
//os will give access to temporary directory to store audio before processing

const crypto = require("crypto"); 
const Busboy = require("busboy"); 
//extracts actual audio so whisper gets actual audio files rather than entire HTTP body 

const { spawn } = require("child_process"); 
/*spawn lets Node start our C program, gives us 
    shell.stdin     // Node → C program
    shell.stdout    // C program → Node
    shell.stderr    // C errors → Node
*/

const { TranscribeAudio } = require("../sound/request/whisper"); 

const WebSocket = require("ws"); 
//adds websocket to the code 

const SESSION_SECRET = crypto.randomBytes(32).toString("hex"); 
/*creates a secret key for each session 
so all the communication in the backend goes through 
if the frontend is verified, 
no unverified platforms can access 
*/

const server = http.createServer((req, res) => {
    let requestedFile; 

    if(req.method === 'POST' && req.url === "/transcribe"){
        console.log("Transcription request received"); 

        const busboy = Busboy({ headers: req.headers}); 
        busboy.on("file", (fieldname, file, info) =>{
            console.log("Received audio", info.filename); 
            const audiopath = path.join(os.tmpdir(), "jarvis-recording.webm"); 
            //stores the audio in a temporary directory using os 
            const writeStream = fs.createWriteStream(audiopath); 
            //this opens the temporary file 
            file.pipe(writeStream);
            //sends uploaded bytes directly into it

            writeStream.on("finish", () => {
                console.log("Audio saved", audiopath); 
                //handles error in case audio saving has a problem
                
                TranscribeAudio(audiopath)
                    .then((transcript) => {
                        res.writeHead(200, {
                            "Content-Type" : "application/json"
                        }); 

                        res.end(JSON.stringify({
                            transcript : transcript
                        })); 

                        console.log("Transcript: ", transcript); 

                    }) 
                    
                    .catch((error) =>{
                        console.log("Transcript Error: ", error.message); 

                        res.writeHead(500, {
                            "Content-Type" : "application/json"
                        }); 

                        res.end(JSON.stringify({
                            error: "Transcription failed"
                        })); 
                    }); 
            }); 
        }); 

        req.pipe(busboy); 
        return; 
    }

    if(req.url === '/'){
        requestedFile = "../frontend/index.html"; 
    }

    else{
        requestedFile = "../frontend" + req.url; 
    }

    fs.readFile(requestedFile, (err, data) => {        
        if(err){
            res.writeHead(404); 
            //gives server error response 
            res.end("File not found"); 

            /*
            1xx status codes are informational 
            2xx status codes are successful operation 
            3xx status codes are redirection 
            4xx status codes are client-side errors 
            5xx status codes are server-side errors 
            */

            return; 
        }

        let contentType = "text/html"; 

        if(req.url.endsWith(".css")){
            contentType = "text/css"; 
        }

        if(req.url.endsWith(".js")){
            contentType = "text/javascript"; 
        }

        res.writeHead(200, {"Content-Type" : contentType }); 
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