import Cesium from 'cesium/Cesium';
import square from './ico/square.svg';



/**
 * 添加标记点的类
 * @param {*} viewer Cesium的Viewer对象
 * 
 */
class MarkPoint {
    constructor(viewer) {
        this.viewer = viewer;
        this.pick = null;
        this.cursor = 'grab';
    };
    /**
     * 添加标记的点的边框
     * @param {Object} position Cesium.Cartesian3的对象
     * @param {String} imgSrc 表示标记点的外边框的形状
     * @param {Number} scale 表示外边框的大小 （0-1）
     * 
     */
    addMarkBound = (position, imgSrc, scale) => {
        this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(position.x, position.y, position.z),
            show: true,
            id: 'markBound',
            billboard: new Cesium.BillboardGraphics({
                image: imgSrc,
                scale: scale,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }),
        });
    };

    /**
     * 添加标记点
     * @param {Object} position Cesium.Cartesian3的对象
     * @param {String} imgSrc 表示标记点的形状
     * @param {Number} scale 表示外边框的大小 （0-1）
     */
    addMark = (position, imgSrc, scale) => {
        let entity = new Cesium.Entity({
            position: Cesium.Cartesian3.fromDegrees(position.x, position.y, position.z),
            // id:'newPoint' + this.newPointId,
            name: 'newPoint',//新建点的类型
            billboard: new Cesium.BillboardGraphics({
                image: imgSrc,
                scale: scale,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }),
        });
        entity.addProperty('allowMove');//添加可移动属性
        entity.allowMove = true;
        this.viewer.entities.add(entity);
        this.addMarkBound(position, square, 1.4);
        this.markBoundBlink(0.6);
        //this.moveMark();
    };

    /**
     * 设置边框的闪烁效果
     * @param {Number} time 闪烁的间隔时间（秒）
     */
    markBoundBlink = (time) => {
        let show = true;
        const boundEntity = this.viewer.entities.getById('markBound');
        if (Cesium.defined(boundEntity)) {
            setInterval(() => {
                boundEntity.show = show;
                show = !show;
            }, time * 1000);
        };
    };
    /**
     * 移动标记
     * @param {Function} callback 鼠标左键按下事件的回调函数
     * 
     *
     */
    moveMark = (callback) => {
        const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        let leftDownFlag = false;
        //定义鼠标左键按下事件
        handler.setInputAction((leftdown) => {
            const cartesian = this.viewer.scene.camera.pickEllipsoid(leftdown.position, this.viewer.scene.globe.ellipsoid);
            const boundEntity = this.viewer.entities.getById('markBound');
            if (cartesian && boundEntity != null) {
                this.pick = this.viewer.scene.pick(leftdown.position);
                if (Cesium.defined(this.pick) && (this.pick.id.name === 'newPoint') && this.pick.id.allowMove) {
                    this.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
                    leftDownFlag = true;
                }
            };
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        //定义鼠标左键释放事件
        handler.setInputAction(() => {
            this.viewer.scene.screenSpaceCameraController.enableRotate = true; //释放相机
            leftDownFlag = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        //定义鼠标左键按下移动事件
        handler.setInputAction((movement) => {
            const boundEntity = this.viewer.entities.getById('markBound');
            if (leftDownFlag === true && this.pick != null && boundEntity != null && this.pick.id.allowMove) {
                let ray = this.viewer.camera.getPickRay(movement.endPosition);
                let cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
                if (cartesian) {
                    this.pick.id.position = new Cesium.CallbackProperty(() => {
                        return cartesian;
                    }, false);//防止闪烁，在移动的过程
                    boundEntity.position = new Cesium.CallbackProperty(() => {
                        return cartesian;
                    }, false);//防止闪烁，在移动的过程
                    callback();
                };
            };
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    };
    /**
     * 标记点新建成功
     * 
     */
    successNewPoint = () => {
        this.viewer.entities.removeById('markBound');
        this.viewer.entities._entities._array.pop().allowMove = false;   
    };

    /**
     * 取消标记点
     */
    cancelNewPoint = () => {
        this.viewer.entities.removeById('markBound');
        if (Cesium.defined(this.pick)) {
            this.viewer.entities.removeById(this.pick.id.id);
        } else {
            this.viewer.entities.removeById(this.viewer.entities._entities._array.pop().id);
        };
    };
};

export default MarkPoint;