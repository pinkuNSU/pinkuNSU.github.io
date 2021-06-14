import {TechniqueType} from "./constant.js";

export class H2SRelativeFinger {
    constructor(parent, state) {
        this.name = "H2S_Relative_Finger";
        this.parent = parent;
        this.parent.type = TechniqueType.H2S_Relative_Finger;
        this.parent._setupPalmImage(250, 250);
        this.parent._setupBackground(state);
    }

    calculate(state) {

        if (!state.initiator.left.show) return;

        // let palm = state.palmRect();
        let palm = state.fingersRect();

        const w = Math.max(64, Math.min(400, palm.maxDim));
        
        this.parent.grid.input.width    = w;
        this.parent.grid.input.height   = w;
        this.parent.grid.output.width   = w;
        this.parent.grid.output.height  = w;
        
        this.parent.grid.input.x    = palm.x;
        this.parent.grid.input.y    = palm.y;
        this.parent.grid.output.x   = palm.x;
        this.parent.grid.output.y   = palm.y;

        this.parent._setupPalmImage(
            Math.min(state.width-50.0, (5*w)/2),
            Math.min(state.height-50.0, (19*w)/8)
        );
        
        if (this.parent.grid.input.x > 0 && 
            this.parent.grid.input.y > 0) {
                            
                this.parent._setupPalmImageTopLeft(state);

                this.parent.grid.input.x    = this.parent.images.palm.topleft.x + this.parent.images.palm.image.cols/5;
                this.parent.grid.input.y    = this.parent.images.palm.topleft.y + this.parent.images.palm.image.rows/10;
                this.parent.grid.output.x   = this.parent.images.palm.topleft.x + this.parent.images.palm.image.cols/5;
                this.parent.grid.output.y   = this.parent.images.palm.topleft.y + this.parent.images.palm.image.rows/10;
                
                this.parent.grid.input.align(state);
                this.parent.grid.output.align(state);

                this.parent._setupSelection(state);
        }
    }

    draw(state) {
        if (!state.initiator.left.show) return;

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
