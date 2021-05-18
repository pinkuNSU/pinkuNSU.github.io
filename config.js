class Config {
    constructor() {
        this.TRANSPARENCY_ALPHA = 0.6;
        this.DWELLWAIT_MS       = 600;
        this.CAMWIDTH           = 640;
        this.CAMHEIGHT          = 480;
        this.IMGPALM_DIMMAX     = Math.min(this.CAMHEIGHT, this.CAMWIDTH)/3;
        this.progressbar = {
            MAXWIDTH: this.CAMWIDTH/8,
            MAXHEIGHT: this.CAMHEIGHT/28
        }; // todo use this
    };
}

export {Config};