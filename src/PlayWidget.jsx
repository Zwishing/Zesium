import React from 'react';
import { Slider, Row, Col, Button, Icon, Switch } from 'antd';
import './PlayWidget.css';

class PlayWidget extends React.Component {
    constructor(props) {
        super(props);
        this.timerId = 0;
        this.state = {
            millisecond: 0,
            second: 0,
            minute: 0,
            playing: false,
        };
    };
    onStart = () => {
        const that = this;
        that.props.startTour();
        that.timerId = setTimeout(function fn() {
            if ((that.state.second + that.state.minute * 60) < that.props.duration) {
                if (that.state.second === 59) {
                    that.setState({
                        second: 0,
                        minute: that.state.minute + 1,
                    });
                } else {
                    that.setState({
                        second: that.state.second + 1,
                    });
                };
                that.timerId = setTimeout(fn, 1000);
            } else {
                clearTimeout(that.timerId);
                that.setState({
                    playing: false,
                });
            };
        }, 1000);
        that.setState({
            playing: true,
        });
    };
    onStop = () => {
        clearTimeout(this.timerId);
        this.props.stopTour();
        this.setState({
            playing: false,
        });
    };

    playState = () => {
        if (this.state.playing) {
            this.onStop();
        } else {
            this.onStart();
        };
    };
    reset = () => {
        clearTimeout(this.timerId);
        this.props.onReset();
        this.setState({
            playing: false,
            millisecond: 0,
            minute: 0,
            second: 0,
        });
    };
    onClose = () => {
        this.props.toggle('showPlayBar');
        this.reset();
    };
    onSave = () => {
        this.props.tourSave();
    };
    formatter = () => {
        const tipMinute = this.state.minute < 10 ? '0' + this.state.minute : this.state.minute;
        const tipSecond = this.state.second < 10 ? '0' + this.state.second : this.state.second;
        return (tipMinute + ':' + tipSecond);
    };
    render() {
        return (
            <div className='play-widget' hidden={!this.props.hidden}>
                <Row align='middle' type='flex'>
                    <Col span={2}>
                        <Button size='small'
                            shape='circle'
                            ghost={true}
                            onClick={this.playState}
                            title={this.state.playing ? '暂停' : '播放'}>
                            <Icon type={this.state.playing ? 'pause' : 'caret-right'}>
                            </Icon>
                        </Button>
                    </Col>
                    <Col span={3}>
                        <span>{this.state.minute < 10 ? '0' + this.state.minute : this.state.minute}:</span>
                        <span>{this.state.second < 10 ? '0' + this.state.second : this.state.second}</span>
                    </Col>
                    <Col span={10}>
                        <Slider defaultValue={0}
                            min={0}
                            max={this.props.duration}
                            tipFormatter={this.formatter}
                            value={this.state.minute * 60 + this.state.second}>
                        </Slider>
                    </Col>
                    <Col span={3}>
                        <span>{parseInt(this.props.duration / 60) < 10 ? '0' + parseInt(this.props.duration / 60) : parseInt(this.props.duration / 60)}:</span>
                        <span>{this.props.duration % 60 < 10 ? '0' + this.props.duration % 60 : this.props.duration % 60}</span>
                    </Col>
                    <Col span={2}>
                        <Button size='small'
                            shape='circle'
                            ghost={true}
                            onClick={this.reset}
                            title='重置'>
                            <Icon type='redo'>
                            </Icon>
                        </Button>
                    </Col>
                    <Col span={2}>
                        <Button size='small'
                            ghost={true}
                            shape='circle'
                            onClick={this.onSave}
                            disabled={this.state.playing}
                            title='保存'>
                            <Icon type='save'>
                            </Icon>
                        </Button>
                    </Col>
                    <Col span={2}>
                        <Button size='small'
                            ghost={true}
                            shape='circle'
                            onClick={this.onClose}
                            title='关闭'>
                            <Icon type='close'>
                            </Icon>
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    };
};

export default PlayWidget;