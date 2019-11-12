import React from 'react';
import './App.css';
import Cesium from 'cesium/Cesium';
import 'antd/dist/antd.css';
import MarkPoint from './MarkPoint';
import FileSaver from 'file-saver';
import TourBox from './TourBox';
import PlayWidget from './PlayWidget';
import Position from './Position';
import flag from './ico/pin (1).svg';
import round from './ico/round.svg';
import Tour from './Tour';
import Cursor from './Cursor.js';
import { Button } from 'antd';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.viewer = null;
    this.tourTime = 0;//保存游览的时间
    this.Tour = null;//保存游览数据的类
    this.tour = {};//保存游览数据
    this.state = {
      cursor: 'default',
      //鼠标当前的位置
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
      showPlayBar: false,
      showTourDialog: false,
    };
  }

  componentDidMount() {
    document.title = '地球Earth';
    this.initEarth();
    this.getCurrentPosition();
    this.setViewerCursor();
    this.viewer.clock.onTick.addEventListener(()=>{
      this.viewer.clock.multiplier = 100;
      this.viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
      console.log(Cesium.JulianDate.toIso8601(this.viewer.clock.currentTime));
    });
  };

  //初始化地球
  initEarth = () => {

    //在我们使用Cesium的过程中，如果没有申请ion，同时没有自己的数据源用的cesium提供的数据源，
    //viewer的底部常常会提示一行小的英文字母。大意就是需要申请access token.
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1OGRjOTE5Zi1kZDhiLTQ0OGUtOTBlZS0yN2M4M2Y5NTU0MGYiLCJpZCI6ODIxMiwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU1MzE4MDIzOH0.NYVM4T2s-_HaTH61ksq-Oz8uzkLk6FKL87d6XMuShXo';

    this.viewer = new Cesium.Viewer('cesiumContainer', {
      animation: false, //控制视窗动画的播放速度
      baseLayerPicker: true, //选择三维数字地球的底图（imagery and terrain）
      geocoder: false, //一种地理位置搜索工具，用于显示相机访问的地理位置。默认使用微软的Bing地图
      homeButton: false, //首页位置，点击之后将视图跳转到默认视角
      infoBox: false,
      sceneModePicker: true, //切换2D、3D 和 Columbus View (CV) 模式
      selectionIndicator: false, //选择控件与infoBox对应的。 具体说明网址 (https://blog.csdn.net/hzh839900/article/details/78063197)
      navigationHelpButton: false, //帮助提示，如何操作数字地球
      timeline: false, //展示当前时间和允许用户在进度条上拖动到任何一个指定的时间
      navigationInstructionsInitiallyVisible: false,
      vrButton: false, //VR控件
      fullscreenButton: false, //视察全屏按钮
    });

    this.viewer._cesiumWidget._creditContainer.style.display = "none"; //取消右下角的Cesium的图例
    this.viewer.scene.globe.showWaterEffect = true;
    this.viewer.scene.globe.enableLighting = false;
    this.viewer.scene.globe.showGroundAtmosphere = false;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105.7, 34.3, 22000000), //经度，纬度，高度
    });
  };

  test = () => {
    let clock = new Cesium.Clock({
      startTime: Cesium.JulianDate.fromIso8601("2013-12-25"),
      stopTime: Cesium.JulianDate.fromIso8601("2013-12-26"),
      clockRange: Cesium.ClockRange.LOOP_STOP,
      multiplier: 1.0,
      clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
    });
    clock.onTick.addEventListener(() => {
      console.log(1);
    });
    setInterval(() => {
      console.log(Cesium.JulianDate.toIso8601(clock.tick()));
    }, 1000);

  };

  setViewerCursor = () => {
    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    let leftDownFlag = false;
    let middleDownFlag = false;
    //设置鼠标左键按下事件
    handler.setInputAction((leftDown) => {
      leftDownFlag = true;
      this.setState({
        cursor: 'grabbing',
      });
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    //设置鼠标左键释放事件
    handler.setInputAction((leftUp) => {
      leftDownFlag = false;
      this.setState({
        cursor: 'grab',
      });
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    handler.setInputAction((movement) => {
      let pick = this.viewer.scene.pick(movement.endPosition);
      if (Cesium.defined(pick)) {
        if (pick.id._name === 'newPoint' || pick.id._id === 'markBound' && pick.id.allowMove) {
          this.setState({
            cursor: 'pointer',
          });
        } else {
          this.setState({
            cursor: 'grab',
          });
        }
      } else {
        this.setState({
          cursor: 'grab',
        });
      };
      if (leftDownFlag) {
        this.setState({
          cursor: 'grabbing',
        });
      };
      if (middleDownFlag) {
        this.setState({
          cursor: 'move',
        });
      }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction((MIDDLE_DOWN) => {
      if (this.state.currentPosition.lon != null) {
        middleDownFlag = true;
        let entity = new Cesium.Entity({
          position: Cesium.Cartesian3.fromDegrees(this.state.currentPosition.lon, this.state.currentPosition.lat, this.state.currentPosition.height),
          id: 'middleDown',
          name: 'middleDown',//新建点的类型
          billboard: new Cesium.BillboardGraphics({
            image: round,
            scale: 1.5,
            heightReference: Cesium.HeightReference.NONE,
          }),
        });
        this.viewer.scene.screenSpaceCameraController.enableRotate = false;
        //this.viewer.trackedEntity = entity;
        this.viewer.entities.add(entity);
        this.setState({
          cursor: 'move',
        });
      };
    }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
    handler.setInputAction((MIDDLE_UP) => {
      this.viewer.entities.removeById('middleDown');
      this.viewer.scene.screenSpaceCameraController.enableRotate = true;
      middleDownFlag = false;
      this.setState({
        cursor: 'grab',
      });
    }, Cesium.ScreenSpaceEventType.MIDDLE_UP);
  };

  //实时获取坐标信息
  getCurrentPosition = () => {
    //得到当前三维场景
    let scene = this.viewer.scene;
    //得到当前三维场景的椭球体
    let ellipsoid = scene.globe.ellipsoid;
    let longitudeString = null;
    let latitudeString = null;
    let height = null;
    let cartesian = null;
    let roll = null;
    let heading = null;
    let pitch = null;
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
        longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        //获取相机高度
        height = Math.ceil(scene.camera.positionCartographic.height);
        roll = scene.camera.roll;
        heading = scene.camera.heading;
        pitch = scene.camera.pitch;
      } else {
        longitudeString = null;
        latitudeString = null;
        height = null;
        roll = null;
        heading = null;
        pitch = null;
      }
      this.setState({
        currentPosition: {
          lon: longitudeString,
          lat: latitudeString,
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
          lon: longitudeString,
          lat: latitudeString,
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
          lon: longitudeString,
          lat: latitudeString,
          height: height,
          roll: roll,
          heading: heading,
          pitch: pitch,
        },
      });
    }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
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

  //转换为Json格式数据
  toJsonTour = (name, tourPoints, easingFunction) => {
    this.removeByName('newPoint');
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
    this.showTourPoints(this.tour);
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

  successNewPoint = () => {
    this.markPoint.successNewPoint();
  };

  cancelNewPoint = () => {
    this.markPoint.cancelNewPoint();
  };

  //按名字移除实体
  removeByName = (name) => {
    let Id = [];
    this.viewer.entities.values.map(entity => {
      if (entity.name === name) {
        Id.push(entity.id);
      };
    });
    Id.map(id => this.viewer.entities.removeById(id));
  };

  toggle = (stateName) => {
    if (stateName === 'showPlayBar') {
      if(this.state.showPlayBar){
        this.removeByName('tourMark');
      };
      this.setState({
        showPlayBar: !this.state.showPlayBar,
      });
    } else if (stateName === 'showTourDialog') {
      this.setState({
        showTourDialog: !this.state.showTourDialog,
      });
    } else if (stateName === 'alwaysShowPlayBar') {
      this.setState({
        showPlayBar: true,
      });
    };
  };
  render() {
    return (
      <div id='cesiumContainer' style={{ cursor: this.state.cursor }}>
        <TourBox
          showTourDialog={this.state.showTourDialog}
          addTourPoint={this.addMark}
          markPointPosition={this.state.markPointPosition}
          markPointOK={this.successNewPoint}
          markPointCancel={this.cancelNewPoint}
          toJsonTour={this.toJsonTour}
          toggle={this.toggle}
          loadKmlTour={this.loadKmlTour}
          loadJsonTour={this.loadJsonTour}>
        </TourBox>
        <PlayWidget duration={this.tourTime}
          hidden={this.state.showPlayBar}
          startTour={this.startTour}
          stopTour={this.stopTour}
          onReset={this.terminateTour}
          onClose={this.stopTour}
          tourSave={this.saveTour}
          toggle={this.toggle}>
        </PlayWidget>
        <Position currentPosition={this.state.currentPosition}></Position>
      </div>
    );
  };
}

export default App; 
