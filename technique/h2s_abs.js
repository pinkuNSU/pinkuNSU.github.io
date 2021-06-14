import {TechniqueType} from "./constant.js";

export class H2SAbsolute {
    constructor(parent, state) {
        this.name = "H2S_Absolute";
        this.parent = parent;
        this.parent.type = TechniqueType.H2S_Absolute;
        this.parent._setupPalmImage(250, 250);
        this.parent._setupBackground(state);

        this.parent._setGridAbsolute(state);
        
        this.parent.grid.input.align(state);
        this.parent.grid.output.align(state);
    }

    calculate(state) {
        // if (!state.initiator.left.show) return;
        let palm = state.palmRect();
        const w = Math.max(64, Math.min(400, palm.maxDim));

        this.parent._setupPalmImage(
            Math.min(state.width-50.0, (5*w)/2),
            Math.min(state.height-50.0, (19*w)/8)
        );
        
        this.parent._setupPalmActiveZone(state);
        
        this.parent.inputBound = {
            topleft: {
                x: this.parent.images.palm.topleft.x + this.parent.images.palm.image.cols/6,
                y: this.parent.images.palm.topleft.y + (2*this.parent.images.palm.image.rows)/5
            },
            bottomright: {
                x: this.parent.images.palm.topleft.x + (2*this.parent.images.palm.image.cols)/3,
                y: this.parent.images.palm.topleft.y + (4*this.parent.images.palm.image.rows)/5
            }
        }
        
        if (this._isInsideActiveZone(state)) {
            this.parent._setupSelection(state);
        }
    }

    draw(state) {
        // if (!state.initiator.left.show) return;

        if (this.parent.images.palm.topleft.x > -1 &&
            this.parent.images.palm.topleft.y > -1) {
                let rect = new cv.Rect(
                    this.parent.images.palm.topleft.x, 
                    this.parent.images.palm.topleft.y, 
                    this.parent.images.palm.image.cols, 
                    this.parent.images.palm.image.rows);
                
                let roi = state.overlay.roi(rect);
                this.parent.images.palm.image.copyTo(
                    roi,
                    this.parent.images.palm.mask
                );

                roi.delete();
            }

        this.parent._draw_main_grid_layout(state);   
        this.parent._drawCells(state);
        this.parent._drawTextHighlighted(state);
        this.parent._drawTextMarked(state);
        this.parent._drawProgressBar(state);
    }

    _isInsideActiveZone(state) {

        if (state.cursor &&
            state.cursor.x >= (this.parent.inputBound.topleft.x - 5) &&
            state.cursor.x <= (this.parent.inputBound.bottomright.x + 5)
            ) {
                if (state.cursor.y >= (this.parent.inputBound.topleft.y - 5) &&
                    state.cursor.y <= (this.parent.inputBound.bottomright.y + 5)
                    ) {
                        return true;
                    }
            }
        
        return false;
    }

    adjustSelection(state) {
        state.selection.adjustSelection();
    }

    markSelected(state) {
        this.parent._markSelected(state);
    }

    lastTargetVisitTime(p) {
        return this.parent._lastTargetVisitTime(p);
    }
}
