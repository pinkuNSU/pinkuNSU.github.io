class GridFishEye {
    constructor(state, name) {
        this.name = name;
        this.height = state.height/4;
        this.width = state.width/4;
        this.x = 0;
        this.y = 0;
        this.gap = 3;
        this.divisions = state.menu.cellscnt;
        this.x_cols = Array(11);
        this.y_rows = Array(11);
        this.col_weights = Array(11);
        this.row_weights = Array(11);

        this.col_weights[1] = state.config.fisheye.MAXWEIGHT;
        this.row_weights[1] = state.config.fisheye.MAXWEIGHT;
        for (let i = 2; i <= this.divisions; i ++) {
            this.col_weights[i] = 1;
            this.row_weights[i] = 1;    
        }

        this.weightSum = 0;
        for (let i = 1; i <= this.divisions; i ++) 
            this.weightSum += this.col_weights[i];
    }

    getBottomMiddle() {
        return {
            x: this.x + this.width/2,
            y: this.y + this.height
        };
    }
    
    setMajorWeight(state) {
        const row_y = state.selection.currentBtn.row_i;
        const col_x = state.selection.currentBtn.col_j;

        for (let j = 1; j <= this.divisions; j ++)
            this.col_weights[j] = 1;
        this.col_weights[col_x] = state.config.fisheye.MAXWEIGHT;

        for (let i = 1; i <= this.divisions; i ++) 
            this.row_weights[i] = 1;
        this.row_weights[row_y] = state.config.fisheye.MAXWEIGHT;
    }

    align(state) {
        
        this.dx_col = (this.width - (this.divisions+1)*this.gap) / this.weightSum;
        this.dy_row = (this.height - (this.divisions+1)*this.gap) / this.weightSum;

        this.x_cols[0] = this.x;
        this.x_cols[1] = this.x_cols[0] + this.gap;
        for (var i = 2; i <= this.divisions; i ++) {
            this.x_cols[i] = this.x_cols[i-1] + (this.col_weights[i-1]*this.dx_col) + this.gap;
        }
        this.x_cols[this.divisions + 1] = this.x + this.width;

        this.y_rows[0] = this.y;
        this.y_rows[1] = this.y_rows[0] + this.gap;
        for (var i = 2; i <= this.divisions; i ++) {
            this.y_rows[i] = this.y_rows[i-1] + (this.row_weights[i-1]*this.dy_row) + this.gap;
        }
        this.y_rows[this.divisions + 1] = this.y + this.height;
    }

    btnPointedBy(cursor) {
        const ret = {
            row_i: -1,
            col_j: -1
        };

        
        if (cursor) {
            // cursor can be null if not found
            
            if (cursor.x >= this.x_cols[0] && cursor.x <= this.x_cols[0]+this.width &&
                cursor.y >= this.y_rows[0] && cursor.y <= this.y_rows[0]+this.height) {
                    
                    for (var j = 1; j <= this.divisions; j ++) {
                        if (cursor.x >= this.x_cols[j] && (cursor.x <= this.x_cols[j+1] - this.gap)) {
                            ret.col_j = j;
                            break;
                        }
                    }
                    
                    for (var i = 1; i <= this.divisions; i ++) {
                        if (cursor.y >= this.y_rows[i] && (cursor.y <= this.y_rows[i+1] - this.gap)) {
                            ret.row_i = i;
                            break;
                        }
                    }
                }
        }

        return ret;
    }

    isCursorInside(state) {
        return (
            state.cursor &&
            this.x_cols[0] <= state.cursor.x + 10 &&
            state.cursor.x <= this.x_cols[0] + this.width  + 10 &&
            this.y_rows[0] <= state.cursor.y + 10 &&
            state.cursor.y <= this.y_rows[0] + this.height + 10
        );
    }
}

export {GridFishEye};