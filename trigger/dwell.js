import { ButtonSelection } from "../ds/btnselection.js";
import { TechniqueType } from "../technique/constant.js";
import {TRIGGER} from './triggerstate.js';

class Dwell {
    constructor(parent) {
        this.parent = parent;
        
        this.visitTime = Array(11);
        for (let i = 0; i < 11; i ++)
            this.visitTime[i] = new Array(11);
        
        this.visitTimeBtnID = Array(30);

        this.curTime = performance.now();

        this._initGridVisitTime(this.curTime);

        this.selection = new ButtonSelection();

    }

    update(state) {
        if (state.technique.type == TechniqueType.Landmark_Btn || state.technique.type == TechniqueType.Landmark_Btn_FishEye) {
            this._updateBtnID(state);
        } else {
            this._update(state);
        }
    }

    _updateBtnID(state) {
        this.curTime = performance.now();
        
        // btn_id 0 based
        this.selection.previousBtn.btn_id = this.selection.currentBtn.btn_id;
        
        const btn = state.selection.currentBtn;
        
        this.selection.currentBtn.btn_id = btn.btn_id;
                
        if (btn.btn_id != -1) {
            if (this.selection.previousBtn.btn_id != -1) {
                
                if (this.selection.previousBtn.btn_id == btn.btn_id) {

                    if (state.trigger.status == TRIGGER.ONHOLD) {
                        console.error("dwell update status onhold");
                    } else {
                        const ptime = this.visitTimeBtnID[btn.btn_id];
                        let d = this.curTime - ptime;
                        if (d > state.config.DWELLWAIT_MS) {
                            state.trigger.status = TRIGGER.RELEASED;
                            d = state.config.DWELLWAIT_MS;
                        } else if (2*d > state.config.DWELLWAIT_MS) {
                            state.trigger.status = TRIGGER.PRESSED;
                        }
                        
                        state.progressBar.size = d/state.config.DWELLWAIT_MS;
                    }
                } else {
                    state.trigger.status = TRIGGER.OPEN;
                    state.progressBar.size = 0;
                    this.visitTimeBtnID[this.selection.previousBtn.btn_id] = this.curTime;
                    this.visitTimeBtnID[btn.btn_id] = this.curTime;
                }
                        
            } else {
                state.trigger.status = TRIGGER.OPEN;
                state.progressBar.size = 0;
                this.visitTimeBtnID[btn.btn_id] = this.curTime;
            }
        } else {
            state.trigger.status = TRIGGER.OPEN;
            state.progressBar.size = 0;
            if (this.selection.previousBtn.btn_id != -1) {
                this.visitTimeBtnID[this.selection.previousBtn.btn_id] = this.curTime;
            }    
        }

        this._updateOnTrialBtns(state);
    }

    _update(state) {
        this.curTime = performance.now();
        
        this.selection.previousBtn.row_i = this.selection.currentBtn.row_i;
        this.selection.previousBtn.col_j = this.selection.currentBtn.col_j;
        
        const btn = state.selection.currentBtn;
        
        this.selection.currentBtn.row_i = btn.row_i;
        this.selection.currentBtn.col_j = btn.col_j;
                
        if (btn.row_i != -1 && btn.row_j != -1) {
            if (this.selection.previousBtn.row_i != -1 && 
                this.selection.previousBtn.col_j != -1) {
                
                    if (this.selection.previousBtn.row_i == btn.row_i &&
                        this.selection.previousBtn.col_j == btn.col_j) {

                            if (state.trigger.status == TRIGGER.ONHOLD) {
                                console.error("dwell update status onhold");
                            } else {
                                const ptime = this.visitTime[btn.row_i][btn.col_j];
                                let d = this.curTime - ptime;
                                if (d > state.config.DWELLWAIT_MS) {
                                    state.trigger.status = TRIGGER.RELEASED;
                                    d = state.config.DWELLWAIT_MS;
                                } else if (2*d > state.config.DWELLWAIT_MS) {
                                    state.trigger.status = TRIGGER.PRESSED;
                                }
                                
                                state.progressBar.size = d/state.config.DWELLWAIT_MS;
                            }
                        } else {
                            state.trigger.status = TRIGGER.OPEN;
                            state.progressBar.size = 0;
                            this.visitTime[this.selection.previousBtn.row_i][this.selection.previousBtn.col_j] = this.curTime;
                            this.visitTime[btn.row_i][btn.col_j] = this.curTime;
                        }
                        
            } else {
                state.trigger.status = TRIGGER.OPEN;
                state.progressBar.size = 0;
                this.visitTime[btn.row_i][btn.col_j] = this.curTime;
            }
        } else {
            state.trigger.status = TRIGGER.OPEN;
            state.progressBar.size = 0;
            if (this.selection.previousBtn.row_i != -1 || this.selection.previousBtn.col_j != -1) {
                this.visitTime[this.selection.previousBtn.row_i][this.selection.previousBtn.col_j] = this.curTime;
            }    
        }


        this._updateOnTrialBtns(state);
    }

    _updateOnTrialBtns(state) {
        if (state.experiment.trial.isCursorOverStartBtn(state) ||
            state.experiment.trial.isCursorOverBackBtn(state)) {
            
                state.trigger.status = TRIGGER.OPEN;
                if (!this.trialBtnFocused) {
                    this.trialBtnFocused = true;
                    this.trialBtnTime = this.curTime;
                }

                let d = this.curTime - this.trialBtnTime;
                if (d > state.config.DWELLWAIT_MS) {
                    state.trigger.status = TRIGGER.RELEASED;
                    d = state.config.DWELLWAIT_MS;
                } else if (2*d > state.config.DWELLWAIT_MS) {
                    state.trigger.status = TRIGGER.PRESSED;
                }                

                state.progressBar.size = d/state.config.DWELLWAIT_MS;
        } else {
            this.trialBtnFocused = false;
            this.trialBtnTime = this.curTime;
        }
    }

    _initGridVisitTime(ctime) {
        for (let i = 0; i < 11; i ++) {
            for (let j = 0; j < 11; j ++) {
                this.visitTime[i][j] = ctime;
            }
        }
    }

    reset() {
        this._initGridVisitTime(performance.now());  
    }
}

export {Dwell};