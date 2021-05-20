import { TRIGGER } from "./triggerstate.js";

class Tap {
    constructor(parent) {
        this.parent = parent;
        this.parent.status = TRIGGER.OPEN;
        this.cnt = 0;
        this.cntPositive = 0;
        this.baseRelDepth = -1;
        this.diff = 0;
        this.invert = false;
        this.palmbase = {
            x: -1,
            y: -1
        };
    }

    update(state) {
        if (!state.initiator.right.show) return;

        if (this.palmbase.x == -1 || this.palmbase.y == -1) {
            this.palmbase.x = state.initiator.right.landmarks[0].x;
            this.palmbase.y = state.initiator.right.landmarks[0].y;
        }

        const pbdiff = Math.hypot(
                            state.initiator.right.landmarks[0].x - this.palmbase.x,
                            state.initiator.right.landmarks[0].y - this.palmbase.y
                        );
        
        this.palmbase.x = 0.6*this.palmbase.x + 0.4*state.initiator.right.landmarks[0].x;
        this.palmbase.y = 0.6*this.palmbase.y + 0.4*state.initiator.right.landmarks[0].y;
        
        console.log("pbdiff:", pbdiff);
        if (pbdiff > 20.0) {
            this.parent.status = TRIGGER.OPEN;
            this._resetDepthTracking();
            return;
        }

        const relDepth = state.initiator.right.scale.thickness;

        if (this.baseRelDepth < 0) this.baseRelDepth = relDepth;
        this.diff = (relDepth - this.baseRelDepth) * 2;

        console.log("this.diff:", this.diff, "this.baseRelDepth:", this.baseRelDepth, "relDepth:", relDepth);

        
        console.log("state.technique.invertTrigger:", state.technique.invertTrigger);
        if (state.technique.invertTrigger) this.diff = -this.diff;
        
        this.diff = this.diff.toFixed(1);
        
        if (this.diff < -1.0) {
            if (this.parent.status != TRIGGER.PRESSED) {
                this.cntPositive += 1;
                if (this.cntPositive > 1) {
                    this.parent.status = TRIGGER.PRESSED;
                    this.cnt = 0;
                    this.cntPositive = 0;
                }
            } else {
                this.cnt += 1;
            }
        } else if (this.diff > 1.0) {
            if (this.parent.status == TRIGGER.PRESSED) {
                this.cntPositive += 1;
                if (this.cntPositive > 1) {
                    this.parent.status = TRIGGER.RELEASED;
                    this.cnt = 0;
                    this.cntPositive = 0;
                }
            } else if (this.parent.status == TRIGGER.RELEASED) {
                this.cnt += 1;
            } else {
                this.parent.status = TRIGGER.OPEN;
                this.cnt = 0;
                this.cntPositive = 0;
            }
        } else {
            this.cnt += 1;
        }
        
        // ~ exponentially moving average
        this.baseRelDepth = 0.1*this.baseRelDepth + 0.9*relDepth;
        
        if (this.cnt > 6) {
            this.cnt = 0;
            this.cntPositive = 0;
            this.parent.status = TRIGGER.OPEN;
        }
    }

    reset() {
        this._resetDepthTracking();
        this.palmbase.x = -1;
        this.palmbase.y = -1;
    }

    _resetDepthTracking() {
        this.cnt = 0;
        this.cntPositive = 0;
        this.baseRelDepth = -1;
        this.diff = 0;
    }
}

export {Tap};