import {S2HRelative} from './s2h_rel.js';
import {S2HAbsolute} from './s2h_abs.js';
import {H2SRelative} from './h2s_rel.js';
import { MidAir }    from './midair.js';

import {Grid} from '../ds/grid.js';
import { TechniqueType } from './constant.js';
import { H2SAbsolute } from './h2s_abs.js';


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

        this.stats = {
            visitedCells: 0
        };

        this.images = {
            palm: {
                image: null,
                mask: null,
                topleft: {
                    x: -1,
                    y: -1
                },
                width: -1,
                height: -1
            },
            background: {
                image: null
            }
        };

        console.log("tech name:", this.name);
        
        switch(this.name) {
            case "S2H_Relative":
                this.anchor = new S2HRelative(this, state);
                break;
            case "S2H_Absolute":
                this.anchor = new S2HAbsolute(this, state);
                break;
            case "H2S_Relative":
                this.anchor = new H2SRelative(this, state);
                break;
            case "H2S_Absolute":
                this.anchor = new H2SAbsolute(this, state);
                break;
            case "MidAir":
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

    resetLastTimeVisited() {
        const t = performance.now();
        for (let i = 0; i < 11; i ++) {
            for (let j = 0; j < 11; j ++) {
                this.last_time_visited[i][j] = t;
            }
        }
    }

    _setupPalmActiveZone(state) {
        const g = state.palmbase();

        if (g) {
            this.images.palm.topleft.x = g.x - this.images.palm.image.cols/2;
            this.images.palm.topleft.y = g.y - this.images.palm.image.rows;
            
            if (this.images.palm.topleft.x < 0) this.images.palm.topleft.x = 0;
            if (this.images.palm.topleft.y < 0) this.images.palm.topleft.y = 0;

            if (this.width < this.images.palm.topleft.x + this.images.palm.image.cols) 
                this.images.palm.topleft.x = this.width - this.images.palm.image.cols;
        
            if (this.height < this.images.palm.topleft.y + this.images.palm.image.rows) 
                this.images.palm.topleft.y = this.height - this.images.palm.image.rows;
        }
    }

    _setupPalmImageTopLeft(state) {
        const g = this.grid.input.getBottomMiddle();
        
        if (g.x != -1 && g.y != -1) {
            this.images.palm.topleft.x = g.x - this.images.palm.image.cols/2;
            this.images.palm.topleft.y = g.y - this.images.palm.image.rows;
            
            if (this.images.palm.topleft.x < 0) this.images.palm.topleft.x = 0;
            if (this.images.palm.topleft.y < 0) this.images.palm.topleft.y = 0;

            if (this.width < this.images.palm.topleft.x + this.images.palm.image.cols) 
                this.images.palm.topleft.x = this.width - this.images.palm.image.cols;
            
            if (this.height < this.images.palm.topleft.y + this.images.palm.image.rows) 
                this.images.palm.topleft.y = this.height - this.images.palm.image.rows;
        }
    }

    _setupPalmImage(width, height) {
        this.images.palm.width = width;
        this.images.palm.height = height;
        this.images.palm.image = cv.imread('imgpalm', cv.CV_LOAD_UNCHANGED);
        cv.flip(this.images.palm.image, this.images.palm.image, 1);

        if (this.images.palm.image.channels() < 4) {
            console.error("less than 4 channels");
            return;
        }

        cv.resize(this.images.palm.image, this.images.palm.image, new cv.Size(width, height));

        let rgbaPlanes = new cv.MatVector();
        cv.split(this.images.palm.image, rgbaPlanes);
        this.images.palm.mask = rgbaPlanes.get(3);
        cv.merge(rgbaPlanes, this.images.palm.image);
        rgbaPlanes.delete();
    }

    _setupBackground(state) {
        this.images.background.image = cv.imread('imgbackground', cv.CV_LOAD_UNCHANGED);
        cv.resize(
            this.images.background.image, 
            this.images.background.image, 
            new cv.Size(state.width, state.height)
        );
    }

    _setupSelection(state) {

        if (state.selection.locked) return;

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

            state.selection.addToPastSelections(btn);
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

        // if (state.selection.currentBtn.row_i != -1 &&
        //     state.selection.currentBtn.col_j != -1) {

        //     let c = new cv.Scalar(25, 25, 255);
        //     cv.rectangle(
        //         state.overlay,
        //         new cv.Point(
        //             this.grid.output.x_cols[state.selection.currentBtn.col_j], 
        //             this.grid.output.y_rows[state.selection.currentBtn.row_i]),
        //         new cv.Point(
        //             this.grid.output.x_cols[state.selection.currentBtn.col_j]+this.grid.output.dx_col, 
        //             this.grid.output.y_rows[state.selection.currentBtn.row_i] + this.grid.output.dy_row),
        //         c,
        //         -1
        //     );
        // }
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