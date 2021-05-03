

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
        if (results.multiHandedness[i].label == 'Right') {
            ret.right.dataID    = i;
            ret.right.area      = area(results.multiHandLandmarks[i]);
            ret.right.landmarks = results.multiHandLandmarks[i];
            ret.right.landmarks.map(function(value, index, readonly) {
                value.x *= state.width;
                value.y *= state.height;
                return value;
            });

        } else if (results.multiHandedness[i].label == 'Left') {
            ret.left.dataID     = i;
            ret.left.area       = area(results.multiHandLandmarks[i]);
            ret.left.landmarks  = results.multiHandLandmarks[i];
            ret.left.landmarks.map(function(value, index, readonly) {
                value.x *= state.width;
                value.y *= state.height;
                return value;
            });
            
        }
    }

    ret.left.show = ret.left.area > 0.08;
    ret.right.show = ret.right.area > 0.08;
    ret.show = (ret.left.show | ret.right.show)? true: false;

    return ret;
}


export {initiate};