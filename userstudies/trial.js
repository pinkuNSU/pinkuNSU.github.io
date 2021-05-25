
import {TrialState, TrialBtnState} from './constant.js';
import { TechniqueType } from '../technique/constant.js';

class Trial {
    constructor(state) {
        this.status         = TrialState.OPEN;
        this.visitTimeBtn   = performance.now();
        
        this.cursorOverBtn      = false;
        this.cursorOverBackBtn  = false;
        
        this.startBtn = {
            rect: new cv.Rect(1, 1, 70, 50),
            label: 'Start',
            color: new cv.Scalar(20, 20, 20)
        }

        this.backBtn = {
            rect: new cv.Rect(state.width-150, state.height/2-25, 140, 50),
            label: 'Go back',
            color: new cv.Scalar(20, 200, 200)
        }

        this.targetID       = -1;
        this.targetSeqSize  = state.menu.targetscnt;

        this.targetsStartTime   = new Array(21);
        this.targetsEndTime     = new Array(21);
        this.targetsDuration    = new Array(21);
        this.targetSeq          = new Array(21);



        this.stats = {
            attempts: (new Array(21)).fill(0),
            distance: {
                cursor: (new Array(21)).fill(0),
                palm: {
                    left: (new Array(21)).fill(0),
                    right: (new Array(21)).fill(0)
                }
            }, 
            lastPos: {
                cursor: {x: -1, y: -1},
                palm: {
                    left: {x: -1, y: -1},
                    right: {x: -1, y: -1}
                }
            },
            visitedCells: (new Array(21)).fill(0),
            targetsLastVisitedTime: (new Array(21)).fill(0) 
        }
    }

    

    elapsedTime() {
        if (this.targetsStartTime[this.targetID]) {
            return (performance.now() - this.targetsStartTime[this.targetID]).toFixed(1);
        }

        return 0.0;
    }

    lastVisitTime() {
        return this.stats.targetsLastVisitedTime[this.targetID].toFixed(1);
    }

    updateTargetLastVisitTime(state) {
        const p = this.targetSeq[this.targetID];
        this.stats.targetsLastVisitedTime[this.targetID] =
            state.technique.stats.lastVisitTime[p.row_i][p.col_j] -
                this.targetsStartTime[this.targetID];
    }

    updateVisitedCells(state) {
        this.stats.visitedCells[this.targetID] = 
            state.technique.stats.visitedCells;
    }

    updateTargetTime() {
        this.targetsEndTime[this.targetID] = performance.now();
        this.targetsDuration[this.targetID] = 
            this.targetsEndTime[this.targetID] - this.targetsStartTime[this.targetID];
    
    }

    updateRightPalmDist(state) {
        if (state.initiator.right && 
            state.initiator.right.landmarks[0].x > 0 && 
            state.initiator.right.landmarks[0].y > 0) {
                if (this.stats.lastPos.palm.right.x > 0) {
                    this.stats.distance.palm.right[this.targetID] += Math.hypot(
                        state.initiator.right.landmarks[0].x - this.stats.lastPos.palm.right.x,
                        state.initiator.right.landmarks[0].y - this.stats.lastPos.palm.right.y
                    ); 
                }

                this.stats.lastPos.palm.right.x = state.initiator.right.landmarks[0].x;
                this.stats.lastPos.palm.right.y = state.initiator.right.landmarks[0].y;
            
            } else {
                this.stats.lastPos.palm.right.x = -1;
                this.stats.lastPos.palm.right.y = -1;
            }
    }

    updateLeftPalmDist(state) {
        if (state.initiator.left && 
            state.initiator.left.landmarks[0].x > 0 && 
            state.initiator.left.landmarks[0].y > 0) {
                if (this.stats.lastPos.palm.left.x > 0) {
                    this.stats.distance.palm.left[this.targetID] += Math.hypot(
                        state.initiator.left.landmarks[0].x - this.stats.lastPos.palm.left.x,
                        state.initiator.left.landmarks[0].y - this.stats.lastPos.palm.left.y                    
                    ); 
                }

                this.stats.lastPos.palm.left.x = state.initiator.left.landmarks[0].x;
                this.stats.lastPos.palm.left.y = state.initiator.left.landmarks[0].y;
            
            } else {
                this.stats.lastPos.palm.left.x = -1;
                this.stats.lastPos.palm.left.y = -1;
            }
    }

    updateCursorDistTraveled(state) {
        if (state.cursor && 
            state.cursor.x > 0 && 
            state.cursor.y > 0) {

                if (this.stats.lastPos.cursor.x > 0) {
                    const d = Math.hypot(
                        state.cursor.x - this.stats.lastPos.cursor.x,
                        state.cursor.y - this.stats.lastPos.cursor.y
                    );
                    
                    this.stats.distance.cursor[this.targetID] += d;
                }

                this.stats.lastPos.cursor.x = state.cursor.x;
                this.stats.lastPos.cursor.y = state.cursor.y;
    
        } else {
            this.stats.lastPos.cursor.x = -1;
            this.stats.lastPos.cursor.y = -1;
        }

    }

    incrementAttempts() {
        this.stats.attempts[this.targetID] ++;
    }

    started() {
        return this.status == TrialState.STARTED;
    }

    isCursorOverStartBtn(state) {     
        if (state.cursor) {
            if (this.status != TrialState.DONE) {
                const r = this.startBtn.rect;
                if (this.status != TrialState.STARTED &&
                    r.x <= state.cursor.x && state.cursor.x <= r.x + r.width + 50 &&
                    r.y <= state.cursor.y && state.cursor.y <= r.y + r.height + 50) {
                        return true;
                        // if (!this.cursorOverBtn) {
                        //     this.cursorOverBtn = true;
                        //     this.visitTimeBtn = performance.now();
                        // }
    
                        // return (performance.now() - this.visitTimeBtn) > 5;
                    }
            }
        } 
            
        this.cursorOverBtn = false;
        return false;
    }

    isCursorOverBackBtn(state) {
        if (state.cursor) {
            if (this.status == TrialState.DONE) {
                const b = this.backBtn.rect;
                
                if (this.status == TrialState.DONE &&
                    b.x <= state.cursor.x && state.cursor.x <= b.x + b.width &&
                    b.y <= state.cursor.y && state.cursor.y <= b.y + b.height) {
                        return true;
                        // if (!this.cursorOverBackBtn) {
                        //     this.cursorOverBackBtn = true;
                        //     this.visitTimeBackBtn = performance.now();
                        // }
                        
                        // return (performance.now() - this.visitTimeBackBtn) > 5;
                    }
            }
        } 
            
        this.cursorOverBackBtn = false;
        return false;
    }

    updateBackBtnInputLoc(state) {
        
        let tl = new cv.Point(
            state.technique.grid.input.x_cols[0] + state.technique.grid.input.width + 10,
            state.technique.grid.input.y_rows[0] + state.technique.grid.input.height/2 - 45
        );

        let br = new cv.Point(
            state.technique.grid.input.x_cols[0] + state.technique.grid.input.width + 10 + 130,
            state.technique.grid.input.y_rows[0] + state.technique.grid.input.height/2 + 45
        );

        if (state.technique.type == TechniqueType.H2S_Absolute) {
            tl = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 - 45
            );

            br = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10 + 130,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 + 45    
            );
        } 

        this.backBtn.rect = new cv.Rect(tl.x, tl.y, br.x-tl.x, br.y-tl.y);
    }

    updateStartBtnInputLoc(state) {
        
        let tl = new cv.Point(
            state.technique.grid.input.x_cols[0] + state.technique.grid.input.width + 10,
            state.technique.grid.input.y_rows[0] + state.technique.grid.input.height/2 - 45
        );

        let br = new cv.Point(
            state.technique.grid.input.x_cols[0] + state.technique.grid.input.width + 10 + 100,
            state.technique.grid.input.y_rows[0] + state.technique.grid.input.height/2 + 45
        );

        if (state.technique.type == TechniqueType.H2S_Absolute) {
            tl = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 - 45
            );

            br = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10 + 100,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 + 45    
            );
        } 

        this.startBtn.rect = new cv.Rect(tl.x, tl.y, br.x-tl.x, br.y-tl.y);
    }

    drawBackBtn(state) {
        if (this.status == TrialState.DONE) {

            let tl = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 - 45
            );
    
            let br = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10 + 120,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 + 45
            );
    
            if (state.technique.type == TechniqueType.H2S_Absolute) {
                tl = new cv.Point(
                    state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10,
                    state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 - 45
                );
    
                br = new cv.Point(
                    state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10 + 120,
                    state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 + 45    
                );
            }

            cv.rectangle(
                state.overlay,
                tl,
                br,
                this.backBtn.color,
                -1
            );

            cv.putText(
                state.overlay,
                this.backBtn.label,
                new cv.Point(-45 + (tl.x + br.x)/2, (tl.y + br.y + 10)/2),
                cv.FONT_HERSHEY_SIMPLEX,
                0.8,
                new cv.Scalar(225, 225, 225),
                2
            );
        }
    }
    
    drawStartBtn(state) {
        if (this.status == TrialState.DONE) {
            return;
        }

        let tl = new cv.Point(
            state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10,
            state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 - 45
        );

        let br = new cv.Point(
            state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10 + 90,
            state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 + 45
        );

        if (state.technique.type == TechniqueType.H2S_Absolute) {
            tl = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 - 45
            );

            br = new cv.Point(
                state.technique.grid.output.x_cols[0] + state.technique.grid.output.width + 10 + 90,
                state.technique.grid.output.y_rows[0] + state.technique.grid.output.height/2 + 45    
            );
        }


        // if (this.status == TrialState.STARTED) {
        //     this.startBtn.color = new cv.Scalar(220, 248, 255);
        // }

        if (this.status == TrialState.OPEN ||
            this.status == TrialState.PAUSED) {
        
                cv.rectangle(
                    state.overlay,
                    tl,
                    br,
                    this.startBtn.color,
                    -1
                );

                cv.putText(
                    state.overlay,
                    this.startBtn.label,
                    new cv.Point(-30 + (tl.x + br.x)/2, (tl.y + br.y + 10)/2),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    new cv.Scalar(225, 225, 225),
                    2
                );

            }
    }

    drawCompletedTargetsText(state) {
        if (this.status == TrialState.STARTED) {
            cv.putText(
                state.overlay,
                this.targetID + "/" + this.targetSeqSize,
                new cv.Point(state.width-110, state.height-20),
                cv.FONT_HERSHEY_SIMPLEX,
                1.0,
                new cv.Scalar(200, 200, 200),
                2
            );
        }
    }

    clickStartBtn(state) {
        this.status = TrialState.STARTED;
        this.startBtn.label = 'Next';
        this.targetsStartTime[this.targetID] = performance.now();
    }

    generateTarget(state) {
        if (this.status == TrialState.DONE) {
            return;
        }

        this.targetID += 1;
        
        if (this.targetID == this.targetSeqSize) {
            this.status = TrialState.DONE;
        }

        let row_i = 1 + Math.floor(Math.random()*state.menu.cellscnt);
        let col_j = 1 + Math.floor(Math.random()*state.menu.cellscnt);

        while (state.prev_marked_i == row_i && state.prev_marked_j == col_j) {
            row_i = 1 + Math.floor(Math.random()*state.menu.cellscnt);
            col_j = 1 + Math.floor(Math.random()*state.menu.cellscnt);        
        }

        this.targetSeq[this.targetID] = {row_i, col_j};
    }

    matched(state) {        
        return (
            state.selection.currentBtn.row_i == this.targetSeq[this.targetID].row_i &&
            state.selection.currentBtn.col_j == this.targetSeq[this.targetID].col_j
        );
    }

    clickTarget(state) {
        this.targetsEndTime[this.targetID] = performance.now();
        this.targetsDuration[this.targetID] =
            (this.targetsEndTime[this.targetID] - this.targetsStartTime[this.targetID]);
    
        this.status = TrialState.PAUSED;
    }

    drawTarget(state) {
        if (this.status == TrialState.DONE) {
            return;
        }

        if (this.status == TrialState.STARTED) {
            
            cv.rectangle(
                state.overlay,
                new cv.Point(
                    state.technique.grid.output.x_cols[this.targetSeq[this.targetID].col_j],
                    state.technique.grid.output.y_rows[this.targetSeq[this.targetID].row_i]
                ),
                new cv.Point(
                    state.technique.grid.output.x_cols[this.targetSeq[this.targetID].col_j+1] - state.technique.grid.output.gap,
                    state.technique.grid.output.y_rows[this.targetSeq[this.targetID].row_i+1] - state.technique.grid.output.gap    
                ),
                new cv.Scalar(128, 0, 128),
                -1
            );
        }
    }
}

export {Trial};