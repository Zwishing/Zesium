import React from 'react';
import './Position.css';

class Position extends React.Component{

    constructor(props){
        super(props);
        this.state = {
        };
    };

    render(){
        return(
            <div className = 'position-bar' >
                <p>经度：</p><span className = 'position-bar-item'>{this.props.currentPosition.lon}</span>
                <p>纬度：</p><span className = 'position-bar-item'>{this.props.currentPosition.lat}</span>
                <p>高度：</p><span className = 'position-bar-item'>{this.props.currentPosition.height}</span>
                <p>Roll：</p><span className = 'position-bar-item'>{this.props.currentPosition.roll}</span>
                <p>Heading：</p><span className = 'position-bar-item'>{this.props.currentPosition.heading}</span>
                <p>Pitch：</p><span className = 'position-bar-item'>{this.props.currentPosition.pitch}</span>
            </div>
        );
    };
};

export default Position;
