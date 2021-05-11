import { TechniqueType } from "./constant.js";

class MidAir {
    constructor(parent, state) {
        this.parent = parent;
        this.parent.type = TechniqueType.MidAir;
        this.parent.staticDisplay = false;
        // this.parent.isFixedGridLoc = true;
        this.parent.alwaysShow = true;
        this.parent.invertTrigger = true;

        this.parent.grid.input.width    = state.width/3;
        this.parent.grid.input.height   = state.height/3;
        this.parent.grid.output.width   = state.width/3;
        this.parent.grid.output.height  = state.height/3;

        this.parent.grid.input.x    = state.width/2 - this.parent.grid.input.width/2;
        this.parent.grid.input.y    = state.height/2 - this.parent.grid.input.height/2;
        this.parent.grid.output.x   = state.width/2 - this.parent.grid.output.width/2;
        this.parent.grid.output.y   = state.height/2 - this.parent.grid.output.height/2;
    }

    calculate(state) {

        if (!this.parent.staticDisplay &&
            this.parent.grid.input.x > 0 && 
            this.parent.grid.input.y > 0) {

                this.parent.staticDisplay = true;
            }
        
        if (this.parent.staticDisplay) {
            this.parent.grid.input.align(state);
            this.parent.grid.output.align(state);
            this.parent._setupSelection(state);
        }
    }

    draw(state) {
        this.parent._draw_main_grid_layout(state);   
        this.parent._drawCells(state);
        this.parent._drawTextHighlighted(state);
        this.parent._drawTextMarked(state);
        this.parent._drawProgressBar(state);
    }
}

export { MidAir };