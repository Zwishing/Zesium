import Cesium from 'cesium/Cesium';

/**
 * 解析和播放Kml和Json格式的游览数据
 * @exports Tour 
 * 
 * @param {*} viewer Cesium的Viewer对象
 * 
 *  
 */

class Tour {
    constructor(viewer) {
        this.viewer = viewer;
    };

    /**
     * 游览点生成
     * @param {Number} lon 经度 （弧度）
     * @param {Number} lat 纬度 （弧度）
     * @param {Number} height 高度 （米）
     * @param {Number} heading Z轴方向的旋转
     * @param {Number} pitch y轴（纬度）方向旋转
     * @param {Number} roll x轴（经度）方向的旋转
     * @param {Number} duration 表示飞向当前点的时间（秒）
     * @param {String} FlyToMode 表示飞向当前点的方式：bounce(跳动), smooth(平滑), etc(?)
     * @param {Number} wait 表示在当前点的停留时间 （秒）
     * @returns {Array} 返回一个游览点的飞行信息和停留信息的数组 [Cesium.KmlTourFlyTo, Cesium.KmlTourWait]
     */
    toPointTour = (cartesian, height, heading, pitch, roll, duration, FlyToMode, wait) => {

        const destination = cartesian;
        //const orientation = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        const range = height * (Math.sin(Math.abs(pitch)));
        const orientation = new Cesium.HeadingPitchRange(heading, pitch, range);
        //const view = new Cesium.KmlCamera(destination, orientation);
        const view = new Cesium.KmlLookAt(destination, orientation);
        const tourFlyTo = new Cesium.KmlTourFlyTo(duration, FlyToMode, view);
        const tourWait = new Cesium.KmlTourWait(wait);
        const pointTour = [tourFlyTo, tourWait];
        return pointTour;
    };

    /**
     * 游览点生成Json游览线路
     * @param {String} id 游览线路的编号
     * @param {String} name 游览线路的名称
     * @param {Array}  pointsTour 包含 [[Cesium.KmlTourFlyTo, Cesium.KmlTourWait],[Cesium.KmlTourFlyTo, Cesium.KmlTourWait],...]的一系列的游览点
     * @returns {Object} 返回游览线路的json对象
     */
    toJsonTour = (id, name, pointsTour) => {
        const playlist = [].concat.apply([], pointsTour);
        const jsonTour = {
            id: id,
            name: name,
            playlist: playlist,
        };
        return jsonTour;
    };

    /**
     * 加载google earth的Kml游览数据
     * @param {Resource|String|Document|Blob} data  A url, parsed KML document, or Blob containing binary KMZ data or a parsed KML document.
     * @param {Function} 回调函数用于处理加载的kml游览数据生成的tour和tourTime
     */
    loadKmlTour = (data, callback) => {
        let tour = null;
        let tourTime = 0;
        this.viewer.dataSources.add(
            Cesium.KmlDataSource.load(data,
                {
                    camera: this.viewer.scene.camera,
                    canvas: this.viewer.scene.canvas
                }).then(function (dataSource) {
                    tour = dataSource.kmlTours[0];
                    if (tour.playlist instanceof Array) {
                        tour.playlist.map(item => {
                            if (item.duration) {
                                tourTime += item.duration;
                            };
                        })
                    };
                    callback(tour, tourTime);
                    this.tour.tourStart.addEventListener(function () {
                        console.log('Start tour');
                    });
                    this.tour.tourEnd.addEventListener(function (terminated) {
                        console.log((terminated ? 'Terminate' : 'End') + ' tour');
                    });
                    this.tour.entryStart.addEventListener(function (entry) {
                        console.log('Play ' + entry.type + ' (' + entry.duration + ')');
                    });
                    this.tour.entryEnd.addEventListener(function (entry, terminated) {
                        console.log((terminated ? 'Terminate' : 'End') + ' ' + entry.type);
                    });
                }))
    };

    /**
     * 加载生成的Json游览数据
     * @param {Object} data  格式如下：
     * @param {String} id 游览线路的编号
     * @param {String} name 游览线路的名称
     * @param {Array} playlist 包含KMLTourFlyTo, KMLTourWait的数组
     * @returns {Object} 返回一个Cesium.KmlTour对象和游览总共时间
    */
    laodJsonTour = (data) => {
        if (Cesium.defined(data.playlist)) {
            let tour = new Cesium.KmlTour(data.name, data.id);
            let tourTime = 0;
            for (let i = 0; i < data.playlist.length; i++) {
                tour.addPlaylistEntry(data.playlist[i]);
                if (tour.playlist[i].duration) {
                    tourTime += data.playlist[i].duration;
                };
            };
            return [tour, tourTime];
        };
    };

    /**
     * 普通对象转化为包含KMLTourFlyTo, KMLTourWait的对象（两者形式完全一样）
     * @param {Array}} 普通的数组，但是数组中对象的形式与Cesium.KmlTour对象中的playlist的形式完全一样
     * @returns {Array} 返回一个Cesium.KmlTour对象中的playlist数组
     */
    toPlaylist = (playlist) => {
        let tourPlaylist = [];
        playlist.map(item => {
            if (item.type === 'KmlTourFlyTo') {
                const destination = new Cesium.Cartesian3(
                    item.view.position.x,
                    item.view.position.y,
                    item.view.position.z);
                console.log(destination);
                if ('headingPitchRoll' in item.view) {
                    const orientation = new Cesium.HeadingPitchRoll(
                        item.view.headingPitchRoll.heading,
                        item.view.headingPitchRoll.pitch,
                        item.view.headingPitchRoll.roll);
                    const view = new Cesium.KmlCamera(destination, orientation);
                    const tourFlyTo = new Cesium.KmlTourFlyTo(item.duration, item.flyToMode, view);
                    tourPlaylist.push(tourFlyTo)
                } else if ('headingPitchRange' in item.view) {
                    const orientation = new Cesium.HeadingPitchRange(
                        item.view.headingPitchRange.heading,
                        item.view.headingPitchRange.pitch,
                        item.view.headingPitchRange.range);
                    const view = new Cesium.KmlLookAt(destination, orientation);
                    const tourFlyTo = new Cesium.KmlTourFlyTo(item.duration, item.flyToMode, view);
                    tourPlaylist.push(tourFlyTo)
                };
            } else if (item.type === 'KmlTourWait') {
                const tourWait = new Cesium.KmlTourWait(item.duration);
                tourPlaylist.push(tourWait)
            };
        });
        return tourPlaylist;
    };

    /**
     * 游览开始
     * @param {Object} tour Cesium.KmlTour对象
     * @param {String} Easing //设置两点之间飞行时间的插值方式  https://cesium.com/docs/cesiumjs-ref-doc/EasingFunction.html
     * 
     */
    startTour = (tour, Easing) => {
        let EasingFunction;
        switch (Easing) {
            case 'BACK_IN':
                EasingFunction = Cesium.EasingFunction.BACK_IN;
                break;
            case 'BACK_IN_OUT':
                EasingFunction = Cesium.EasingFunction.BACK_IN;
                break;
            case 'QUADRACTIC_IN_OUT':
                EasingFunction = Cesium.EasingFunction.QUADRACTIC_IN_OUT;
                break;
            default:
                EasingFunction = Cesium.EasingFunction.QUADRACTIC_IN_OUT;
        };
        tour.play(this.viewer, {
            easingFunction: EasingFunction,
        });
    };

    /**
     * 游览暂停
     * @param {Object} tour Cesium.KmlTour对象
     */
    stopTour = (tour) => {
        const playlistIndex = tour.playlistIndex;
        tour.stop();
        tour.playlistIndex = playlistIndex;
    };

    /**
     * 游览终止
     * @param {Object} tour Cesium.KmlTour对象
     * 
     */
    terminateTour = (tour) => {
        tour.stop();
        tour.playlistIndex = 0;
    };
};

export default Tour;