import React from 'react';
import { FlowItemPanel } from './EditorItemPanel';
import { FlowModelPanel } from './EditorModelPanel';
import { ClusterFlowDataPanel } from '../../ClusterModeComponents/EditorDataPanel';
import { fetchTool } from '../../FetchTool';

import styles from './index.less';

function itemScrollMatch() {
    var flowItem = document.getElementById('flowItem');
    var menuDiv = document.getElementById('menuDiv');
    if (flowItem === null || menuDiv === null) return;
    var style;

    if (window.getComputedStyle) {
        style = window.getComputedStyle(menuDiv, null);
    } else {
        style = menuDiv.currentStyle;
    }
    flowItem.style.width = style.width;
}

const init = {
    method: 'GET',
    mode: 'cors',
    headers: {
        "Content-Type": "application/json;charset=utf-8"
    },
    credentials: 'include'
}

class FlowNodePanel extends React.Component {

    state = {
        isMouseEnter: true,
        nodesModuleInfo: new Array(),
        commonFileList: new Array(),
        modelList: new Array()
    }

    resize = () => {
        itemScrollMatch();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    async fetchmodule() {
        const response = await fetchTool("/experiment-service/module", init);
        return await response.json();
    }

    async fetchCommonFiles() {
        const response = await fetchTool("/filesystem-service/common-files", init);
        return await response.json();
    }    
    
    async fetchModels() {
        const response = await fetchTool("/filesystem-service/common-files", init);
        return await response.json();
    }

    async componentWillMount() {
        this.setState({
            nodesModuleInfo: await this.fetchmodule(),
            commonFileList: await this.fetchCommonFiles(),
            modelList: await this.fetchModels(),
        });
        this.screenChange();
    }

    screenChange() {
        window.addEventListener('resize', this.resize);
    }

    componentWillUpdate() {
        itemScrollMatch();
    }

    mouseEnter = () => {
        this.setState({ isMouseEnter: true })
        itemScrollMatch();
    }

    mouseLeave = () => {
        this.setState({ isMouseEnter: false })
    }

    render() {
        const { nodesModuleInfo, commonFileList, isMouseEnter, modelList } = this.state;

        return (
            <div
                onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}
                className={isMouseEnter ? styles.scrollapp : styles.unscrollapp}
                style={{ backgroundColor: '#fff', overflowX: "hidden" }}
                id="menuDiv"
            >
                <div id="flowItem">
                    <FlowModelPanel modelList={modelList} />
                    <ClusterFlowDataPanel commonFileList={commonFileList} />
                    <FlowItemPanel moduleNodesList={nodesModuleInfo} />
                </div>
            </div>
        );
    }
}

export default FlowNodePanel;