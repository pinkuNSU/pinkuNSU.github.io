class Config {
    constructor() {
        this.TRANSPARENCY_ALPHA = 0.5;
        this.DWELLWAIT_MS       = 600;
        this.CAMWIDTH           = 1280;
        this.CAMHEIGHT          = 720;
        this.IMGPALM_DIMMAX     = Math.min(this.CAMHEIGHT, this.CAMWIDTH)/3;
        this.ABSOLUTEWIDTH      = 350;
        this.progressbar = {
            MAXWIDTH: this.CAMWIDTH/8,
            MAXHEIGHT: this.CAMHEIGHT/28
        }; // todo use this
    };
}

export {Config};