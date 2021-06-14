

import {TRIGGER} from './triggerstate.js';
import {Dwell} from './dwell.js';
import {Tap} from './tap.js';

export class Trigger {
    constructor(state) {
        this.status = TRIGGER.OPEN;
        this.name = state.menu.trigger;

        if (this.name == 'Dwell') this.trigger = new Dwell(this);
        else if (this.name == 'Tap') this.trigger = new Tap(this);
    }

    update(state) {
        this.trigger.update(state);
    } 

    reset(state) {
        state.selection.locked = false;
        this.status = TRIGGER.OPEN;
        state.resetCursorPath();
        this.trigger.reset();
    }
}
