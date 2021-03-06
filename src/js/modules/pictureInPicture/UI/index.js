/**
 * Author: DrowsyFlesh
 * Create: 2018/11/16
 * Description:
 */
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {UI} from 'Libs/UI';
import {Button} from 'Components/common/Button';
import {__} from 'Utils';

const PipButton = styled(Button)`
  position: absolute;
  right: 20px;
  top: 14px;
  border-radius: 4px;
  button {
    padding: 0 4px;
    min-width: unset;
    font-size: 12px;
    border: 1px solid #fb7299;
    border-radius: 4px;
    color: ${({on}) => on ? '#fff' : '#fb7299'};
    background-color: ${({on}) => on ? '#fb7299' : '#fff'};
  }
`;

class PIP extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inPIP: false,
        };
        this.video = null;
    }

    componentDidMount() {
        this.video = document.querySelector('#bofqi video');
        this.addListener(this.video);
        new MutationObserver((mutationList) => {
            _.map(mutationList, (mutation) => {
                if (mutation.oldValue) {
                    if (this.state.inPIP) {
                        document.exitPictureInPicture();
                        this.setState({inPIP: false});
                    }
                    this.video = document.querySelector('#bofqi video');
                    this.addListener(this.video);
                }
            });
        }).observe(document.querySelector('#bofqi'), {
            attributeFilter: ['src'],
            attributes: true,
            attributeOldValue: true,
            subtree: true,
        });
    }

    addListener = (videoDOM) => {
        if (!videoDOM || !videoDOM.addEventListener) return;
        const that = this;
        videoDOM.removeEventListener('enterpictureinpicture', null);
        videoDOM.removeEventListener('leavepictureinpicture', null);
        videoDOM.addEventListener('enterpictureinpicture', function() {
            that.setState({inPIP: true});
        });
        videoDOM.addEventListener('leavepictureinpicture', function() {
            that.setState({inPIP: false});
            this.play();
        });
    };

    play = () => {
        if (!window.player) return;
        if (window.player.getDuration() !== window.player.getCurrentTime() && window.player.getState() !== 'PAUSED') {
            window.player.play();
        }
    };

    // 将事件绑定到点击事件上，因为新版页面可能会对this.video重新赋值
    handleOnClick = () => {
        if (!this.video) {
            this.video = document.querySelector('#bofqi video');
            this.addListener(this.video);
        }
        if (!this.video.requestPictureInPicture) return;
        if (!this.state.inPIP) {
            this.video.requestPictureInPicture().then(() => {
                this.setState({inPIP: true});
            });
        } else if (this.state.inPIP) {
            document.exitPictureInPicture().then(() => {
                this.setState({inPIP: false});
                this.play();
            }).catch(e => {
                console.error(e);
                this.setState({inPIP: false});
            });
        }
        chrome.runtime.sendMessage({
            commend: 'setGAEvent',
            action: 'click',
            category: 'PIP',
        });
    };

    render() {
        return (
            <React.Fragment>
                <PipButton on={this.state.inPIP} title="点击进入画中画" onClick={this.handleOnClick}>
                    {__('pictureInPictureTitle')}
                </PipButton>
            </React.Fragment>
        );
    }
}

export class PictureInPictureUI extends UI {
    constructor() {
        super({
            name: 'pictureInPicture',
            dependencies: ['videoAnchor'],
        });
    }

    load = ([container], settings) => {
        return new Promise(resolve => {
            const wrapper = document.createElement('div');
            wrapper.setAttribute('class', 'bilibili-helper-pip-wrapper');
            wrapper.setAttribute('style', 'position: static; margin: 0;');
            container.appendChild(wrapper);
            ReactDOM.render(<PIP settings={settings}/>, wrapper, resolve);
        });
    };
}