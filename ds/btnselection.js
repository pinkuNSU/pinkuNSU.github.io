class Button {
    constructor() {
        this.row_i = -1;
        this.col_j = -1;
    }
}


class ButtonSelection {
    constructor() {        
        this.currentBtn = new Button();
        this.previousBtn = new Button();
        this.markedBtn = new Button();
        this.locked = false;
        this.messages = {
            marked: "",
            selected: ""
        };
    }
}


export {ButtonSelection};