import React from 'react';


/**
 * 游览的父组件
 * 
 */

class Trip extends React.Component {
    constructor(props) {
        super();
        this._viewer = this.props.viewer;
        this.state = {};
    };

    /**
     * 添加游览点
     */
    addTourPoint = () => { };

    /**
     * 确认添加
     */
    confirmTourPoint = () => { };

    /**
     * 取消添加
     */
    cancelTourPoint = () => { };

    /**
     * 完成游览线路
     */
    completeTour = () => { };

    /**
     * 加载kml游览数据
     */
    loadKmlTour = () => { };

    /**
     * 加载Json游览数据
     */
    loadJsonTour = () => { };

    /**
     * 开始游览
     */
    startTour = () => { };

    /**
     * 停止游览
     */
    stopTour = () => {
    };

    /**
     * 终止游览
     */
    terminateTour = () => { };

    /**
     * 保存游览
     */
    saveTour = () => { };

    /**
     * 游览点是否可见
     */
    isTourVisible = () => { };

    render(){
    return(
        <div id = 'trip'>

        </div>
    );
    }
};

export default Trip;