const WeightState = {
    NORMAL: 0,
    CENTER: 1,
    CORNER: 2
};



export class GridFishEye {
    constructor(state, name) {
        this.name = name;
        this.height = state.height / 4;
        this.width = state.width / 4;
        this.widthHalf = this.width / 2;
        this.x = 0;
        this.y = 0; // todo refactor to topleft = {x, y}
        this.gap = state.config.grid.gap;

        this.divisions = {
            row: state.menu.cellscnt.row,
            col: state.menu.cellscnt.col
        };

        this.x_cols = Array(11);
        this.y_rows = Array(11);

        this.col_weights = Array(11);
        this.row_weights = Array(11);
        this.weightSum = {
            col: 0,
            row: 0,
            coltype: 0,
            rowtype: 0
        };

        this.maxLocation = {
            col_x: -1,
            row_y: -1
        };

        this.config = state.config;
        this._resetWeights();
        // console.group(`gridfisheye: ${this.name}`);
        // console.table(state.config);
        // console.groupEnd();
    }

    _resetWeights() {
        for (let i = 1; i <= this.divisions.col; i++) {
            this.col_weights[i] = this.config.fisheye.weights.NORMAL;
        }

        for (let i = 1; i <= this.divisions.row; i++) {
            this.row_weights[i] = this.config.fisheye.weights.NORMAL;
        }

        this.weightSum.col = this.config.fisheye.weights.NORMAL * this.divisions.col;
        this.weightSum.row = this.config.fisheye.weights.NORMAL * this.divisions.row;

        this.weightSum.coltype = WeightState.NORMAL;
        this.weightSum.rowtype = WeightState.NORMAL;
    }

    reset() {
        this._resetWeights();
    }

    getBottomMiddle() {
        return {
            x: this.x + this.widthHalf,
            y: this.y + this.height
        };
    }

    setMajorWeight(state) {
        const row_y = state.selection.currentBtn.row_i;
        const col_x = state.selection.currentBtn.col_j;


        if (col_x < 1 || col_x > this.divisions.col || row_y < 1 || row_y > this.divisions.row) {
            this._resetWeights();
            return;
        }

        // {row_y, col_x} within grid

        if (this.maxLocation.col_x != col_x) {
            for (let j = 1; j <= this.divisions.col; j++)
                this.col_weights[j] = state.config.fisheye.weights.NORMAL;

            this.col_weights[col_x - 1] = state.config.fisheye.weights.NEIGHBOR;
            this.col_weights[col_x] = state.config.fisheye.weights.MAX;
            this.col_weights[col_x + 1] = state.config.fisheye.weights.NEIGHBOR;

            this.maxLocation.col_x = col_x;

            if (col_x == 1 || col_x == this.divisions.col) {
                if (this.weightSum.coltype == WeightState.NORMAL) {
                    this.weightSum.col -= state.config.fisheye.weights.NORMAL2;
                    this.weightSum.col += state.config.fisheye.weights.SUMMAXNEIGHBOR;

                } else if (this.weightSum.coltype == WeightState.CENTER) {
                    this.weightSum.col -= state.config.fisheye.weights.NEIGHBOR;
                    this.weightSum.col += state.config.fisheye.weights.NORMAL;
                }

                this.weightSum.coltype = WeightState.CORNER;
            } else {
                if (this.weightSum.coltype == WeightState.NORMAL) {
                    this.weightSum.col -= state.config.fisheye.weights.NORMAL3;
                    this.weightSum.col += state.config.fisheye.weights.SUMMAX2NEIGHBOR;
                } else if (this.weightSum.coltype == WeightState.CORNER) {
                    this.weightSum.col -= state.config.fisheye.weights.NORMAL;
                    this.weightSum.col += state.config.fisheye.weights.NEIGHBOR;
                }

                this.weightSum.coltype = WeightState.CENTER;
            }
        }

        if (this.maxLocation.row_y != row_y) {
            for (let i = 1; i <= this.divisions.row; i++)
                this.row_weights[i] = state.config.fisheye.weights.NORMAL;

            this.row_weights[row_y - 1] = state.config.fisheye.weights.NEIGHBOR;
            this.row_weights[row_y] = state.config.fisheye.weights.MAX;
            this.row_weights[row_y + 1] = state.config.fisheye.weights.NEIGHBOR;

            this.maxLocation.row_y = row_y;

            if (row_y == 1 || row_y == this.divisions.row) {
                if (this.weightSum.rowtype == WeightState.NORMAL) {
                    this.weightSum.row -= state.config.fisheye.weights.NORMAL2;
                    this.weightSum.row += state.config.fisheye.weights.SUMMAXNEIGHBOR;
                } else if (this.weightSum.rowtype == WeightState.CENTER) {
                    this.weightSum.row -= state.config.fisheye.weights.NEIGHBOR;
                    this.weightSum.row += state.config.fisheye.weights.NORMAL;
                }

                this.weightSum.rowtype = WeightState.CORNER;
            } else {
                if (this.weightSum.rowtype == WeightState.NORMAL) {
                    this.weightSum.row -= state.config.fisheye.weights.NORMAL3;
                    this.weightSum.row += state.config.fisheye.weights.SUMMAX2NEIGHBOR;
                } else if (this.weightSum.rowtype == WeightState.CORNER) {
                    this.weightSum.row -= state.config.fisheye.weights.NORMAL;
                    this.weightSum.row += state.config.fisheye.weights.NEIGHBOR;
                }

                this.weightSum.rowtype = WeightState.CENTER;
            }
        }
    }

    align(state) {

        this.dx_col = (this.width - (this.divisions.col + 1) * this.gap) / this.weightSum.col;
        this.dy_row = (this.height - (this.divisions.row + 1) * this.gap) / this.weightSum.row;

        this.x_cols[0] = this.x;
        this.x_cols[1] = this.x_cols[0] + this.gap;
        for (let i = 2; i <= this.divisions.col; i++) {
            this.x_cols[i] = this.x_cols[i - 1] + (this.col_weights[i - 1] * this.dx_col) + this.gap;
        }
        this.x_cols[this.divisions.col + 1] = this.x + this.width;

        this.y_rows[0] = this.y;
        this.y_rows[1] = this.y_rows[0] + this.gap;
        for (let i = 2; i <= this.divisions.row; i++) {
            this.y_rows[i] = this.y_rows[i - 1] + (this.row_weights[i - 1] * this.dy_row) + this.gap;
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
                    if (cursor.x >= this.x_cols[j] && (cursor.x <= this.x_cols[j + 1] - this.gap)) {
                        ret.col_j = j;
                        break;
                    }
                }

                for (let i = 1; i <= this.divisions.row; i++) {
                    if (cursor.y >= this.y_rows[i] && (cursor.y <= this.y_rows[i + 1] - this.gap)) {
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