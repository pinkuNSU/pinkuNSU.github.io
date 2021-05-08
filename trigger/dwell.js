import { ButtonSelection } from "../ds/btnselection.js";
import {TRIGGER} from './triggerstate.js';

class Dwell {
    constructor(parent) {
        this.parent = parent;
        
        this.visitTime = Array(11);
        for (var i = 0; i < 11; i ++)
            this.visitTime[i] = new Array(11);
        
        this.curTime = performance.now();

        this._initGridVisitTime(this.curTime);

        this.selection = new ButtonSelection();

    }

    update(state) {
        this.curTime = performance.now();
        
        this.selection.previousBtn.row_i = this.selection.currentBtn.row_i;
        this.selection.previousBtn.col_j = this.selection.currentBtn.col_j;
        
        const btn = state.selection.currentBtn;
        
        this.selection.currentBtn.row_i = btn.row_i;
        this.selection.currentBtn.col_j = btn.col_j;
        
        console.log("dwell:", this, "state:", state);
        
        if (btn.row_i != -1 && btn.row_j != -1) {
            if (this.selection.previousBtn.row_i != -1 && 
                this.selection.previousBtn.col_j != -1) {
                
                    if (this.selection.previousBtn.row_i == btn.row_i &&
                        this.selection.previousBtn.col_j == btn.col_j) {

                            if (this.parent.status == TRIGGER.ONHOLD) {
                                console.error("dwell update status onhold");
                            } else {
                                const ptime = this.visitTime[btn.row_i][btn.col_j];
                                let d = this.curTime - ptime;
                                if (d > state.config.DWELLWAIT_MS) {
                                    this.parent.status = TRIGGER.RELEASED;
                                    d = state.config.DWELLWAIT_MS;
                                } else if (2*d > state.config.DWELLWAIT_MS) {
                                    this.parent.status = TRIGGER.PRESSED;
                                }
                                
                                state.progressBar.size = d/state.config.DWELLWAIT_MS;
                            }
                        } else {
                            this.parent.status = TRIGGER.OPEN;
                            state.progressBar.size = 0;
                            this.visitTime[this.selection.previousBtn.row_i][this.selection.previousBtn.col_j] = this.curTime;
                            this.visitTime[btn.row_i][btn.col_j] = this.curTime;
                        }
                        
            } else {
                this.parent.status = TRIGGER.OPEN;
                state.progressBar.size = 0;
                this.visitTime[btn.row_i][btn.col_j] = this.curTime;
            }
        } else {
            this.parent.status = TRIGGER.OPEN;
            state.progressBar.size = 0;
            if (this.selection.previousBtn.row_i != -1 || this.selection.previousBtn.col_j != -1) {
                this.visitTime[this.selection.previousBtn.row_i][this.selection.previousBtn.col_j] = this.curTime;
            }    
        }


        if (state.experiment.isCursorOverTrialBtn) {
            this.parent.status = TRIGGER.OPEN;
            if (!this.trialBtnFocused) {
                this.trialBtnFocused = true;
                this.trialBtnTime = this.curTime;
            }

            let d = this.curTime - this.trialBtnTime;
            if (d > state.config.DWELLWAIT_MS) {
                this.parent.status = TRIGGER.RELEASED;
                d = state.config.DWELLWAIT_MS;
            } else if (2*d > state.config.DWELLWAIT_MS) {
                this.parent.status = TRIGGER.PRESSED;
            }

            state.progressBar.size = d/state.config.DWELLWAIT_MS;
        } else {
            this.trialBtnFocused = false;
            this.trialBtnTime = this.curTime;
        }
    }

    _initGridVisitTime(ctime) {
        for (var i = 0; i < 11; i ++) {
            for (var j = 0; j < 11; j ++) {
                this.visitTime[i][j] = ctime;
            }
        }
    }
}

export {Dwell};