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
        this.fisheye = {
            weights: {
                MAX: 8,
                NEIGHBOR: 4,
                NORMAL: 3,
                NORMAL2: 6,
                NORMAL3: 9,
                SUMMAXNEIGHBOR: 12,
                SUMMAX2NEIGHBOR: 16
            }
        };

        this.landmarkButtons = {
            total: 17,
            width: 30,
            height: 30,
            widthHalf: 15,
            heightHalf: 15,
        }
    };
}

export {Config};