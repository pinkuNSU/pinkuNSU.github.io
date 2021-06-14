import {S2HRelative}            from './s2h_rel.js';
import {S2HAbsolute}            from './s2h_abs.js';
import {H2SRelative}            from './h2s_rel.js';
import {MidAir}                 from './midair.js';
import {FishEye}                from './fisheye.js';
import {Grid}                   from '../ds/grid.js';
import { TechniqueType }        from './constant.js';
import { H2SAbsolute }          from './h2s_abs.js';
import {GridFishEye}            from '../ds/gridfisheye.js';
import {S2HRelativeFinger}      from './s2h_rel_finger.js';
import {H2SRelativeFinger}      from './h2s_rel_finger.js';
import {LandmarkBtn}            from './landmark_btn.js';
import {LandmarkBtnFishEye}     from './landmark_btn_fisheye.js';


class Technique {
    constructor(state) {
        this.type = TechniqueType.Unassigned;
        
        this.name = state.menu.technique;
        
        this.grid = {}
        
        if (this.name.toLowerCase().includes("fisheye")) {
            this.grid.input = new GridFishEye(state, "fisheye_input");
            this.grid.output = new GridFishEye(state, "fisheye_output");
        } else {
            this.grid.input = new Grid(state, "input");
            this.grid.output = new Grid(state, "output");
        }
        
        this.message = "";

        this.stats = {
            visitedCells: 0,
            lastVisitTime: [...Array(11)].map(e => Array(11)),
            lastVisitTimeByID: [...Array(11)].map(e => Array(11))
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
            case "FishEye":
                this.anchor = new FishEye(this, state);
                break;
            case "S2H_Relative_Finger":
                this.anchor = new S2HRelativeFinger(this, state);
                break;
            case "H2S_Relative_Finger":
                this.anchor = new H2SRelativeFinger(this, state);
                break;
            case "Landmark_Btn":
                this.anchor = new LandmarkBtn(this, state);
                break;
            case "Landmark_Btn_FishEye":
                this.anchor = new LandmarkBtnFishEye(this, state);
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

    reset() {
        if (this.type == TechniqueType.Landmark_Btn || state.technique.type == TechniqueType.Landmark_Btn_FishEye) {
            console.log("landmark btn technique reset");
        } else {
            this.grid.input.reset();
            this.grid.output.reset();
        }
    }

    resetLastTimeVisited() {
        const t = performance.now();
        for (let i = 0; i < 11; i ++) {
            for (let j = 0; j < 11; j ++) {
                this.stats.lastVisitTime[i][j] = t;
            }
        }
    }

    isCursorInside(state) {
        if (this.type == TechniqueType.Landmark_Btn || state.technique.type == TechniqueType.Landmark_Btn_FishEye) {
            return this._isCursorInsideBtnID(state);
        }

        return this._isCursorInside(state);
    }

    _isCursorInside(state) {
        return this.grid.input.isCursorInside(state);
    }

    _isCursorInsideBtnID(state) {
        return this.anchor.isCursorInside(state);
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
        // const g = this.grid.input.getBottomMiddle();
        const g = state.initiator.left.landmarks[0];
        
        if (g.x != -1 && g.y != -1) {
            this.images.palm.topleft.x = g.x - this.images.palm.image.cols/2;
            this.images.palm.topleft.y = g.y - this.images.palm.image.rows + this.images.palm.image.rows/4;
            
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

    _setupSelectionLandmarks(state) {
        state.selection.previousBtn.btn_id = state.selection.currentBtn.btn_id;

        if (state.selection.locked) return;

        const btnID = this.anchor.btnIDPointedBy(state);

        if (btnID != -1) {
            if (btnID != state.selection.previousBtn.btn_id) {
                
                this.stats.lastVisitTimeByID[btnID] = performance.now();
                state.selection.messages.selected = 
                    `Highlighted: ${btnID}`;
                this.stats.visitedCells ++;
            }
            
            state.selection.currentBtn.btn_id = btnID;

            state.selection.addToPastSelectionsBtnID(btnID);
        }

    }

    _setupSelection(state) {

        state.selection.previousBtn.row_i = 
            state.selection.currentBtn.row_i;
        state.selection.previousBtn.col_j = 
            state.selection.currentBtn.col_j;
        
        if (state.selection.locked) return;
        
        const btn = this.grid.input.btnPointedBy(state.cursor);

        if (btn.row_i != -1 && btn.col_j != -1) {
            if (btn.row_i != state.selection.previousBtn.row_i || 
                btn.col_j != state.selection.previousBtn.col_j) {
                
                this.stats.lastVisitTime[btn.row_i][btn.col_j] = performance.now();
                state.selection.messages.selected = 
                    `Highlighted: ${(btn.row_i-1)*this.grid.input.divisions + btn.col_j}`;
                this.stats.visitedCells ++;
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

    _setGridAbsolute(state) { 
        const w = state.config.ABSOLUTEWIDTH;
        
        this.grid.input.width    = w;
        this.grid.input.height   = w;
        this.grid.output.width   = w;
        this.grid.output.height  = w;
        
        this.grid.input.x    = state.width/2 - w/2;
        this.grid.input.y    = state.height/2 - w/2;
        this.grid.output.x   = state.width/2 - w/2;
        this.grid.output.y   = state.height/2 - w/2;
    }

    _drawCells(state) {
        for (let i = 1; i <= this.grid.output.divisions; i ++) {
            for (let j = 1; j <= this.grid.output.divisions; j ++) {
                let c = new cv.Scalar(255, 25, 25);
                
                if(i == state.selection.markedBtn.row_i && 
                    j == state.selection.markedBtn.col_j) {
                        
                        c = new cv.Scalar(0, 255, 0);
                    }

                cv.rectangle(
                    state.overlay,
                    new cv.Point(this.grid.output.x_cols[j], this.grid.output.y_rows[i]),
                    new cv.Point(
                        this.grid.output.x_cols[j+1] - this.grid.output.gap, 
                        this.grid.output.y_rows[i+1] - this.grid.output.gap),
                    c,
                    -1
                );
            }
        }
    }

    _markSelectedBtnID(state) {
        state.selection.markedBtn.btn_id = state.selection.currentBtn.btn_id;
        if (state.selection.markedBtn.btn_id == -1) return;
        state.selection.messages.marked = `Marked: ${state.selection.currentBtn.btn_id + 1}`;
    }

    _markSelected(state) {
        state.selection.markedBtn.row_i = state.selection.currentBtn.row_i;
        state.selection.markedBtn.col_j = state.selection.currentBtn.col_j;
        
        if (state.selection.markedBtn.row_i > 0 &&
            state.selection.markedBtn.col_j > 0) {
                state.selection.messages.marked = `Marked: ${(state.selection.currentBtn.row_i-1)*this.grid.input.divisions + state.selection.currentBtn.col_j}`;
            }
    }      

    _lastTargetVisitTimeBtnID(p) {
        return this.stats.lastVisitTimeByID[p.btn_id];
    }
    
    _lastTargetVisitTime(p) {
        return this.stats.lastVisitTime[p.row_i][p.col_j];
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