import React from 'react';
import './UploadTour.css';
import { Input, Button } from 'antd';

class UploadTour extends React.Component {
    constructor(props) {
        super(props);
    };
    onLoad = (e) => {
        this.props.toggle('alwaysShowPlayBar');
        let fileReader = new FileReader();
        try {
            fileReader.readAsText(e.target.files[0]);
        } catch{
            alert('请重新选择数据！');
        };
        fileReader.onload = (e) => {
            let result = e.target.result;
            if (this.props.accept === 'kml') {
                let blob = new Blob([result], {});
                try {
                    this.props.loadKmlTour(blob);
                } catch{
                    alert('数据不符合要求！！');
                };
            } else if (this.props.accept === 'json') {
                try {
                    if('id' in JSON.parse(result)){
                        this.props.loadJsonTour(JSON.parse(result).id,JSON.parse(result).name,JSON.parse(result).playlist);
                    }else {
                        this.props.loadJsonTour('undefined',JSON.parse(result).name,JSON.parse(result).playlist);
                    };
                } catch{
                    alert('数据不符合要求！！');
                }
            };
        };
    };
    render() {
        return (
            <div className='uplaod'>
                <Input type='file'
                    size='small'
                    accept={'.' + this.props.accept}
                    onChange={this.onLoad}>
                </Input>
                <br />
                <br />
                {/* <Button type='primary' onClick={this.onClickOK}>确认</Button>
                <Button type='primary' onClick={this.onClickCancel}>取消</Button> */}
            </div>
        );
    };
};

export default UploadTour;