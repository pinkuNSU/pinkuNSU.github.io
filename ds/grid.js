export class Grid {
    constructor(state, name) {
        this.name = name;
        this.height = state.config.grid.height;
        this.width = state.config.grid.width;
        this.x = 0;
        this.y = 0;
        this.gap = state.config.grid.gap;

        this.divisions = {
            row: state.menu.cellscnt.row,
            col: state.menu.cellscnt.col
        };


        this.x_cols = Array(11);
        this.y_rows = Array(11);
    }

    reset() {
        // todo figure out
    }

    getBottomMiddle() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height
        };
    }

    align(state) {

        this.dx_col = (this.width - (this.divisions.col + 1) * this.gap) / this.divisions.col;
        this.dy_row = (this.height - (this.divisions.row + 1) * this.gap) / this.divisions.row;

        this.x_cols[0] = this.x;
        this.x_cols[1] = this.x_cols[0] + this.gap;
        for (let i = 2; i <= this.divisions.col; i++) {
            this.x_cols[i] = this.x_cols[i - 1] + this.dx_col + this.gap;
        }
        this.x_cols[this.divisions.col + 1] = this.x + this.width;

        this.y_rows[0] = this.y;
        this.y_rows[1] = this.y_rows[0] + this.gap;
        for (let i = 2; i <= this.divisions.row; i++) {
            this.y_rows[i] = this.y_rows[i - 1] + this.dy_row + this.gap;
        }
        this.y_rows[this.divisions.row + 1] = this.y + this.height;
    }

    btnPointedBy(cursor) {
        const ret = {
            row_i: -1,
            col_j: -1
        };


        if (cursor) {
            // cursor can be null if not found

            if (cursor.x >= this.x && cursor.x <= this.x + this.width &&
                cursor.y >= this.y && cursor.y <= this.y + this.height) {

                for (let j = 1; j <= this.divisions.col; j++) {
                    if (cursor.x >= this.x_cols[j] && (cursor.x <= this.x_cols[j] + this.dx_col)) {
                        ret.col_j = j;
                        break;
                    }
                }

                for (let i = 1; i <= this.divisions.row; i++) {
                    if (cursor.y >= this.y_rows[i] && (cursor.y <= this.y_rows[i] + this.dy_row)) {
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
            this.x <= state.cursor.x + 10 &&
            state.cursor.x <= this.x + this.width + 10 &&
            this.y <= state.cursor.y + 10 &&
            state.cursor.y <= this.y + this.height + 10
        );
    }
}