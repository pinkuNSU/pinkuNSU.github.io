import {Config} from './config.js';
import {ButtonSelection} from './ds/btnselection.js';
import {Point} from './ds/point.js';


class State {
    constructor() {
        this.menu = {};
        this.menu.showMenu = true;
        this.menu.technique = null;
        this.menu.technique = null;
        this.menu.userID = null;
        this.menu.practice = false;
        this.menu.debug = false;
        this.menu.cellscnt = null;
        this.menu.targetscnt = 12;
        this.data = null;
        this.initiator = null;
        this.cursor = null;
        this.palmLandmarkIDs = [0, 1, 5, 9, 13, 17]; // TODO make it static
        this.progressBar = {
            size: -1,
            maxWidth: 100,
            maxHeight: 30
        };

        this.config = new Config();
        this.selection = new ButtonSelection();
        
        this.cursorPath = {
            show: false,
            head: null,
            tail: null,
            cnt: 0
        }
    }

    updateCursorPath() {

        // console.log("updateCursorPath this.cursorPath:", this.cursorPath);
        // return;
        if (this.cursorPath.tail == null) {
            this.cursorPath.tail = new Point(this.cursor.x, this.cursor.y);
            this.cursorPath.head = this.cursorPath.tail;
            this.cursorPath.cnt = 1;
        } else {
            
            this.cursorPath.tail.next = new Point(this.cursor.x, this.cursor.y);
            this.cursorPath.tail = this.cursorPath.tail.next;
            this.cursorPath.cnt ++;
            if (this.cursorPath > 50) {
                this.cursorPath.head = this.cursorPath.head.next;
                this.cursorPath = 50;
            }
        }
    }

    resetCursorPath() {
        this.cursorPath.head = null;
        this.cursorPath.tail = null;
        this.cursorPath.cnt = 0;
        this.cursorPath.show = false;
    }

    lockSelection() {
        if (!this.selection.locked) {
            this.selection.locked = true;
            this.selection.lastLockTime = performance.now();
        }
    }

    palmRect() {
        let ret = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            mxx: 0,
            mxy: 0,
            maxDim: 0
        }

        if (this.initiator && this.initiator.left.landmarks) {
            ret.x = this.initiator.left.landmarks[this.palmLandmarkIDs[0]].x;
            ret.y = this.initiator.left.landmarks[this.palmLandmarkIDs[0]].y;
            
            for (var i = 1, len = this.palmLandmarkIDs.length; i < len; i ++) {
                
                const l = this.initiator.left.landmarks[this.palmLandmarkIDs[i]];
                
                ret.x = Math.min(ret.x, l.x);
                ret.y = Math.min(ret.y, l.y);
                ret.mxx = Math.max(ret.mxx, l.x);
                ret.mxy = Math.max(ret.mxy, l.y);
            }

            ret.width = ret.mxx - ret.x;
            ret.height = ret.mxy - ret.y;
            ret.maxDim = Math.max(ret.width, ret.height);
        }

        return ret;
    }
}


function getState() {
    return new State();
}


function checkRadio(tag) {
    const radios = document.getElementsByName(tag);
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) return radios[i].value;
    }

    return "N/A";
}


function checkSelectList(tag) {
    var e = document.getElementById(tag);
    return e.options[e.selectedIndex].text;
}


export { getState, checkRadio, checkSelectList };
