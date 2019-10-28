import Cesium from 'cesium/Cesium';

/**
 * 在球面上画个点
 * 
 */

class DrawPoint {
    constructor(viewer) {
        this._viewer = viewer;
    };

    addPoint = (position, name, options) => {
        let point = new Cesium.PointGraphics({

        });
        this._viewer.entities.add({
            name: name,
            point: point,
        });
    };
};

export default DrawPoint;