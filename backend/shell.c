#include <stdio.h>
//input and output, handles touch and other commands 
#include <stdlib.h>
//for general utilities like memory allocation and process control conversions
#include <unistd.h> 
//for posio functions, get current directory, forks, and changing the directory 
#include <string.h> 
//for string handling 
#include <dirent.h> 
//for traversal of directories 
#include <sys/stat.h>
//this is where mkdir is declared 
#include <process.h>
//replacing system() for arp, and others

#define MAX_LINE 1024 
//for maximum input length 
#define MAX_ARGS 64 
//for maximum arguments 

typedef enum {
    UNKNOWN = 0, 
    EXIT = -1, 
    cd = 1, 
    ls = 2, 
    CLEAR = 3, 
    MKDIR = 4, 
    TOUCH = 5, 
    PWD = 6, 
    ARP = 7, 
    RM = 8, 
} Command; 

Command get_command(const char *cmd_str){
    if(strcmp(cmd_str, "cd")== 0) return cd; 
    if(strcmp(cmd_str, "ls") == 0) return ls; 
    if(strcmp(cmd_str, "EXIT")== 0) return EXIT; 
    if(strcmp(cmd_str, "clear") == 0) return CLEAR; 
    if(strcmp(cmd_str, "mkdir")== 0) return MKDIR; 
    if(strcmp(cmd_str, "touch") == 0) return TOUCH; 
    if(strcmp(cmd_str, "pwd") == 0) return PWD; 
    if(strcmp(cmd_str, "arp") == 0) return ARP; 
    if(strcmp(cmd_str, "rm") == 0) return RM; 

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

void builtIn_clear(){
    printf("\033[2J\033[H"); 
    //\033[2J clears the terminal screen, and \033[H moves the cursor back to top left 
}

void builtIn_mkdir(char** args){
    char* foldername = args[1]; 
    //as args[0] will be the mkdir command

    if(foldername == NULL){
        printf("mkdir: missing folder name\n"); 
        return; 
    }
    //handles the no name edge case 

    if(mkdir(foldername) != 0){
    /*while for linux/unix system, mkdir takes 2 inputs, foldername and permissions
    for example, write if(mkdir(foldername), 0755) != 0) to give kinds of permissions
    */

        perror("mkdir failed"); 
    }
}

void builtIn_touch(char** args){
    char* filename = args[1]; 
    //as args[0] would be the command touch 

    if(filename == NULL){
        printf("Missing file name\n");
        return;  
    }

    FILE *file = fopen(filename, "a"); 
    //"a" creates if file doesnt exist, and if does, opens it 

    if(file == NULL){
        printf("Touch failed"); 
        return; 
    }

    fclose(file); 
}

void builtIn_pwd(){
    char cwd[MAX_LINE]; 

    if(getcwd(cwd, sizeof(cwd)) != NULL){
        printf("%s\n", cwd); 
    }
    //getcwd gets the current working directory 

    else{
        perror("pwd failed"); 
    }
}

void builtIn_arp(){
    // int result = system("arp -a"); 
    // //system() acts as an operating system that executes a few commands, and then outputs them on the screen

    // if(result != 0)
    //     perror("arp failed"); 
    // //stores the job outcome in result for error handling

    const char *arp_args[] = {
        "arp", 
        "-a", 
        NULL
    }; 

    int result = _spawnvp(
        _P_WAIT, 
        //_P_WAIT tells spawnvp to start arp.exe and come back with result when finished
        "arp", 
        arp_args
    ); 

    if(result == -1){
        perror("arp failed"); 
        return; 
    }

    if(result != 0){
        printf("arp exited with code %d\n", result); 
    }
}

void builtIn_rm(char** args){
    char* filename = args[1]; 

    if(filename == NULL){
        printf("No file name was provided\n"); 
        return; 
    }

    char cwd[MAX_LINE]; 

    if(getcwd(cwd, sizeof(cwd))==NULL){
        perror("Couldn't determine current directory");
        return; 
    }

    //confirmation solves the security protocol to delete data
    printf("Delete %s/%s? (y/n)", cwd, filename); 
    fflush(stdout); 

    char confirmation[10]; 

    if(fgets(confirmation, sizeof(confirmation), stdin) == NULL){
        printf("Deletion cancelled\n"); 
        return; 
    }

    if(confirmation[0] != 'Y' && confirmation[0] != 'y'){
        printf("Deletion cancelled\n"); 
        return; 
    }

    //remove operation is handled here
    if(remove(filename) != 0)
        perror("Couldn't delete file\n");
        
    printf("Deleted %s/%s\n", cwd, filename); 
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

            case CLEAR : 
                builtIn_clear(); 
                break; 
            
            case MKDIR : 
                builtIn_mkdir(args); 
                break; 

            case TOUCH : 
                builtIn_touch(args); 
                break; 

            case PWD : 
                builtIn_pwd(); 
                break; 

            case ARP : 
                builtIn_arp(); 
                break; 

            case RM : 
                builtIn_rm(args); 
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