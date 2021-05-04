import {S2HRelative} from './s2h_rel.js';
import {Grid} from './grid.js';


class Technique {
    constructor(state) {
        this.grid = {}
        this.grid.input = new Grid(state, "input");
        this.grid.output = new Grid(state, "output");
        
        this.selection = {
            currentBtn: {
                row_i: -1,
                col_j: -1
            },
            previousBtn: {
                row_i: -1,
                col_j: -1
            }, 
            locked: false
        }
        
        this.last_time_visited = [...Array(11)].map(e => Array(11));
        this.visited_cells = 0;
        this.message = "";

        this.name = state.menu.technique;
        if (this.name == "S2H_Relative") {
            this.anchor = new S2HRelative(this);
        }
        
    }

    calculate(state) {
        this.anchor.calculate(state);
    }

    draw(state) {
        this.anchor.draw(state);        
    }

    _setupSelection(state) {
        this.selection.previousBtn = this.selection.currentBtn;
        if (this.selection.locked) {
            return;
        }
        
        const btn = this.grid.input.btnPointedBy(state.cursor);
        // console.log("_setupSelection() btn:", btn);

        if (btn.row_i != -1 && btn.col_j != -1) {
            if (btn.row_i != this.selection.previousBtn.row_i || 
                btn.col_j != this.selection.previousBtn.col_j) {
                
                this.last_time_visited[btn.row_i][btn.col_j] = Date.now();
                this.message = `Highlighted: ${(btn.row_i-1)*this.grid.input.divisions + btn.col_j}`;
                this.visited_cell += 1;
                
                // console.log("changing highlight, tech:", this);
            }
            
            this.selection.currentBtn.row_i = btn.row_i;
            this.selection.currentBtn.col_j = btn.col_j;
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
                cv.rectangle(
                    state.overlay,
                    new cv.Point(this.grid.output.x_cols[j], this.grid.output.y_rows[i]),
                    new cv.Point(this.grid.output.x_cols[j]+this.grid.output.dx_col, this.grid.output.y_rows[i] + this.grid.output.dy_row),
                    c,
                    -1
                );
            }
        }

        if (this.selection.currentBtn.row_i != -1 &&
            this.selection.currentBtn.col_j != -1) {

            let c = new cv.Scalar(25, 25, 255);
            cv.rectangle(
                state.overlay,
                new cv.Point(this.grid.output.x_cols[this.selection.currentBtn.col_j], this.grid.output.y_rows[this.selection.currentBtn.row_i]),
                new cv.Point(this.grid.output.x_cols[this.selection.currentBtn.col_j]+this.grid.output.dx_col, this.grid.output.y_rows[this.selection.currentBtn.row_i] + this.grid.output.dy_row),
                c,
                -1
            );
        }
    }

}


function getTechnique(state) {
    console.log("getTechnique state:", state);
    return new Technique(state);

}


export {getTechnique};