"use strict";

const gulp = require("gulp");

gulp.task("default", () => {
    initializeLocalOverlay();
});

const initializeLocalOverlay = () => {
    
    const fs = require("fs");
    const os = require("os");
    const stripJsonComments = require("strip-json-comments");

    const localOverlayFIleName = "civisurbs.local.json";
    
    let localOverlay = undefined;
    let shouldCreateLocalOverlay = false;
    
    if(fs.existsSync(localOverlayFIleName)){
        localOverlay = JSON.parse(stripJsonComments(fs.readFileSync(localOverlayFIleName, "UTF8")));
    }
    
    // Test local user overlay consistency:
    if(localOverlay == undefined){
        //throw new Error("Missing local overlay configuration file [conf/"+localOverlayFIleName+"]");
        shouldCreateLocalOverlay = true;
    }
    
    const ensureLocalOverlayMissingProperty = (os, overlay) => {
        
        if(!overlay){
            overlay = {};
        }
        
        const platform  = os.platform();
        
        if(!overlay.shell){
            overlay.shell = platform === "win32" ? "cmd" : "sh";
            shouldCreateLocalOverlay = true;
        }
        
        if(!overlay.pathDelimiter){
            overlay.pathDelimiter = platform === "win32" ? ";" : ":";
            shouldCreateLocalOverlay = true;
        }
        
        if(!overlay.directoryDelimiter){
            overlay.directoryDelimiter = platform === "win32" ? "\\" : "/";
            shouldCreateLocalOverlay = true;
        }
        
        return overlay;
    };
    
    localOverlay = ensureLocalOverlayMissingProperty(os, localOverlay);
    
    if(shouldCreateLocalOverlay){
        const overlayFileContent =`
            /**
             * Overrides this config file to match your local environment
             */
            {
                /**
                 * The shell to use
                 * @example
                 *       for linux use "bash", "sh"
                 *       for windows use "cmd.exe" or "powershell"
                 */
                "shell" : "${localOverlay.shell}",
                
                /**
                 * The environment PATH delimiter
                 * @example
                 *  linux use ":" 
                 *  windows use ";"
                 */
                "pathDelimiter" : "${localOverlay.pathDelimiter}",
                
                /**
                 * The directory delimiter
                 * @example
                 *  linux use "/"
                 *  windows use "\\\\"
                 */
                "directoryDelimiter" : "${localOverlay.directoryDelimiter}"
            }`;
        console.info(`Updating your local overlay file [conf/${localOverlayFIleName}] content with : `,overlayFileContent);
        fs.writeFileSync(localOverlayFIleName, overlayFileContent);
    }
};
