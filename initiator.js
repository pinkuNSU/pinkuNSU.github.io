

function area(landmarks) {
    let mnx = landmarks[0].x;
    let mxx = landmarks[0].x;
    let mny = landmarks[0].y;
    let mxy = landmarks[0].y;

    landmarks.forEach((l) => {
        mnx = Math.min(mnx, l.x);
        mxx = Math.max(mxx, l.x);
        mny = Math.min(mny, l.y);
        mxy = Math.max(mxy, l.y);

    });

    const dx = mxx - mnx;
    const dy = mxy - mny;

    return dx * dy;
}


function remap(x, lo, hi, scale) {
    return (x - lo) / (hi - lo + 1e-6) * scale;
}

function getMinMaxZ(landmarks) {
    let zMax = Number.MIN_VALUE;
    let zMin = Number.MAX_VALUE;
    landmarks.forEach(l => {
        zMin = Math.min(zMin, l.z);
        zMax = Math.max(zMax, l.z);
    });

    return { 'zMin': zMin, 'zMax': zMax };
}

function getColorSizeValueFromZ(z, zMin, zMax, thicknessMin, thicknessMax) {
    const color = 255 - remap(z, zMin, zMax, 255);
    const scale = thicknessMax - thicknessMin;
    const thickness = thicknessMin + (1.0 - remap(z, zMin, zMax, 1)) * scale;

    return {
        'color': Math.floor(color),
        'thickness': Math.floor(thickness)
    };
}


class HandInitData {
    constructor() {
        this.area = null;
        this.dataID = null;
        this.show = false;
        this.landmarks = new Array(21);
        for (let i = 0; i < 21; i++) {
            this.landmarks[i] = {
                x: 0,
                y: 0,
                z: 0
            };
        }
    }
}

class Initiator {
    constructor(state) {
        this.left = new HandInitData();
        this.right = new HandInitData();
    }

    initiate(state, results) {

        let lft = false;
        let rgt = false;

        if (results.multiHandLandmarks && results.multiHandedness) {

            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                if (results.multiHandedness[i].index == 1) {
                    this.right.dataID = i;
                    this.right.area = area(results.multiHandLandmarks[i]);

                    for (let j = 0; j < 21; j++) {
                        this.right.landmarks[j].x = (0.2 * this.right.landmarks[j].x) + (0.8 * results.multiHandLandmarks[i][j].x * state.width);
                        this.right.landmarks[j].y = (0.2 * this.right.landmarks[j].y) + (0.8 * results.multiHandLandmarks[i][j].y * state.height);
                        this.right.landmarks[j].z = (0.2 * this.right.landmarks[j].z) + (0.8 * results.multiHandLandmarks[i][j].z);
                    }

                    const rng = getMinMaxZ(this.right.landmarks);

                    this.right.scale = getColorSizeValueFromZ(
                        this.right.landmarks[8].z,
                        rng.zMin,
                        rng.zMax,
                        1,
                        10
                    );

                    rgt = true;

                } else if (results.multiHandedness[i].index == 0) {
                    this.left.dataID = i;
                    this.left.area = area(results.multiHandLandmarks[i]);

                    for (let j = 0; j < 21; j++) {
                        this.left.landmarks[j].x = (0.4 * this.left.landmarks[j].x) + (0.6 * results.multiHandLandmarks[i][j].x * state.width);
                        this.left.landmarks[j].y = (0.4 * this.left.landmarks[j].y) + (0.6 * results.multiHandLandmarks[i][j].y * state.height);
                        this.left.landmarks[j].z = (0.4 * this.left.landmarks[j].z) + (0.6 * results.multiHandLandmarks[i][j].z);
                    }

                    const rng = getMinMaxZ(this.left.landmarks);

                    this.left.scale = getColorSizeValueFromZ(
                        this.left.landmarks[8].z,
                        rng.zMin,
                        rng.zMax,
                        1,
                        10
                    );

                    lft = true;
                }
            }
        }

        if (lft) {
            this.left.show = this.left.area > 0.08;
        } else {
            this.left.dataID = null;
            this.left.show = false;
            for (let i = 0; i < 21; i++) {
                this.left.landmarks[i].x = 0;
                this.left.landmarks[i].y = 0;
                this.left.landmarks[i].z = 0;
            }


        }

        if (rgt) {
            this.right.show = this.right.area > 0.04;
        } else {
            this.right.dataID = null;
            this.right.show = false;
            for (let i = 0; i < 21; i++) {
                this.right.landmarks[i].x = 0;
                this.right.landmarks[i].y = 0;
                this.right.landmarks[i].z = 0;
            }
        }

        this.show = (this.left.show | this.right.show) ? true : false;
    }
}

export { Initiator };