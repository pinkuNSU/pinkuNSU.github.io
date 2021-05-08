

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

    return dx*dy;
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

    return {'zMin': zMin, 'zMax': zMax};
}

function getColorSizeValueFromZ(z, zMin, zMax, thicknessMin, thicknessMax) {
    const color = 255 - remap(z, zMin, zMax, 255);
    const scale = thicknessMax - thicknessMin;
    const thickness = thicknessMin + (1.0 - remap(z, zMin, zMax, 1))*scale;
    
    return {
        'color': Math.floor(color),
        'thickness': Math.floor(thickness)
    };
}


class HandInitData {
    constructor() {
        this.area = null,
        this.dataID = null,
        this.show = false,
        this.landmarks = null
    }
}

function initiate(state, results) {
    let ret = {
        left: new HandInitData(),
        right: new HandInitData()
    };

    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        if (results.multiHandedness[i].index == 1) {
            ret.right.dataID    = i;
            ret.right.area      = area(results.multiHandLandmarks[i]);
            ret.right.landmarks = results.multiHandLandmarks[i];
            ret.right.landmarks.map(function(value, index, readonly) {
                value.x *= state.width;
                value.y *= state.height;
                return value;
            });

            const rng = getMinMaxZ(ret.right.landmarks);
            
            ret.right.scale = getColorSizeValueFromZ(
                ret.right.landmarks[8].z,
                rng.zMin,
                rng.zMax,
                1,
                10                
            );

        } else if (results.multiHandedness[i].index == 0) {
            ret.left.dataID     = i;
            ret.left.area       = area(results.multiHandLandmarks[i]);
            ret.left.landmarks  = results.multiHandLandmarks[i];
            ret.left.landmarks.map(function(value, index, readonly) {
                value.x *= state.width;
                value.y *= state.height;
                return value;
            });
            
            const rng = getMinMaxZ(ret.left.landmarks);

            ret.left.scale = getColorSizeValueFromZ(
                ret.left.landmarks[8].z,
                rng.zMin,
                rng.zMax,
                1,
                10                
            );
        }
    }

    ret.left.show = ret.left.area > 0.08;
    ret.right.show = ret.right.area > 0.08;
    ret.show = (ret.left.show | ret.right.show)? true: false;

    return ret;
}


export {initiate};