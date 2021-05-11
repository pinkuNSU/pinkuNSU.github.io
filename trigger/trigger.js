

import {TRIGGER} from './triggerstate.js';
import {Dwell} from './dwell.js';
import {Tap} from './tap.js';

class Trigger {
    constructor(state) {
        this.status = TRIGGER.OPEN;
        this.name = state.menu.trigger;

        if (this.name == 'Dwell') this.trigger = new Dwell(this);
        else if (this.name == 'Tap') this.trigger = new Tap(this);
        console.log("trigger:", this);
    }

    update(state) {
        this.trigger.update(state);
    } 

    reset() {
        this.status = TRIGGER.OPEN;
        this.trigger.reset();
    }
}


export {Trigger};