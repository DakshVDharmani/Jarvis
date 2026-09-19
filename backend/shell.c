#include <stdio.h>
//input and output 
#include <stdlib.h>
//for general utilities like memory allocation and process control conversions
#include <unistd.h> 
//for posio functions, get current directory, forks, and changing the directory 
#include <string.h> 
//for string handling 
#include <dirent.h> 
//for traversal of directories 

#define MAX_LINE 1024 
//for maximum input length 
#define MAX_ARGS 64 
//for maximum arguments 

typedef enum {
    UNKNOWN = 0, 
    EXIT = -1, 
    cd = 1, 
    ls = 2, 
} Command; 

Command get_command(const char *cmd_str){
    if(strcmp(cmd_str, "cd")== 0) return cd; 
    if(strcmp(cmd_str, "ls") == 0) return ls; 
    if(strcmp(cmd_str, "EXIT")== 0) return EXIT; 

    return UNKNOWN; 
}


//this is for tokenising the inputs given 

void builtIn_cd(char** args){
    //**  just means giving access to multiple partings

    char* target = args[1]; 
    //here we ignore args[0] because that is just cd, and args[1] would be the destination for the same

    if(target==NULL)
        target = getenv("HOME"); 
    //stlib gives the env HOME directory 

    if(chdir(target)!=0)
        perror("cd failed"); 
    //perror is printing the error 
    //chdir changes the directory, and 0 comes when the functon ran without an error, otherwise not
    //if chdir(target) already changes the directory, so thats where the changing happens 
}

void builtIn_ls(char** args){
    char *target_dir = args[1]; 
    //here we ignore args[0] because that is just ls, and args[1] would be the directory to target

    if(target_dir == NULL)  
        target_dir = "."; 
    //string needed here if need to stop 
    
    DIR *dir = opendir(target_dir); 
    //DIR is a built in type pointer given through opendir, comes from dirent.h 

    if(dir == NULL){
        perror("ls failed"); 
        //the folder doesn't exist, we don't have permission or path is not a directory 
        return; 
    }

    struct dirent *entry; 
    //creating a structure to loop through the complete directory 

    while((entry = readdir(dir))!=NULL){
        //readdir gives one entry at a time, and keeps until readdir is not null
        if(entry->d_name[0] != '.') {
            printf("%s ", entry->d_name); 
            //d_name is name field in the struct dirent, comes from dirent.h 
        }
    }
    
    printf("\n"); 
    //after we have printed all the names 
    closedir(dir); 
    //closes the directory 
}

int main(){
    char line[MAX_LINE]; 
    char *args[MAX_ARGS]; 
    //sticky notes for start of a new argument in the input 
    char cwd[MAX_LINE]; 
    //current working directory 

    int keep_running = 1; 

    while(keep_running){
        //keeps cycle alive so the shell doesn't die after one input
        if(getcwd(cwd, sizeof(cwd))!=NULL){
        //getcwd is from unistd, gives current directory 
            printf("Jarvis:%s$ ", cwd);
            //common convention to write, $ means a normal user  
        }

        else{
            printf("Jarvis:$ "); 
            //fallback, could not get the directory 
        }

        fflush(stdout); 
        //fflush is to show the prompt immediately 

        if(fgets(line, sizeof(line), stdin)==NULL){
        //fgets read whole line, while scanf stops at spaces
        //stdin just says get input from the keyboard
            break; 
        }

        line[strcspn(line, "\n")] = '\0'; 
        //removing trailing newline character as it gets added to the command once typed "Enter", messes up the command prompt 

        int arg_count = 0; 
        //so that we don't we exceed our argument limit, and tells how many arguments are present in the input

        char *token = strtok(line, " "); 
        //strtok is basically cut this string into tokens 
        //splitting the arguments with the help of " ". strtok makes it simple

        while(token != NULL && arg_count < MAX_ARGS -1){
            //storing the token into args 
            args[arg_count++] = token; 
            token = strtok(NULL, " "); 
            //keeps going 
        }

        args[arg_count] = NULL; 
        //marks the end of the arguments, input is iterated with 

        if(arg_count==0)
            continue; 

        Command cmd = get_command(args[0]); 

        //indentation and spaces do not really affect the compiler, much for the programmers understanding 
        switch(cmd){
            case cd : 
                builtIn_cd(args); 
                break; 
            //break helps break after the case is solved 
            
            case ls : 
                builtIn_ls(args); 
                break; 
            
            case EXIT : 
                keep_running = 0; 
                break; 
            
            case UNKNOWN : 
            default : 
                printf("Command not found: %s\n", args[0]); 
                break; 
        }
    }

    return 0; 
}