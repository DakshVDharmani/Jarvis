const http = require("http"); 
const fs = require("fs"); 
//fs is short for file system to read the index.html 

const { spawn } = require("child_process"); 
/*spawn lets Node start our C program, gives us 
    shell.stdin     // Node → C program
    shell.stdout    // C program → Node
    shell.stderr    // C errors → Node


*/

const WebSocket = require("ws"); 
//adds websocket to the code 

const server = http.createServer((req, res) => {
    fs.readFile("index.html", (err, data) => {
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

        res.writeHead(200, {"Content-Type" : "text-html" }); 
        //prints success codes 
        res.end(data); 
    }); 
    //reads the html file 
}); 
//initializing the http server 

const wss = new WebSocket.Server({ server }); 
// ({ server }); asks server to use the current one we just made 

wss.on("connection", (ws) => {
    const shell = spawn("./jarvis"); 
    //this line accesses the shell code to run the C program 

    console.log("Browser connected"); 

    ws.on("message", (message) => {
        const command = JSON.parse(message.toString()).message; 
        //this parses into the JSON input given by the user 

        shell.stdin.write(command + "\n"); 

    }); 
}); 



