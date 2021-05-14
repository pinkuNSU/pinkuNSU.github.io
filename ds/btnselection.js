


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
        this.lastLockTime = performance.now();
        
        this.pastSelections = {
            head: null,
            tail: null,
            cnt: 0
        }
    }

    reset() {
        this.currentBtn.row_i = -1;
        this.currentBtn.col_j = -1;
        
        this.previousBtn.row_i = -1;
        this.previousBtn.col_j = -1;

        this.locked = false;
        this.messages.selected = "";
        this.lastLockTime = performance.now();
        
        this.pastSelections.head = null;
        this.pastSelections.tail = null;
        this.pastSelections.cnt = 0;
    }

    adjustSelection() {
        if (this.pastSelections.head != null) {
            this.currentBtn.row_i = this.pastSelections.head.row_i;
            this.currentBtn.col_j = this.pastSelections.head.col_j;
        }
    }

    addToPastSelections(btn) {
        if (this.pastSelections.tail == null) {
            this.pastSelections.tail = new Button();
            this.pastSelections.tail.row_i = btn.row_i;
            this.pastSelections.tail.col_j = btn.col_j;
            this.pastSelections.head = this.pastSelections.tail;
        } else {
            this.pastSelections.tail.next = new Button();
            this.pastSelections.tail = this.pastSelections.tail.next;
            this.pastSelections.tail.row_i = btn.row_i;
            this.pastSelections.tail.col_j = btn.col_j;

            this.pastSelections.cnt ++;
            if (this.pastSelections.cnt > 3) {
                this.pastSelections.head = this.pastSelections.head.next;
                this.pastSelections.cnt = 3;
            }
        }
    }
}


export {Button, ButtonSelection};