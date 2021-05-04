

class S2HRelative {
    constructor(parent) {
        this.name = "S2H_Relative";
        this.parent = parent;
    }

    calculate(state) {

        if (!state.initData.left.show) return;

        let palm = state.palmRect();
        
        const w = Math.max(64, Math.min(400, palm.maxDim));
        
        this.parent.grid.input.width    = w;
        this.parent.grid.input.height   = w;
        this.parent.grid.output.width   = w;
        this.parent.grid.output.height  = w;
        
        this.parent.grid.input.x    = palm.x;
        this.parent.grid.input.y    = palm.y;
        this.parent.grid.output.x   = palm.x;
        this.parent.grid.output.y   = palm.y;
        
        if (this.parent.grid.input.x > 0 && this.parent.grid.input.y > 0) {
            this.parent.grid.input.align(state);
            this.parent.grid.output.align(state);

            this.parent._setupSelection(state);
        }
    }

    draw(state) {
        if (!state.initData.left.show) return;

        state.overlay = state.imageCV.clone();
        this.parent._draw_main_grid_layout(state);   
        this.parent._drawCells(state);

        cv.addWeighted(
            state.overlay, 
            state.config.TRANSPARENCY_ALPHA, 
            state.imageCV, 
            1-state.config.TRANSPARENCY_ALPHA, 
            0.0, 
            state.outputCV, 
            -1);
        
        state.overlay.delete();
    }
}


export {S2HRelative};