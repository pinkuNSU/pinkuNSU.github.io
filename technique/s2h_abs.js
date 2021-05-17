import {TechniqueType} from "./constant.js";

class S2HAbsolute {
    constructor(parent, state) {
        this.name = "S2H_Absolute";
        this.parent = parent;
        this.parent.type = TechniqueType.S2H_Absolute;

    }

    calculate(state) {

        if (!this.parent.staticDisplay) {
            this.parent.staticDisplay = true;
            let palm = state.palmRect();

            const w = Math.max(100, Math.min(400, palm.maxDim));
            
            this.parent.grid.input.width    = w;
            this.parent.grid.input.height   = w;
            this.parent.grid.output.width   = w;
            this.parent.grid.output.height  = w;
            
            this.parent.grid.input.x    = Math.max(100, Math.min(250, palm.x));
            this.parent.grid.input.y    = Math.max(100, Math.min(250, palm.y));
            this.parent.grid.output.x   = Math.max(100, Math.min(250, palm.x));
            this.parent.grid.output.y   = Math.max(100, Math.min(250, palm.y));
        }
        
        
        if (this.parent.staticDisplay &&
            this.parent.grid.input.x > 0 && 
            this.parent.grid.input.y > 0) {
            
                this.parent.grid.input.align(state);
                this.parent.grid.output.align(state);

                this.parent._setupSelection(state);
        }
    }

    draw(state) {
        if (!state.initiator.left.show) return;

        this.parent._draw_main_grid_layout(state);   
        this.parent._drawCells(state);
        this.parent._drawTextHighlighted(state);
        this.parent._drawTextMarked(state);
        this.parent._drawProgressBar(state);
    }
}


export {S2HAbsolute};