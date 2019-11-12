import React from 'react';
import './App.css';
import Cesium from 'cesium/Cesium';
import 'antd/dist/antd.css';
import MarkPoint from './MarkPoint.js';
import FileSaver from 'file-saver';
import TourBox from './TourBox';
import PlayWidget from './PlayWidget';
import flag from './ico/pin (1).svg';
import Tour from './Tour.js';


class Fly extends React.Component {

    constructor(props) {
        super(props);
        this.viewer = this.props.viewer;
        this.tourTime = 0;//保存游览的时间
        this.Tour = null;//保存游览数据的类
        this.tour = {};//保存游览数据
        this.state = {
            currentPosition: {
                lon: null, //当前鼠标位置的经度
                lat: null, //当前鼠标位置的纬度
                height: 22000000, //当前鼠标位置的高度
                roll: 0, // x轴（经度）方向的旋转
                heading: 6.28,// Z轴方向的旋转
                pitch: -1.57, //y轴（纬度）方向旋转
            },
            // 标记点的位置
            markPointPosition: {
                cartesian: null,//笛卡尔坐标系
                height: null, //当前位置的高度
                roll: null, // x轴（经度）方向的旋转
                heading: null,// Z轴方向的旋转
                pitch: null, //y轴（纬度）方向旋转
            },
            showPlayBar: false, //设置播放条
            showTourDialog: false,//设置飞行的对话框
        };
    };

    //实时获取鼠标位置坐标信息
    getCurrentPosition = () => {
        //得到当前三维场景
        let scene = this.viewer.scene;
        //得到当前三维场景的椭球体
        let ellipsoid = scene.globe.ellipsoid;
        let lon, lat, height, cartesian, heading, pitch, roll = null;
        // 定义当前场景的画布元素的事件处理
        let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        //设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
        handler.setInputAction((movement) => {
            cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
            if (cartesian) {
                //将笛卡尔坐标转换为地理坐标
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                //将弧度转为度的十进制度表示
                lon = Cesium.Math.toDegrees(cartographic.longitude);
                lat = Cesium.Math.toDegrees(cartographic.latitude);
                //获取相机高度
                height = Math.ceil(scene.camera.positionCartographic.height);
                roll = scene.camera.roll;
                heading = scene.camera.heading;
                pitch = scene.camera.pitch;
            } else {
                lon = null;
                lat = null;
                height = null;
                roll = null;
                heading = null;
                pitch = null;
            };
            this.setState({
                currentPosition: {
                    lon: lon,
                    lat: lat,
                    height: height,
                    roll: roll,
                    heading: heading,
                    pitch: pitch,
                },
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        //设置鼠标滚动事件的处理函数，这里负责监听高度值变化
        handler.setInputAction((wheelment) => {
            this.viewer.scene.screenSpaceCameraController.inertiaZoom = 0.1;
            height = Math.ceil(scene.camera.positionCartographic.height);
            roll = scene.camera.roll;
            heading = scene.camera.heading;
            pitch = scene.camera.pitch;
            this.setState({
                currentPosition: {
                    lon: lon,
                    lat: lat,
                    height: height,
                    roll: roll,
                    heading: heading,
                    pitch: pitch,
                }
            });
        }, Cesium.ScreenSpaceEventType.WHEEL);

        //设置鼠标中键事件，处理显示3D信息
        handler.setInputAction((MIDDLE_DOWN) => {
            roll = scene.camera.roll;
            heading = scene.camera.heading;
            pitch = scene.camera.pitch;
            this.setState({
                currentPosition: {
                    lon: lon,
                    lat: lat,
                    height: height,
                    roll: roll,
                    heading: heading,
                    pitch: pitch,
                },
            });
        }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
    };

    //在视野中心位置添加标记
    addMark = () => {
        const result = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(this.viewer.canvas.clientWidth / 2, this.viewer.canvas.clientHeight / 2));
        this.markPoint = new MarkPoint(this.viewer);
        this.setState({
            markPointPosition: {
                cartesian: result,
                height: this.state.currentPosition.height,
                heading: this.state.currentPosition.heading,
                pitch: this.state.currentPosition.pitch,
                roll: this.state.currentPosition.roll,
            },
        });
        this.markPoint.addMark(result, flag, 0.8);
        this.markPoint.moveMark((cartesian) => {
            this.setState({
                markPointPosition: {
                    cartesian: cartesian,
                    height: this.state.currentPosition.height,
                    heading: this.state.currentPosition.heading,
                    pitch: this.state.currentPosition.pitch,
                    roll: this.state.currentPosition.roll,
                },
            });
        });
    };

    //确认添加
    successNewPoint = () => {
        this.markPoint.successNewPoint();
    };

    //取消添加
    cancelNewPoint = () => {
        this.markPoint.cancelNewPoint();
    };
    //加载kml飞行数据
    loadKmlTour = (kml) => {
        if (!Cesium.defined(this.Tour)) {
            this.Tour = new Tour(this.viewer);
        };
        this.Tour.loadKmlTour(kml, (tour, tourTime) => {
            this.tour = tour;
            this.tourTime = Math.ceil(tourTime);
            this.showTourPoints(this.tour);
        });
    };

    //加载Json飞行数据
    loadJsonTour = (id, name, playlist) => {
        if (!Cesium.defined(this.Tour)) {
            this.Tour = new Tour(this.viewer);
        };
        const jsonTour = {
            id: id,
            name: name,
            playlist: this.Tour.toPlaylist(playlist),
        };

        [this.tour, this.tourTime] = this.Tour.laodJsonTour(jsonTour);
        this.tourTime = Math.ceil(this.tourTime);
        this.showTourPoints(this.tour);
    };

    //标记的点转换为Json格式数据
    toJsonTour = (name, tourPoints, easingFunction) => {
        this.removeByName('newPoint');
        console.log(this.viewer.entities);
        if (!Cesium.defined(this.Tour)) {
            this.Tour = new Tour(this.viewer);
        };
        this.easingFunction = easingFunction;
        let pointsTour = [];
        tourPoints.map(item => {
            pointsTour.push(this.Tour.toPointTour(
                item.tourDestination.cartesian,
                item.tourDestination.height,
                item.tourOrientation.heading,
                item.tourOrientation.pitch,
                item.tourOrientation.roll,
                item.tourDuration,
                item.tourFlyToMode,
                item.tourWait));
        });
        const jsonTour = this.Tour.toJsonTour('', name, pointsTour);
        [this.tour, this.tourTime] = this.Tour.laodJsonTour(jsonTour);
        this.tourTime = Math.ceil(this.tourTime);
        //this.showTourPoints(this.tour);
    };

    //开始游览
    startTour = () => {
        this.Tour.startTour(this.tour, this.easingFunction);
    };

    //停止游览
    stopTour = () => {
        this.Tour.stopTour(this.tour);
    };

    //终止游览
    terminateTour = () => {
        this.Tour.terminateTour(this.tour);
    };

    //保存游览
    saveTour = () => {
        try {
            let tourData = {
                id: this.tour.id,
                name: this.tour.name,
                playlist: this.tour.playlist,
            };
            let tourJson = JSON.stringify(tourData);
            let blob = new Blob([tourJson], { type: "text/plain;charset=utf-8" })
            FileSaver.saveAs(blob, this.tour.name + '.json');
        } catch {
            alert('请重新尝试下载！！');
        }
    };

    //设置游览点是否可见
    showTourPoints = (tour) => {
        this.removeByName('tourMark');//清除之前的游览点
        for (let i = 0; i < tour.playlist.length; i++) {
            if (tour.playlist[i].type === 'KmlTourFlyTo') {
                const entity = new Cesium.Entity({
                    name: 'tourMark',
                    position: tour.playlist[i].view.position,
                    billboard: new Cesium.BillboardGraphics({
                        image: flag,
                        scale: 0.8,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    }),
                });
                this.viewer.entities.add(entity);
            };
        };
    };

    //按名字移除实体
    removeByName = (name) => {
        let Id = [];
        this.viewer.entities.values.forEach(entity => {
            if (entity.name === name) {
                Id.push(entity.id);
            };
        });
        Id.map(id => this.viewer.entities.removeById(id));
    };

    //设置组件的可见性
    toggle = (stateName) => {
        switch (stateName) {
            case 'showPlayBar':
                if (this.state.showPlayBar) {
                    this.removeByName('tourMark');
                };
                this.setState({
                    showPlayBar: !this.state.showPlayBar,
                });
                break;
            case 'showTourDialog':
                this.setState({
                    showTourDialog: !this.state.showTourDialog,
                });
                break;
            case 'alwaysShowPlayBar':
                this.setState({
                    showPlayBar: true,
                });
                break;
            default:
        };
    };

    render() {
        return (
            <div>
                <TourBox
                    showTourDialog={this.state.showTourDialog}
                    addTourPoint={this.addMark}
                    markPointPosition={this.state.markPointPosition}
                    markPointOK={this.successNewPoint}
                    markPointCancel={this.cancelNewPoint}
                    toJsonTour={this.toJsonTour}
                    loadKmlTour={this.loadKmlTour}
                    loadJsonTour={this.loadJsonTour}
                    toggle={this.toggle}>
                </TourBox>
                <PlayWidget
                    duration={this.tourTime}
                    hidden={this.state.showPlayBar}
                    startTour={this.startTour}
                    stopTour={this.stopTour}
                    onReset={this.terminateTour}
                    onClose={this.stopTour}
                    tourSave={this.saveTour}
                    toggle={this.toggle}>
                </PlayWidget>
            </div>
        );
    }
};

export default Fly;