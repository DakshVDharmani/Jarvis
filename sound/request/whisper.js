const path = require("path"); 
const os = require("os"); 
const { spawn } = require("child_process"); 

const ffmpegPath = "C:\\Jarvis\\tools\\ffmpeg\\bin\\ffmpeg.exe"; 
const whisperPath = "C:\\Jarvis\\tools\\whisper\\whisper-cli.exe"; 
const modelPath = "C:\\Jarvis\\tools\\whisper\\models\\ggml-base.en.bin"; 

const { normalizedTranscript } = require("./transcriptNormalizer"); 

function TranscribeAudio(audiopath){
    return new Promise((resolve, reject) =>{
        const wavPath = path.join(os.tmpdir(), "jarvis-recording.wav"); 

        const ffmpeg = spawn(ffmpegPath, [
            "-y", 
            //to approve request to overwrite file if it exists 
            "-i", audiopath, 
            //tells it's location to work on
            "-ar", "16000", 
            //16kHz sample rate 
            "-ac", "1", 
            //mono audio 
            "-c:a", "pcm_s16le",
            wavPath
            //saves the recording in wav 
        ]); 

        //close fires when ffmpeg finishes 
        ffmpeg.on("close", (code) =>{
            if(code!==0){
                //the code is job code output given as exit code 
                reject(new Error("FFMPEG conversion failed")); 
                return; 
            }

            const whisper = spawn(whisperPath, [
                "-m", modelPath, 
                //initializes our model for whisper
                "-f", wavPath, 
                //gives whisper our file 
                "-nt", 
                //removes timestamps 
                "-np"
                //supresses unnecessary whisper output 
            ]); 

            console.log("Whisper started"); 

            let transcript = ""; 
            //storing the transcript in temporary string storage 

            whisper.stdout.on("data", (data) =>{
                transcript += data.toString(); 
            }); 

            whisper.on("close", (code) => {
                if(code!==0){
                    reject(new Error("Whisper model failed")); 
                    return; 
                }

                transcript = transcript.trim(); 
                //to remove whitespaces from beginning and end
                
                transcript = normalizedTranscript(transcript); 
                resolve(transcript); 
                //calls resolve inside server 

            }); 
        }); 
    }); 
    //promises are vital to handle long duration tasks, they know the final output 
}

module.exports = { TranscribeAudio }; 