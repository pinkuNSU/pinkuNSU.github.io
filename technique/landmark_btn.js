import {TechniqueType} from "./constant.js";
import {LandmarkButton} from "../ds/button.js";

export class LandmarkBtn {
    constructor(parent, state) {
        this.name = "Landmark_Btn";
        this.parent = parent;
        this.parent.type = TechniqueType.Landmark_Btn;

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

        
    }

    calculate(state) {

        if (!state.initiator.left.show) return; 
        
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
