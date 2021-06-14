import {TechniqueType} from "./constant.js";

export class S2HAbsolute {
    constructor(parent, state) {
        this.name = "S2H_Absolute";
        this.parent = parent;
        this.parent.type = TechniqueType.S2H_Absolute;

        this.parent._setGridAbsolute(state);
    }

    calculate(state) {

        if (!this.parent.staticDisplay) {
            this.parent.staticDisplay = true;
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
