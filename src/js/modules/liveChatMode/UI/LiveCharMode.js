/**
 * Author: DrowsyFlesh
 * Create: 2018/12/14
 * Description:
 */

import React from 'react';
import styled, {css} from 'styled-components';
import {theme} from 'Styles';
import store from 'store';

const {color} = theme;

const Btn = styled.span`
  display: inline-block;
  position: absolute;
  right: 130px;
  top: 50%;
  height: 20px;
  padding: 0 5px;
  line-height: 20px;
  vertical-align: middle;
  transform: translateY(-50%);
  background-color: white;
  border-radius: 4px;
  border: 1px solid ${color('bilibili-blue')};
  color: ${color('bilibili-blue')};
  cursor: pointer;
  transition: all 0.3s;
  &.on, &:hover {
    background-color: ${color('bilibili-blue')};
    color: white;
  }
`;

const stylesheet = css`
  .player-full-win.hide-aside-area .aside-area {
    display: block;
  }
  .hide-aside-area .live-room-app .app-content .app-body .player-and-aside-area .aside-area {
    background-color: transparent;
    pointer-events: none;
  }
  .hide-aside-area .live-room-app .app-content .app-body .player-and-aside-area .aside-area .chat-history-panel {
    position: fixed;
    left: 0;
    bottom: 70px;
    width: 100%;
    height: calc(50% - 20px);
    pointer-events: none;
    background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.8) 5%, transparent 25%);
  }
  .hide-aside-area .#chat-history-list {
    pointer-events: none;
    height: 100%;
  }
  .hide-aside-area .live-room-app .app-content .app-body .player-and-aside-area .aside-area .chat-history-panel::-webkit-scrollbar,
  .hide-aside-area .live-room-app .app-content .app-body .player-and-aside-area .aside-area .rank-list-section,
  .hide-aside-area #penury-gift-msg,
  .hide-aside-area #chat-control-panel-vm .bottom-actions,
  .hide-aside-area .chat-history-panel .chat-history-list .chat-item.danmaku-item:before {
    display: none;
  }
  .hide-aside-area .chat-history-panel .chat-history-list .chat-item.danmaku-item {
    margin: 0;
    padding: 0 5px;
  }
  .hide-aside-area .live-room-app .app-content .app-body .chat-history-panel .chat-item,
  .hide-aside-area .control-panel-icon-row {
    pointer-events: none;
  }
  .hide-aside-area .live-room-app .app-content .app-body .chat-history-panel .chat-item .user-name {
    //font-size: 120%;
    text-shadow: 0px 1px 1px #000;
  }
  .hide-aside-area .live-room-app .app-content .app-body .chat-history-panel .chat-item .danmaku-content {
    color: #eee;
    //font-size: 120%;
    text-shadow: 0px 1px 1px #000;
  }
  .hide-aside-area .live-room-app .app-content .app-body .chat-history-panel .chat-item span,
  .hide-aside-area #chat-popup-area-vm,
  .hide-aside-area .chat-small-icon-box,
  .hide-aside-area .control-panel-icon-row > *,
  .hide-aside-area .danmaku-menu {
    pointer-events: auto;
  }
  .hide-aside-area #chat-control-panel-vm{
    pointer-events: auto;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    pointer-events: none;
    z-index: 1;
  }
  .hide-aside-area #chat-control-panel-vm .control-panel-ctnr {
    height: auto;
    padding: 0 3px;
    pointer-events: none;
    background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.8) 5%, transparent 25%);
  }
  .hide-aside-area #chat-control-panel-vm textarea {
    height: 36px;
    background-color: #1b1b1b;
    border-color: #2b2b2b;
    color: #eee;
    pointer-events: auto;
  }
  .hide-aside-area .bilibili-live-player-video video {
    height: calc(100% - 40px);
  }
  .hide-aside-area .bilibili-live-player-video-controller {
    bottom: 35px;
  }
  .hide-aside-area .bilibili-live-player-video-controller .bilibili-live-player-video-controller-container {
    padding: 0 130px 0 70px;
  }
`;

export class LiveCharMode extends React.Component {
    constructor(props) {
        super(props);
        this.roomId = location.pathname.substr(1);
        const locationOption = store.get('bilibili-helper-live-chat-mode') || {};
        this.state = {
            on: locationOption[this.roomId] || false,
            currentState: 0, // 0: default, 1: webfullscreen, 2: full
        };
        this.addListener();
    }

    componentDidMount() {
        this.bodyDOM = document.querySelector('body');
    }

    addListener = () => {
        if (!this.bodyDOM) this.bodyDOM = document.querySelector('body');
        const classList = this.bodyDOM.classList;
        new MutationObserver(() => {
            const {on, currentState} = this.state;
            switch (currentState) {
                case 0: // 普通模式
                    this.setState({currentState: 1});
                    if (on && !classList.contains('hide-aside-area')) {
                        document.querySelector('.aside-area-toggle-btn button').click();
                        const hideBtn = document.querySelector('.bilibili-live-player-video-controller-hide-danmaku-btn button');
                        if (hideBtn.getAttribute('data-title') === '隐藏弹幕') hideBtn.click();
                    }
                    break;
                case 1: // 网页全屏
                    if (!classList.contains('player-full-win')) this.setState({currentState: 0});
                    break;
            }
            //if (classList.contains('fullscreen-fix')) this.setState({currentState: 2});
        }).observe(this.bodyDOM, {
            attributes: true,
            attributeFilter: ['class'],
            attributeOldValue: true,
        });
    };

    handleOnClick = () => {
        const newValue = !this.state.on;
        this.setState({on: newValue}, () => {
            const locationOption = store.get('bilibili-helper-live-chat-mode') || {};
            if (newValue) {
                locationOption[this.roomId] = true;
            } else {
                delete locationOption[this.roomId];
            }
            store.set('bilibili-helper-live-chat-mode', locationOption);
        });
    };

    render() {
        const {on, currentState} = this.state;
        return (
            <React.Fragment>
                <Btn className={on ? 'on' : ''} onClick={this.handleOnClick}>{on ? '关闭' : '开启'}版聊模式</Btn>
                {currentState !== 0 && on && <style>{stylesheet}</style>}
            </React.Fragment>
        );
    }

}