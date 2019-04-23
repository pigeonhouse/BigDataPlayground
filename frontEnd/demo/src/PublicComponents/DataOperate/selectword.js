import React, {Component} from 'react';
import { Button, Modal, Transfer, Tooltip, Divider } from 'antd'
import { withPropsAPI } from '@src';
import styles from './inputStyle.less'

class Selectword extends Component{
    constructor(props){
        super(props);
    }
    state = {
        visible: false,
        mockData: [],
        targetKeys: [],
        toolTipsArray:[],
        Tooltipvisible:false,
    }
    componentWillMount(){
        const { propsAPI } = this.props;
        const { getSelected } = propsAPI;
        const item = getSelected()[0];
        const model = item.getModel();
        let labelArray;
        if(model.group === 'ml')
        {
            let labelarray = JSON.parse(JSON.stringify(model.labelArray))
            switch(this.props.index){
                case 0:
                    labelArray = labelarray.train_x;
                    break;
                case 1:
                    labelArray = labelarray.train_y;
                    break;
                case 2:
                    labelArray = labelarray.predict_x;
                    break;
            }
        }
        else{
            let labelarray = JSON.parse(JSON.stringify(model.labelArray));
            labelArray = labelarray.public;
        }
        labelArray = labelArray || [];
        let toolTipsArray = [];
        for(let i in labelArray){
            if(labelArray[i][1] === true){
                toolTipsArray.push(labelArray[i][0]);
            }
        }
        this.setState({toolTipsArray})
    }
    isChange=(labelA, labelB)=>{
        if(!labelA || !labelB || labelA.length != labelB.length) return true;
        for(let i in labelA){
            if(labelA[i][0] !== labelB[i][0])
                return true;
        }
        return false;
    }
    findDataset=(sourceID, sourceAnchor)=>{
        const { propsAPI } = this.props;
        const { find } = propsAPI;
        const sourceItem = find(sourceID);
        const { Dataset, anchor } = sourceItem.getModel();
        if(Dataset.length !== 0){
            if(anchor[1] !== 1){
                if(sourceAnchor === 1){
                    Dataset = Dataset[0];
                }
                else {
                    Dataset = Dataset[1];
                }
            }
            return Dataset;
        }
        else {
            console.log('------')
            if(anchor[0] === 1){
                const edges = propsAPI.save().edges;
                for(let i in edges){
                    console.log(edges[i])
                    if(edges[i].target === sourceID){
                        return this.findDataset(edges[i].source, edges[i].sourceAnchor);
                    }
                }
                return [];
            }
        }
    }
    changeSourceLabel=(item, labelArray)=>{
        if(this.props.type === 'Cluster'){
            let labelarr = [];
            switch(item.model.label){
                case '归一化':    
                    for(let i in labelArray){
                        if(labelArray[i][1]){
                            labelarr.push(['MinMaxScaled'+labelArray[i][0], false])
                        }
                    }
                return [...labelArray, ...labelarr];
                case '标准化':
                    for(let i in labelArray){
                        if(labelArray[i][1]){
                            labelarr.push(['StandardScaled'+labelArray[i][0], false])
                        }
                    }
                    return [...labelArray, ...labelarr];
                case 'one-hot编码':
                    for(let i in labelArray){
                        if(labelArray[i][1]){
                            labelarr.push([labelArray[i][0] + 'ClassVec', false])
                        }
                    }
                return [...labelArray, ...labelarr];
                case 'StringIndexer':
                    for(let i in labelArray){
                        if(labelArray[i][1]){
                            labelarr.push([labelArray[i][0]+'Index', false])
                        }
                    }
                    return [...labelArray, ...labelarr];
                case '特征分组归类':
                    return [...labelArray, [item.model.attr['新生成列名'], false]];
                case '数据筛选':
                    return [...labelArray, [item.model.attr['新生成列名'], false]];
                default: return labelArray;
            }
        }
        else{
            let labelarr = new Array();
            switch(item.model.label){
                case '特征区间化':
                    for(let i in labelArray){
                        if(labelArray[i][1]){
                            labelarr.push([labelArray[i][0]+'_Gaped', false])
                        }
                    }
                    return [...labelArray, ...labelarr];
                case '特征分组归类':
                    for(let i in labelArray){
                        if(labelArray[i][1]){
                            labelarr.push([labelArray[i][0]+'_trans', false])
                        }
                    }
                    return [...labelArray, ...labelarr];
                case 'one-hot编码':
                    if(item.model.Dataset.length === 0)
                    var Dataset = this.findDataset(this.props.sourceid, this.props.index);
                    else var Dataset = item.model.Dataset;
                    for(let i in labelArray){
                        if(labelArray[i][1]){
                            for(let j in Dataset){
                                if(Dataset[j].label === labelArray[i][0]){
                                    const Stat = Dataset[j].stat;
                                    if(Stat.type === 'number')
                                    break;
                                    else {
                                        for(let k in Stat.value){
                                            const index = Number(k)+1;
                                            labelarr.push([labelArray[i][0]+'_'+index, false])
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return [...labelArray, ...labelarr];
                default: return labelArray;
            }
        }
    }
    findSourceLabel=(item)=>{
        if(item.model.label === '数据随机划分'){
            const { propsAPI } = this.props;
            const { save, find } = propsAPI;
            const inf = save();
            const edge = inf.edges;
            for(let i in edge){
                if(edge[i].target === item.model.id){
                    const currentItem = find(edge[i].source);
                    return this.findSourceLabel(currentItem);
                }
            }
        }
        else if(item.model.anchor[0] === 1 || !item.model.anchor[0]){
            if(item.model.labelArray.public)
            return this.changeSourceLabel(item, item.model.labelArray.public);
            else return [];
        }
        else if(item.model.anchor[0] === 2){
            return [...item.model.labelArray.predict_x, ...item.model.labelArray.predict_y];
        }
    }
    changelabelArray=(labelA, labelB)=>{
        if(this.isChange(labelA, labelB)){
            let labelArray = [];
            for(let i in labelB){
                labelArray.push([labelB[i][0], false]);
            }
            return labelArray?labelArray:[];
        }
        else return labelA?labelA:[];
    }
    displayTransfer = () => {
        const { propsAPI } = this.props;
        const { find, getSelected } = propsAPI;
        var item = getSelected()[0];
        var sourceitem = find(this.props.sourceid);
        var labelArray = [];
        const sourcelabel = this.findSourceLabel(sourceitem);
        if(item.model.anchor[0] === 1){
            labelArray = this.changelabelArray(item.model.labelArray.public, sourcelabel)
        }
        else if(item.model.anchor[0] === 2){
            switch(this.props.index){
                case 0:
                    labelArray = this.changelabelArray(item.model.labelArray.train_x, sourcelabel)
                    break;
                case 1:
                    labelArray = this.changelabelArray(item.model.labelArray.train_y, sourcelabel)
                    break;
                case 2:
                    labelArray = this.changelabelArray(item.model.labelArray.predict_x, sourcelabel)
                    break;
            }
        }
        let mockdata = [];
        let targetkeys = [];
        for(var i in labelArray){
            mockdata.push({
                key: i.toString(),
                title: labelArray[i][0],
                description: labelArray[i][0],
                chosen: labelArray[i][1]
            });
            if(labelArray[i][1])
            targetkeys.push(i.toString());
        }
        this.setState({
            visible: true,
            mockData: mockdata,
            targetKeys: targetkeys
        });
    }

    handleOk = () => {
        const { propsAPI } = this.props;
        const { executeCommand, update, getSelected} = propsAPI;
        const item = getSelected()[0];
        let labelArray = [];
        const mockdata = this.state.mockData;
        const targetKeys = this.state.targetKeys;
        let toolTipsArray = [];
        for(let i in mockdata){
            if(targetKeys.indexOf(mockdata[i].key) !== -1){
                labelArray.push([mockdata[i].title, true]);
                toolTipsArray.push(mockdata[i].title)
            }
            else labelArray.push([mockdata[i].title, false]);
        }
        let labelarray = [];
        if(item.model.anchor[0] === 2)
        {
            labelarray = JSON.parse(JSON.stringify(item.model.labelArray))
            switch(this.props.index){
                case 0:
                    labelarray.train_x = labelArray;
                    break;
                case 1:
                    labelarray.train_y = labelArray;
                    break;
                case 2:
                    labelarray.predict_x = labelArray;
                    break;
            }
        }
        else if(item.model.anchor[0] === 1){
            labelarray = JSON.parse(JSON.stringify(item.model.labelArray));
            labelarray.public = labelArray;
        }
        const values = {labelArray:labelarray};
        executeCommand(()=>{
            update(item, {
                ...values
            })
        })
        console.log(propsAPI.save())
        this.props.changeLabelArray(labelArray);
        this.setState({
            visible: false,
            toolTipsArray
        });
    }
    
    handleCancel = () => {
        this.setState({
            visible: false,
        });
    }

    filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1

    handleChange = (targetKeys) => {
        this.setState({ targetKeys });
    }

    handleSearch = (dir, value) => {
        console.log('search:', dir, value);
    };
    tooltipWord=()=>{
        const {propsAPI} = this.props;
        const { getSelected } = propsAPI;
        const item = getSelected()[0];
        if(item.model.group === 'ml'){
            switch(this.props.index){
                case 0: return <div>训练集特征列字段：</div>
                case 1: return <div>训练集目标列字段：</div>
                case 2: return <div>预测集特征列字段：</div>
            }
        }
        else if(item.model.group === 'feature'){
            return <div>进行{item.model.label}的字段:</div>
        }
    }
    isSelect=()=>{
        if(this.props.sourceid === 0)
        return (
            <div>
                {this.tooltipWord()}
                <Button style={{width:'100%', marginBottom:'10px'}} disabled>选择字段</Button>
            </div>       
        );
        else if(this.state.toolTipsArray.length === 0){
            return (
                <div>
                    {this.tooltipWord()}
                    <Button style={{width:'100%', marginBottom:'10px'}} onClick={this.displayTransfer}>选择字段</Button>
                </div>       
            ); 
        }
        else return (
            <div>
                {this.tooltipWord()}
                <Tooltip arrowPointAtCenter 
                    // visible={this.state.Tooltipvisible}
                    placement="bottom" 
                    title={() => {
                        return (
                            <div>
                                已选择
                                {this.state.toolTipsArray.map((item)=>{
                                    return <Divider style={{color:'#fff', margin:'8px 0'}}>{item}</Divider>
                                })}
                            </div>
                        );
                    }}
                    overlayClassName={styles.divider}
                    mouseLeaveDelay="0.1"
                >
                    <Button style={{width:'100%', marginBottom:'10px'}} onClick={this.displayTransfer}
                        // onMouseEnter={this.handleMouseEnterClose}
                        mouseLeaveDela={0.01}
                        // onMouseLeave={this.handleMouseLeaveClose}
                    >选择字段</Button>
                </Tooltip>
            </div>
        )
    }
    // handleMouseEnterClose=()=>{
    //     this.setState({Tooltipvisible:true})
    // }
    // handleMouseLeaveClose=()=>{
    //     this.setState({Tooltipvisible:false})  
    // }
    render(){
        return (
            <div>
                {this.isSelect()}
                <Modal title="选择字段" visible={this.state.visible}
                    onOk={this.handleOk} onCancel={this.handleCancel}
                    style={{}}
                >
                    <div style={{textAlign:'center'}}>
                        <Transfer
                            dataSource={this.state.mockData}
                            showSearch
                            filterOption={this.filterOption}
                            targetKeys={this.state.targetKeys}
                            onChange={this.handleChange}
                            onSearch={this.handleSearch}
                            render={item => item.title}
                            listStyle={{
                                textAlign: 'left'
                            }}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withPropsAPI(Selectword);
