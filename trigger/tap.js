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
    }

    update(state) {

        if (!state.initData.right.show) return;

        const relDepth = state.initData.right.scale.thickness;

        if (this.baseRelDepth < 0) this.baseRelDepth = relDepth;
        this.diff = (relDepth - this.baseRelDepth) * 2;

        if (this.invert) this.diff = - this.diff;

        if (this.diff < -1.5) {
            if (this.parent.status != TRIGGER.PRESSED) {
                this.cntPositive += 1;
                if (this.cntPositive > 2) {
                    this.parent.status = TRIGGER.PRESSED;
                    this.cnt = 0;
                    this.cntPositive = 0;
                }
            } else {
                this.cnt += 1;
            }
        } else if (this.diff > 1.5) {
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

        this.baseRelDepth = 0.2*this.baseRelDepth + 0.8*relDepth;

        if (this.cnt > 8) {
            this.cnt = 0;
            this.cntPositive = 0;
            this.parent.status = TRIGGER.OPEN;
        }
    }
}

export {Tap};