class Grid {
    constructor(state, name) {
        this.name = name;
        this.height = state.height/4;
        this.width = state.width/4;
        this.x = 0;
        this.y = 0;
        this.gap = 5;
        this.divisions = state.menu.cellscnt;
        this.x_cols = Array(11);
        this.y_rows = Array(11);
        console.log("grid:", this);
    }
    
    align(state) {
        
        this.dx_col = (this.width - (this.divisions+1)*this.gap) / this.divisions;
        this.dy_row = (this.height - (this.divisions+1)*this.gap) / this.divisions;
        this.dx_col_half = this.dx_col/2;
        this.dy_row_half = this.dy_row/2;

        this.x_cols[0] = this.x;
        this.x_cols[1] = this.x_cols[0] + this.gap;
        for (var i = 2; i <= this.divisions; i ++) {
            this.x_cols[i] = this.x_cols[i-1] + this.dx_col + this.gap;
        }

        this.y_rows[0] = this.y;
        this.y_rows[1] = this.y_rows[0] + this.gap;
        for (var i = 2; i <= this.divisions; i ++) {
            this.y_rows[i] = this.y_rows[i-1] + this.dy_row + this.gap;
        }
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
                        if (cursor.x >= this.x_cols[j] && (cursor.x <= this.x_cols[j] + this.dx_col)) {
                            ret.col_j = j;
                            break;
                        }
                    }
                    
                    for (var i = 1; i <= this.divisions; i ++) {
                        if (cursor.y >= this.y_rows[i] && (cursor.y <= this.y_rows[i] + this.dy_row)) {
                            ret.row_i = i;
                            break;
                        }
                    }
                }
        }

        return ret;
    }
}

export {Grid};