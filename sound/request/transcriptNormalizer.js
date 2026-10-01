function normalizeTranscript(transcript){
    if(!transcript || typeof transcript !== string)
        return ""; 
    
    let normalized = transcript.trim(); 
    //to stop crashing, if no text is provided 

    normalized = normalized.replace(/\s+/g, " "); 
    //in cases of multiple spaces, puts just one 

    normalized = normalized.replace(/\bdot\b/gi, "."); 
    /*
    \b means looking for that exact word 
    g means all the occurences of it 
    i means it is case sensitive 
    */
    normalized = normalized.replace(/\bbackslash\b/gi, "\\"); 
    normalized = normalized.replace(/\bslash\b/gi, "/"); 

    return normalized; 
}

module.exports = { normalizeTranscript }; 