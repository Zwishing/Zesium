import Cesium from 'cesium/Cesium';

/**
 * 设置鼠标指针的形状
 * 
 */


class Cursor {
    constructor() {

    };

    /**
     * @param {Object} handler Cesium.ScreenSpaceEventHandler的对象
     * @param {Function} callback 回调函数用于处理
     */

    static setCursor = (handler, callback) => {
        let leftDownFlag = false;
        let middleDownFlag = false;
        let cursor = 'default';
        //鼠标左键按下事件,鼠标变成抓手形状
        handler.setInputAction((LEFT_DOWN) => {
            leftDownFlag = true;
            cursor = 'grabbing';
            callback(cursor);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        //鼠标左键释放事件
        handler.setInputAction((LEFT_UP) => {
            leftDownFlag = false;
            cursor = 'grab';
            callback(cursor);
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        handler.setInputAction((MIDDLE_DOWN) => {
            middleDownFlag = true;
            if (middleDownFlag) {
                cursor = 'grab';
                callback(cursor);
            };
        }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

        handler.setInputAction((MIDDLE_UP) => {
            middleDownFlag = false;
            cursor = 'grab';
            callback(cursor);
        }, Cesium.ScreenSpaceEventType.MIDDLE_UP);
    };
};

export default Cursor;
