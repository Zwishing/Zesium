import React from 'react';
import Draggable from 'react-draggable';
import './TourBox.css';
import UploadTour from './UploadTour';
import {
    Button,
    Row,
    Col,
    Input,
    Tabs,
    InputNumber,
    Radio,
    Icon,
} from 'antd';

class TourBox extends React.Component {
    constructor(props) {
        super(props);
        this.titleName = this.props.name;
        this.tourTrack = [];
        this.state = {
            disabled: false,
            showTourDialog: false,
            tourName: '未命名游览路径',
            tourWait: 2,
            tourDuration: 7,
            tourFlyToMode: 'bounce',
        };
    };

    //新添加标记点
    addTourPoint = () => {
        this.props.addTourPoint();
        this.setState({
            disabled: !this.state.disabled,
        });
    };

    //标记点确认
    addTourPointOK = () => {
        let tourPosition = this.props.markPointPosition;
        //用于保存数据
        this.tourTrack.push({
            tourDestination: [tourPosition.lon, tourPosition.lat, tourPosition.height],
            tourOrientation: [tourPosition.heading, tourPosition.pitch, tourPosition.roll],
            tourWait: this.state.tourWait,
            tourDuration: this.state.tourDuration,
            tourFlyToMode: this.state.tourFlyToMode,
        });
        this.setState({
            disabled: !this.state.disabled,
        });
        this.props.markPointOK();
    };

    //标记点取消
    addTourPointCancel = () => {
        this.setState({
            disabled: !this.state.disabled,
        });
        this.props.markPointCancel();
    };

    //设置游览时间
    onChangeTourWait = value => {
        this.setState({
            tourWait: value,
        });
    };

    //设置去下个游览点的时间
    onChangeTourDuration = value => {
        this.setState({
            tourDuration: value,
        });
    };

    //设置去下个游览点方式
    onChangeRadio = e => {
        this.setState({
            tourFlyToMode: e.target.value,
        });
    };
    onChangeName = e => {
        this.setState({
            tourName: e.target.value,
        });
    };
    //完成游览设置
    tourFinish = () => {
        if (this.tourTrack.length) {
            this.props.toJsonTour(this.state.tourName, this.tourTrack);
            this.props.toggle('alwaysShowPlayBar');
            this.props.toggle('showTourDialog');
            //this.tourTrack.length = 0;
        } else {
            alert('还没有设置任何游览点');
        };
    };
    onClickTour = () => {
        this.tourTrack.length = 0;
        this.props.toggle('showTourDialog');
    };
    render() {
        const { TabPane } = Tabs;
        return (
            <div className='tour-box'>
                <Button type='primary' id='tour'
                    onClick={this.onClickTour}
                    className='btn-tour'>
                    <Icon type="video-camera" />
                </Button>
                <Draggable handle="strong" bounds='body'>
                    <div className="box no-cursor"
                        hidden={!this.props.showTourDialog}>
                        <strong className="cursor">
                            <Row className='dialog-header'>
                                <Col span={8}
                                    className='dialog-header-name'>
                                    游览设置
                                </Col>
                                <Col span={8}
                                    offset={8}
                                    className='dialog-header-close'>
                                    <Button size='small'
                                        icon='close'
                                        shape='circle'
                                        ghost={true}
                                        title='关闭'
                                        onClick={() => { this.props.toggle('showTourDialog'); }}>
                                    </Button>
                                </Col>
                            </Row>
                        </strong>
                        <Row className='dialog-tabpane'>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="设置游览路径"
                                    key="1">
                                    <Input
                                        addonBefore='设置游览路径名称'
                                        defaultValue='未命名游览路径'
                                        onChange={this.onChangeName}>
                                    </Input>
                                    <br />
                                    <br />
                                    <div className='dialog-tabpane-item-addtour'>
                                        <Button type='primary'
                                            onClick={this.addTourPoint}
                                            disabled={this.state.disabled}
                                            className='btn-addtour'>
                                            添加游览点
                                    </Button>
                                        <Button.Group className='btn-addtour-state'>
                                            <Button type='primary'
                                                onClick={this.addTourPointOK}
                                                disabled={!this.state.disabled}>
                                                确认
                                    </Button>
                                            <Button type='primary'
                                                onClick={this.addTourPointCancel}
                                                disabled={!this.state.disabled}>
                                                取消
                                    </Button>
                                        </Button.Group>
                                        <br />
                                        <br />
                                        <span><b>游览时间(秒)</b>
                                            <InputNumber defaultValue={this.state.tourWait}
                                                min={0} max={120}
                                                disabled={!this.state.disabled}
                                                onChange={this.onChangeTourWait}>
                                            </InputNumber>
                                        </span>
                                        <span><b>去下个游览时间(秒)</b>
                                            <InputNumber defaultValue={this.state.tourDuration}
                                                min={1} max={120}
                                                disabled={!this.state.disabled}
                                                onChange={this.onChangeTourDuration}>
                                            </InputNumber>
                                        </span>
                                        <span><b>去下个游览方式</b>
                                            <Radio.Group onChange={this.onChangeRadio}
                                                value={this.state.tourFlyToMode}
                                                disabled={!this.state.disabled}>
                                                <Radio value='bounce'><b>跳动</b></Radio>
                                                <Radio value='smooth'><b>平稳</b></Radio>
                                            </Radio.Group>
                                        </span>
                                        <br />
                                        <br />
                                        <Button type='primary'
                                            onClick={this.tourFinish}
                                            disabled={this.state.disabled}>
                                            完成路径
                                    </Button>
                                    </div>
                                </TabPane>
                                <TabPane tab="加载Json游览路径" key="2">
                                    <UploadTour
                                        toggle={this.props.toggle}
                                        accept='json'
                                        loadJsonTour={this.props.loadJsonTour}>
                                    </UploadTour>
                                </TabPane>
                                <TabPane tab='加载Kml游览路径' key="3">
                                    <UploadTour
                                        loadKmlTour={this.props.loadKmlTour}
                                        toggle={this.props.toggle}
                                        accept='kml'>
                                    </UploadTour>
                                </TabPane>
                            </Tabs>
                        </Row>
                    </div>
                </Draggable>
            </div>
        );
    };
};

export default TourBox;
