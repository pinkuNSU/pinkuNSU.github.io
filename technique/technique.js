import {S2HRelative} from './s2h_rel.js';
import {Grid} from '../ds/grid.js';
import { TechniqueType } from './constant.js';
import { MidAir } from './midair.js';



class Technique {
    constructor(state) {
        this.type = TechniqueType.Unassigned;
        this.grid = {}
        this.grid.input = new Grid(state, "input");
        this.grid.output = new Grid(state, "output");
                
        this.last_time_visited = [...Array(11)].map(e => Array(11));
        this.visited_cells = 0;
        this.message = "";

        this.name = state.menu.technique;

        console.log("tech name:", this.name);
        
        switch(this.name) {
            case "S2H_Relative":
                console.log("S2H_Relative enterered");
                this.anchor = new S2HRelative(this, state);
                break;
            case "MidAir":
                console.log("MidAir enterered");
                this.anchor = new MidAir(this, state);
                break;
            default:
                break;
        }
    }

    calculate(state) {
        this.anchor.calculate(state);
    }

    draw(state) {
        this.anchor.draw(state);        
    }

    _setupSelection(state) {
        state.selection.previousBtn.row_i = 
            state.selection.currentBtn.row_i;
        state.selection.previousBtn.col_j = 
            state.selection.currentBtn.col_j;

        if (state.selection.locked) {
            return;
        }
        
        const btn = this.grid.input.btnPointedBy(state.cursor);

        if (btn.row_i != -1 && btn.col_j != -1) {
            if (btn.row_i != state.selection.previousBtn.row_i || 
                btn.col_j != state.selection.previousBtn.col_j) {
                
                this.last_time_visited[btn.row_i][btn.col_j] = performance.now();
                state.selection.messages.selected = 
                    `Highlighted: ${(btn.row_i-1)*this.grid.input.divisions + btn.col_j}`;
                this.visited_cell += 1;
            }
            
            state.selection.currentBtn.row_i = btn.row_i;
            state.selection.currentBtn.col_j = btn.col_j;
        } 
    }

    _draw_main_grid_layout(state) {
        
        // cv.rectangle(state.overlay, new cv.Point(384,0),new cv.Point(510,128),new cv.Scalar(0,255,0),3);

        cv.rectangle(
            state.overlay,
            new cv.Point(this.grid.output.x, this.grid.output.y),
            new cv.Point(this.grid.output.x + this.grid.output.width, this.grid.output.y + this.grid.output.height),
            new cv.Scalar(240, 250, 255),
            -1
        );
    }

    _drawCells(state) {
        for (var i = 1; i <= this.grid.output.divisions; i ++) {
            for (var j = 1; j <= this.grid.output.divisions; j ++) {
                let c = new cv.Scalar(255, 25, 25);
                
                if(i == state.selection.markedBtn.row_i && 
                    j == state.selection.markedBtn.col_j) {
                        
                        c = new cv.Scalar(0, 255, 0);
                    }

                cv.rectangle(
                    state.overlay,
                    new cv.Point(this.grid.output.x_cols[j], this.grid.output.y_rows[i]),
                    new cv.Point(
                        this.grid.output.x_cols[j] + this.grid.output.dx_col, 
                        this.grid.output.y_rows[i] + this.grid.output.dy_row),
                    c,
                    -1
                );
            }
        }

        if (state.selection.currentBtn.row_i != -1 &&
            state.selection.currentBtn.col_j != -1) {

            let c = new cv.Scalar(25, 25, 255);
            cv.rectangle(
                state.overlay,
                new cv.Point(
                    this.grid.output.x_cols[state.selection.currentBtn.col_j], 
                    this.grid.output.y_rows[state.selection.currentBtn.row_i]),
                new cv.Point(
                    this.grid.output.x_cols[state.selection.currentBtn.col_j]+this.grid.output.dx_col, 
                    this.grid.output.y_rows[state.selection.currentBtn.row_i] + this.grid.output.dy_row),
                c,
                -1
            );
        }
    }

    markSelected(state) {
        state.selection.markedBtn.row_i = state.selection.currentBtn.row_i;
        state.selection.markedBtn.col_j = state.selection.currentBtn.col_j;
        
        if (state.selection.markedBtn.row_i > 0 &&
            state.selection.markedBtn.col_j > 0) {
                state.selection.messages.marked = `Marked: ${(state.selection.currentBtn.row_i-1)*this.grid.input.divisions + state.selection.currentBtn.col_j}`;
            }
    }        
    
    _drawTextHighlighted(state) {
        if (state.selection.currentBtn.row_i != -1 &&
            state.selection.currentBtn.col_j != -1) {

                cv.putText(
                    state.overlay,
                    state.selection.messages.selected,
                    new cv.Point(5, 40),
                    cv.FONT_HERSHEY_DUPLEX,
                    1.0,
                    new cv.Scalar(240, 240, 240),
                    2
                );
            }
    }

    _drawTextMarked(state) {
        if (state.selection.markedBtn.row_i != -1 &&
            state.selection.markedBtn.col_j != -1) {

                cv.putText(
                    state.overlay,
                    state.selection.messages.marked,
                    new cv.Point(5, 80),
                    cv.FONT_HERSHEY_DUPLEX,
                    1.0,
                    new cv.Scalar(0,100,0),
                    2
                );
            }
    }

    _drawProgressBar(state) {
        if (state.progressBar.size >= 0) {
            const pwidth = state.progressBar.size * state.progressBar.maxWidth;

            cv.rectangle(
                state.overlay,
                new cv.Point(10, state.height-10-state.progressBar.maxHeight),
                new cv.Point(10+pwidth, state.height-10),
                new cv.Scalar(0,100,0),
                cv.FILLED,
                8,
                0
            );

            cv.rectangle(
                state.overlay,
                new cv.Point(10+pwidth, state.height-10-state.progressBar.maxHeight),
                new cv.Point(10+state.progressBar.maxWidth, state.height-10),
                new cv.Scalar(128,128,128),
                cv.FILLED,
                8,
                0
            );

            cv.rectangle(
                state.overlay,
                new cv.Point(10, state.height-10-state.progressBar.maxHeight),
                new cv.Point(10+state.progressBar.maxWidth, state.height-10),
                new cv.Scalar(128,128,128),
                2,
                8,
                0
            );
        }
    }
}


export {Technique};