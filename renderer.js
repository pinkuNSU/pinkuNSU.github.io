"use strict";

import { checkRadio, checkSelectList, State } from './state.js';
import { Initiator } from './initiator.js';
import { Technique } from './technique/technique.js';
import { Trigger } from './trigger/trigger.js';
import { TRIGGER } from './trigger/triggerstate.js';
import { Trial } from './userstudies/trial.js';
import { TrialState } from './userstudies/constant.js';
import { TechniqueType } from "./technique/constant.js";
import { Study } from './userstudies/study.js';

// previous code is here



window.onload = function () {


    const userIDElement = document.getElementById('selectUserID');

    for (let i = 1; i < 101; i++) {
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(i));
        opt.value = i;
        userIDElement.appendChild(opt);
    }

    document.getElementById('buttonSize_dynamic').onchange = function () {
        document.getElementById('size_input').style.display = 'none';
    }

    document.getElementById('buttonSize_small').onchange = function () {
        document.getElementById('size_input').style.display = 'none';
    }

    document.getElementById('buttonSize_large').onchange = function () {
        document.getElementById('size_input').style.display = 'none';
    }

    document.getElementById('buttonSize_custom').onchange = function () {
        document.getElementById('size_input').style.display = 'block';
    }

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

    let state = new State();


    state.experiment = {
        study1: {},
        study2: {},
    };

    let menuElement = document.getElementById("menu");

    // Our input frames will come from here.

    const videoContainer = document.getElementById("video_container");
    // videoContainer.style.display = "none";

    const videoElement =
        document.getElementById('input_video');
    videoElement.style.display = "none";

    const canvasElement =
        document.getElementById('output_canvas');
    canvasElement.style.width = state.config.CAMWIDTH + "px";
    canvasElement.style.height = state.config.CAMHEIGHT + "px";
    canvasElement.style.display = "none";

    const canvasCtx = canvasElement.getContext('2d');


    const canvasCVOut =
        document.getElementById('cv_output_canvas');
    canvasCVOut.style.width = state.config.CAMWIDTH + "px";
    canvasCVOut.style.height = state.config.CAMHEIGHT + "px";

    const canvasCVOutCtx = canvasCVOut.getContext('2d');
    state.canvasCVOutCtx = canvasCVOutCtx;

    const startBtn = document.getElementById("start_btn");

    document.addEventListener("keypress", function (event) {
        console.group("document keypress event");
        console.table(event);
        console.groupEnd();
        if (event.key == "Enter") {
            event.preventDefault();
            startBtn.click();
        }
    });

    startBtn.onclick = function () {
        state.menu.showMenu = false;
        state.menu.technique = checkRadio("menutechnique");
        state.menu.trigger = checkRadio("menutrigger");
        state.menu.userID = parseInt(checkSelectList("selectUserID"));
        state.menu.practice = document.getElementById("practiceCheck").checked;
        state.menu.debug = document.getElementById("debugCheck").checked;

        state.menu.cellscnt = {
            row: parseInt(checkSelectList("selectCellsRow")),
            col: parseInt(checkSelectList("selectCellsCol"))
        };

        state.menu.targetscnt = 12;
        state.menu.buttonSize = checkRadio("buttonSize");
        state.height = state.config.CAMHEIGHT;
        state.width = state.config.CAMWIDTH;

        switch (state.menu.buttonSize) {
            case "Dynamic":
                state.config.landmarkButtons.width = 30;
                state.config.landmarkButtons.height = 30;
                state.config.buttons.width = 30;
                state.config.buttons.height = 30;
                state.config.buttons.isDynamic = true;
                break;
            case "Small":
                state.config.landmarkButtons.width = 30;
                state.config.landmarkButtons.height = 30;
                state.config.buttons.width = 30;
                state.config.buttons.height = 30;
                break;
            case "Large":
                console.log("Large");
                state.config.landmarkButtons.width = 50;
                state.config.landmarkButtons.height = 50;
                state.config.buttons.width = 50;
                state.config.buttons.height = 50;

                break;
            case "Custom":
                state.config.landmarkButtons.width = parseInt(document.getElementById('cell_width').value, 10);
                state.config.landmarkButtons.height = parseInt(document.getElementById('cell_height').value, 10);
                state.config.buttons.width = parseInt(document.getElementById('cell_width').value, 10);
                state.config.buttons.height = parseInt(document.getElementById('cell_height').value, 10);
                console.table(state.config.buttons);
                console.table(state.config.landmarkButtons);
                break;
            default:
                state.config.landmarkButtons.width = 30;
                state.config.landmarkButtons.height = 30;
                state.config.buttons.width = 30;
                state.config.buttons.height = 30;
        }

        state.config.landmarkButtons.widthHalf = state.config.landmarkButtons.width / 2;
        state.config.landmarkButtons.heightHalf = state.config.landmarkButtons.height / 2;
        state.config.buttons.widthHalf = state.config.buttons.width / 2;
        state.config.buttons.heightHalf = state.config.buttons.height / 2;

        state.config.grid.width = state.config.grid.gap * (state.menu.cellscnt.col + 1) + state.config.buttons.width * (state.menu.cellscnt.col);
        state.config.grid.height = state.config.grid.gap * (state.menu.cellscnt.row + 1) + state.config.buttons.height * (state.menu.cellscnt.row);

        console.group("state.config.grid");
        console.table(state.config.grid);
        console.table(state.width, state.height);
        console.groupEnd();

        menu.style.display = "none";
        videoContainer.style.display = "block";

        state.initiator = new Initiator(state);
        state.technique = new Technique(state);
        state.trigger = new Trigger(state);

        state.experiment = {
            trial: new Trial(state),
            study1: new Study(state),
            prev_marked_i: -1,
            prev_marked_j: -1
        };

        state.experiment.trial.generateTarget(state);

        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
            }
        });

        hands.setOptions({
            selfieMode: true,
            maxNumHands: 2,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        hands.onResults(onResults);

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: state.config.CAMWIDTH,
            height: state.config.CAMHEIGHT
        });

        camera.start();
    }

    // startBtn.click(); // remove before prod

    // call tick() each time the graph runs.
    // const fpsControl = new FPS();

    function goBackToMenu() {
        location.reload();
        // menu.style.display = "block";
        // videoContainer.style.display = "none";
        // const mediaStream = videoElement.srcObject;
        // const tracks = mediaStream.getTracks();
        // tracks.forEach(track => track.stop())
    }

    function onResults(results) {

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


        if (state.technique.type == TechniqueType.H2S_Relative ||
            state.technique.type == TechniqueType.H2S_Absolute ||
            state.technique.type == TechniqueType.H2S_Relative_Finger
        ) {
            state.imageCV = state.technique.images.background.image.clone();
            state.outputCV = state.technique.images.background.image.clone();
        } else {
            state.imageCV = cv.imread('output_canvas');
            state.outputCV = state.imageCV.clone();
        }

        state.initiator.initiate(state, results);

        state.cursor = (state.initiator.right.dataID != null) ? state.initiator.right.landmarks[8] : null;

        if (state.cursor == null) {
            state.trigger.reset(state);
        }

        // todo move to webworker
        if (state.experiment.trial.status == TrialState.STARTED) {
            state.experiment.trial.updateCursorDistTraveled(state);
            state.experiment.trial.updateLeftPalmDist(state);
            state.experiment.trial.updateRightPalmDist(state);
            state.experiment.trial.updateTargetTime();

            state.experiment.trial.updateVisitedCells(state);

            state.experiment.trial.updateTargetLastVisitTime(state);
        }

        if (state.initiator.show || state.technique.alwaysShow) {

            state.technique.calculate(state);

            state.experiment.trial.updateStartBtnInputLoc(state);
            state.experiment.trial.updateBackBtnInputLoc(state);

            state.trigger.update(state);

            console.log("state.trigger:", state.trigger);

            if (state.trigger.status == TRIGGER.RELEASED)
                console.log("##after update trigger released");
            else if (state.trigger.status == TRIGGER.OPEN) {
                console.log("##after update trigger open");

            }

            if (state.trigger.status != TRIGGER.PRESSED) {
                state.selection.locked = false;
                state.resetCursorPath();
            }

            let resetAnchor = false;



            switch (state.trigger.status) {
                case TRIGGER.ONHOLD:
                    console.log("rendered triggger onhold");
                    break;
                case TRIGGER.OPEN:
                    console.log("rendered triggger open");

                    break;
                case TRIGGER.PRESSED:
                    console.log("rendered triggger preseed");

                    if (state.technique.isCursorInside(state)) {
                        state.technique.anchor.adjustSelection(state);
                        state.lockSelection();
                    }
                    state.updateCursorPath();
                    break;
                case TRIGGER.RELEASED:
                    console.log("rendered triggger released");
                    state.resetCursorPath();
                    if (state.experiment.trial.status == TrialState.STARTED) {
                        console.log("status STARTED");
                    }

                    if (state.experiment.trial.isCursorOverStartBtn(state)) {
                        state.experiment.trial.clickStartBtn(state);
                        state.technique.stats.visitedCells = 0;
                        resetAnchor = true;
                        state.technique.reset();
                    } else if (state.experiment.trial.isCursorOverBackBtn(state)) {
                        goBackToMenu();
                    } else if (state.experiment.trial.status == TrialState.STARTED) {

                        console.log("STARTED");

                        state.technique.anchor.markSelected(state);
                        state.experiment.trial.incrementAttempts();

                        if (state.experiment.trial.matched(state)) {
                            if (!state.menu.practice) {
                                state.experiment.study1.save(state);
                            }

                            state.experiment.trial.clickTarget(state);
                            state.experiment.trial.generateTarget(state);
                            resetAnchor = true;
                        }
                    }

                    state.trigger.reset(state);
                    break;
                default:
                    state.trigger.reset(state);
                    break;
            }

            if (resetAnchor) {
                state.selection.reset();
                state.technique.resetLastTimeVisited();
            }

            state.overlay = state.imageCV.clone();

            state.technique.draw(state);
            state.experiment.trial.drawStartBtn(state);
            state.experiment.trial.drawBackBtn(state);
            state.experiment.trial.drawCompletedTargetsText(state);
            state.experiment.trial.drawTarget(state);


            cv.addWeighted(
                state.overlay,
                state.config.TRANSPARENCY_ALPHA,
                state.imageCV,
                1 - state.config.TRANSPARENCY_ALPHA,
                0.0,
                state.outputCV,
                -1);


            state.overlay.delete();

        }



        if (state.cursor) {

            const colsz = state.initiator.right.scale;
            cv.circle(
                state.outputCV,
                new cv.Point(state.cursor.x, state.cursor.y),
                colsz.thickness,
                new cv.Scalar(colsz.color, colsz.color, colsz.color),
                -1);
        }

        cv.imshow('cv_output_canvas', state.outputCV);

        if (state.initiator.left.show &&
            (
                (
                    state.selection.currentBtn.row_i != -1 &&
                    state.selection.currentBtn.col_j != -1
                )
                || state.selection.currentBtn.btn_id != -1
            )
        ) {

            canvasCVOutCtx.strokeStyle = "blue";
            canvasCVOutCtx.lineWidth = 3;
            canvasCVOutCtx.globalAlpha = 0.4;

            console.table(state.selection.currentBtn);

            if (state.technique.type == TechniqueType.Landmark_Btn || state.technique.type == TechniqueType.Landmark_Btn_FishEye) {
                canvasCVOutCtx.strokeRect(
                    state.initiator.left.landmarks[state.selection.currentBtn.btn_id].x - state.technique.buttons.output[state.selection.currentBtn.btn_id].widthHalf,
                    state.initiator.left.landmarks[state.selection.currentBtn.btn_id].y - state.technique.buttons.output[state.selection.currentBtn.btn_id].heightHalf,
                    state.technique.buttons.output[state.selection.currentBtn.btn_id].width,
                    state.technique.buttons.output[state.selection.currentBtn.btn_id].height,
                );
            } else {
                canvasCVOutCtx.strokeRect(
                    state.technique.grid.output.x_cols[state.selection.currentBtn.col_j],
                    state.technique.grid.output.y_rows[state.selection.currentBtn.row_i],
                    state.technique.grid.output.x_cols[state.selection.currentBtn.col_j + 1] - state.technique.grid.output.x_cols[state.selection.currentBtn.col_j],
                    state.technique.grid.output.y_rows[state.selection.currentBtn.row_i + 1] - state.technique.grid.output.y_rows[state.selection.currentBtn.row_i]
                );
            }
        }

        if (state.cursorPath.head != null) {

            let p = state.cursorPath.head;
            let q = p.next;

            let r = p;

            canvasCVOutCtx.beginPath();
            canvasCVOutCtx.lineWidth = 3;
            canvasCVOutCtx.globalAlpha = 0.6;
            canvasCVOutCtx.strokeStyle = "purple";
            while (q != null) {
                canvasCVOutCtx.moveTo(r.x, r.y);
                // canvasCVOutCtx.lineTo(q.x, q.y);                
                canvasCVOutCtx.quadraticCurveTo(p.x, p.y, q.x, q.y);
                r = p;
                p = q;
                q = p.next;
            }

            canvasCVOutCtx.stroke();
        }

        if (state.technique.type == TechniqueType.H2S_Absolute && state.technique.inputBound && state.technique.inputBound) {
            canvasCVOutCtx.strokeStyle = "white";
            canvasCVOutCtx.lineWidth = 3;
            canvasCVOutCtx.globalAlpha = 0.4;
            canvasCVOutCtx.strokeRect(
                state.technique.inputBound.topleft.x,
                state.technique.inputBound.topleft.y,
                state.technique.inputBound.bottomright.x - state.technique.inputBound.topleft.x,
                state.technique.inputBound.bottomright.y - state.technique.inputBound.topleft.y
            );
        }

        if (state.menu.debug) {

            // console.log("results.multiHandLandmarks:", results.multiHandLandmarks);
            if (results.multiHandLandmarks) {
                for (let index = 0; index < results.multiHandLandmarks.length; index++) {
                    const classification = results.multiHandedness[index];
                    const isRightHand = classification.label === 'Right';
                    const landmarks = results.multiHandLandmarks[index];
                    drawConnectors(
                        canvasCVOutCtx, landmarks, HAND_CONNECTIONS,
                        { color: isRightHand ? '#00FF00' : '#FF0000' })
                    if (!isRightHand) {
                        drawLandmarks(canvasCVOutCtx, landmarks, {
                            color: isRightHand ? '#00FF00' : '#FF0000',
                            fillColor: isRightHand ? '#FF0000' : '#00FF00',
                            radius: (x) => {
                                return lerp(x.from.z, -0.15, .1, 10, 1);
                            }
                        });
                    }
                }
            }
            // draw trial stats
            canvasCVOutCtx.font = "24px Georgia";
            canvasCVOutCtx.fillStyle = "fuchsia";
            canvasCVOutCtx.fillText(
                `targets visit time: ${state.experiment.trial.lastVisitTime()} ms`,
                10, state.height - 130);
            canvasCVOutCtx.fillText(
                `elapsed time: ${state.experiment.trial.elapsedTime()} ms`,
                10, state.height - 110);
            canvasCVOutCtx.fillText(
                `cursor distance: ${state.experiment.trial.stats.distance.cursor[state.experiment.trial.targetID].toFixed(1)} pixels`,
                10, state.height - 90);
            canvasCVOutCtx.fillText(
                `attempts: ${state.experiment.trial.stats.attempts[state.experiment.trial.targetID]}`,
                10, state.height - 70);
            canvasCVOutCtx.fillText(
                `m visited cells: ${state.experiment.trial.stats.visitedCells[state.experiment.trial.targetID]}`,
                10, state.height - 50);
        }

        if (state.outputCV) {
            state.outputCV.delete();
        }

        if (state.imageCV) {
            state.imageCV.delete();
        }

        canvasCtx.restore();
    }

}