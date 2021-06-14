import {TechniqueType} from "./constant.js";
import {LandmarkButton} from "../ds/button.js";

export class LandmarkBtnFishEye {
    constructor(parent, state) {
        this.name = "Landmark_Btn";
        this.parent = parent;
        this.parent.type = TechniqueType.Landmark_Btn_FishEye;

        this.parent.buttons = {
            input: [],
            output: []
        };

        for (let i = 0; i < state.config.landmarkButtons.total; i ++) {
            this.parent.buttons.input.push(
                new LandmarkButton(this, i, state)
            );

            this.parent.buttons.output.push(
                new LandmarkButton(this, i, state)
            );
        }

        this.isCursorInsideBtn = false;

        this.dist = new Array(state.config.landmarkButtons.total);

        
    }

    calculate(state) {

        if (!state.initiator.left.show) return; 

        this._updateBtnDimensions(state);
        
        if (state.initiator.left.landmarks) {

            this.parent._setupSelectionLandmarks(state);
        }
    }

    draw(state) {
        if (!state.initiator.left.show) return;

        for (let i = 0; i < this.parent.buttons.output.length; i ++) {
            this.parent.buttons.output[i].draw(state);
        }

        this.parent._drawTextHighlighted(state);
        this.parent._drawTextMarked(state);
        this.parent._drawProgressBar(state);
    }

    _updateBtnDimensions(state) {
        if (!state.cursor) return;
        
        let mnm = Number.MAX_VALUE;
        let mxm = Number.MIN_VALUE;

        for (let i = 0; i < state.config.landmarkButtons.total; i ++) {
            this.dist[i] = Math.hypot(state.cursor.x - state.initiator.left.landmarks[i].x, state.cursor.y - state.initiator.left.landmarks[i].y);
            mnm = Math.min(mnm, this.dist[i]);
            mxm = Math.max(mxm, this.dist[i]);
        }

        const d = mxm - mnm;
        console.log("_updateBtnDimensions d:", d, "mnm:", mnm, "mxm:", mxm, "this.dist", this.dist);
        for (let i = 0; i < state.config.landmarkButtons.total; i ++) {
            this.parent.buttons.input[i].width = this.parent.buttons.input[i].widthMin + ((mxm - this.dist[i]) / d) * 30;
            this.parent.buttons.input[i].height = this.parent.buttons.input[i].heightMin + ((mxm - this.dist[i]) / d) * 30;
            this.parent.buttons.input[i].widthHalf = this.parent.buttons.input[i].width / 2;
            this.parent.buttons.input[i].heightHalf = this.parent.buttons.input[i].height / 2;

            this.parent.buttons.output[i].width = this.parent.buttons.output[i].widthMin + ((mxm - this.dist[i]) / d) * 30;
            this.parent.buttons.output[i].height = this.parent.buttons.output[i].heightMin + ((mxm - this.dist[i]) / d) * 30;
            this.parent.buttons.output[i].widthHalf = this.parent.buttons.output[i].width / 2;
            this.parent.buttons.output[i].heightHalf = this.parent.buttons.output[i].height / 2;

        }

        console.log("this.parent.buttons:", this.parent.buttons);
    }

    btnIDPointedBy(state) {
        
        this.isCursorInsideBtn = false;

        for (let i = 0; i < this.parent.buttons.input.length; i ++)
            if (this.parent.buttons.input[i].isCursorInside(state)) {
                this.isCursorInsideBtn = false;
                return i;
            }

        return -1;
    }

    adjustSelection(state) {
        state.selection.adjustSelectionBtnID();
    }

    markSelected(state) {
        this.parent._markSelectedBtnID(state);
    }

    lastTargetVisitTime(p) {
        return this.parent._lastTargetVisitTimeBtnID(p);
    }

    isCursorInside(state) {
        return this.isCursorInsideBtn;
    }
}
