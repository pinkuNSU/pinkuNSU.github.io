import {checkRadio, checkSelectList, getState} from './state.js';
import {initiate} from './initiator.js';
import { getTechnique } from './technique/technique.js';
import {getConfig} from './config.js';
import {getTrigger} from './trigger/trigger.js';
import {TRIGGER} from './trigger/triggerstate.js';
import {ButtonSelection} from './ds/btnselection.js';


let done = false;
let done2 = false;

const CAMWIDTH = 640;
const CAMHEIGHT = 480;

// previous code is here


window.onload = function() {

    // navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    // if (navigator.mediaDevices.getUserMedia) {
    //     navigator.mediaDevices.getUserMedia({  audio: true, video: true })
    //     .then(function (stream) {
    //                 //Display the video stream in the video object
    //     })
    //     .catch(function (e) { logError(e.name + ": " + e.message); });
    // }
    // else {
    //     navigator.getWebcam({ audio: true, video: true }, 
    //         function (stream) {
    //                 //Display the video stream in the video object
    //         }, 
    //         function () { logError("Web cam is not accessible."); });
    // }

    let state = getState();

    state.config = getConfig();
    state.selection = new ButtonSelection();

    state.experiment = {
        study1: {},
        study2: {},
    };

    let menuElement = document.getElementById("menu");
    
    let start_study = false;
    
    // Our input frames will come from here.
    
    const videoContainer = document.getElementById("video_container");
    // videoContainer.style.display = "none";
    
    const videoElement =
        document.getElementById('input_video');
    videoElement.style.display = "none";

    const canvasElement =
        document.getElementById('output_canvas');

    canvasElement.style.display = "none";

    const canvasCtx = canvasElement.getContext('2d');
    
    
    const startBtn = document.getElementById("start_btn");
    startBtn.onclick = function() {
        state.menu.showMenu     = false;
        state.menu.technique    = checkRadio("menutechnique");
        state.menu.trigger      = checkRadio("menutrigger");
        state.menu.userID       = document.getElementById("inputUserID").value;
        state.menu.practice     = document.getElementById("practiceCheck").checked; 
        state.menu.debug        = document.getElementById("debugCheck").checked;
        state.menu.cellscnt     = parseInt(checkSelectList("selectCells"));
        state.menu.targetscnt   = 3;
        state.height            = CAMHEIGHT; 
        state.width             = CAMWIDTH;

        start_study = true;
        menu.style.display = "none";
        videoContainer.style.display = "block";

        state.technique = getTechnique(state);
        state.trigger = getTrigger(state);
 
        const hands = new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
        }});
        
        hands.setOptions({
            selfieMode: true,
            maxNumHands: 2,
            minDetectionConfidence: 0.8,
            minTrackingConfidence: 0.8
        });
        
        hands.onResults(onResults);
        
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({image: videoElement});
            },
            width: CAMWIDTH,
            height: CAMHEIGHT
        });

        camera.start();
    }
    
    startBtn.click(); // remove before prod
    
    // call tick() each time the graph runs.
    // const fpsControl = new FPS();
    

    
    function onResults(results) {
        // Hide the spinner.        
        if (!done) {            
            done = true;
        }
        
        
        state.data = results;
        
        // document.body.classList.add('loaded');
        // Update the frame rate.
        // fpsControl.tick();
        
        // Draw the overlays.
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(
            results.image, 0, 0, canvasElement.width, canvasElement.height
        );
        
        
        state.imageCV = cv.imread('output_canvas');
        state.outputCV = state.imageCV.clone();

        state.cursor = null;

        if (results.multiHandLandmarks && results.multiHandedness) {
            if (!done2) {
                console.log("results:", results);
            }
            
            state.initData = initiate(state, results);
                
            if (!done2) {
                console.log("state.initData:", state);
                console.log("typeof(results.image):", typeof(results.image));
            }
            
            done2 = true;            
            state.cursor = (state.initData.right.landmarks)? state.initData.right.landmarks[8]: null;

            if (state.initData.show) {

                state.technique.calculate(state);

                state.trigger.update(state);

                switch(state.trigger.status) {
                    case TRIGGER.ONHOLD:
                        console.log("switch TRIGGER.ONHOLD");
                        break;
                    case TRIGGER.OPEN:
                        console.log("switch TRIGGER.OPEN");
                        break;
                    case TRIGGER.PRESSED:
                        console.log("switch TRIGGER.PRESSED");
                        break;
                    case TRIGGER.RELEASED:
                        console.log("switch TRIGGER.RELEASED");
                        
                        state.technique.markSelected(state);
                        state.trigger.reset();
                        break;
                    default:
                        state.trigger.reset();
                        break;
                }

                state.technique.draw(state);
            }
            // for (let index = 0; index < results.multiHandLandmarks.length; index++) {
            //     const classification = results.multiHandedness[index];
            //     const isRightHand = classification.label === 'Right';
            //     const landmarks = results.multiHandLandmarks[index];
            //     // drawConnectors(
            //         //     canvasCtx, landmarks, HAND_CONNECTIONS,
            //         //     {color: isRightHand ? '#00FF00' : '#FF0000'}),
            //     if (!isRightHand) {
            //         drawLandmarks(canvasCtx, landmarks, {
            //             color: isRightHand ? '#00FF00' : '#FF0000',
            //             fillColor: isRightHand ? '#FF0000' : '#00FF00',
            //             radius: (x) => {
            //                 return lerp(x.from.z, -0.15, .1, 10, 1);
            //                 }
            //             });
            //     }
            // }
        }

        if (state.cursor) {
            
            const colsz = state.initData.right.scale;
            console.log("colsz:", colsz);
            cv.circle(
                state.outputCV, 
                new cv.Point(state.cursor.x, state.cursor.y), 
                colsz.thickness, 
                new cv.Scalar(colsz.color, colsz.color, colsz.color), 
                -1);
        }

        cv.imshow('cv_output_canvas', state.outputCV);

        if (state.outputCV) {
            state.outputCV.delete();
        }
        
        if (state.imageCV) {
            state.imageCV.delete();
        }

        canvasCtx.restore();
    }
    
}