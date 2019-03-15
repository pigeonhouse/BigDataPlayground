import React, {Component} from 'react';
import { Button, Modal, Transfer } from 'antd'
import { withPropsAPI } from '@src';
import Feature from './Feature.js'
class Selectword extends Component{
    constructor(props){
        super(props);
    }
    state = {
        visible: false,
        mockData: [],
        targetKeys: [],
        labelArray: []
    }
    featuresOperate=(label)=>{
        // console.log('update')
        // console.log(this.state.labelArray)
        if(label === '特征区间化' 
        || label === '特征分组归类')
        return <Feature
                    label={label}
                    labelArray={this.state.labelArray}
                ></Feature>
        else if(label === '特征二进制化'){
            const { propsAPI } = this.props;
            const { getSelected, executeCommand, update } = propsAPI;
            const item = getSelected()[0];
            let labelArray = [];
            for(let i in this.state.labelArray){
                if(this.state.labelArray[i][1]){
                    labelArray.push(this.state.labelArray[i][0])
                }
            }
            const attr = {attr: labelArray};
            console.log(attr)
            executeCommand(()=>{
                update(item, {...attr})
            })
        }
    }
    displayTransfer = () => {
        const { propsAPI } = this.props;
        const { find, getSelected } = propsAPI;
        var item = getSelected()[0];
        var labelArray = [];
        if(item.model.select_status > 1 && item.model.labelArray[this.props.index].length !== 0){
            labelArray = item.model.labelArray[this.props.index];
        }
        else if(item.model.select_status === 1 && item.model.labelArray.length !== 0){
            labelArray = item.model.labelArray;
        }
        else {
            item = find(this.props.id);
            if(item.model.select_status > 1){
                let tail = item.model.labelArray.length-1;
                for(var i in item.model.labelArray[tail])
                    labelArray.push([item.model.labelArray[tail][i][0], false]);
            }
            else {
                for(var i in item.model.labelArray)
                    labelArray.push([item.model.labelArray[i][0], false]);
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
        for(let i in mockdata){
            if(targetKeys.indexOf(mockdata[i].key) !== -1){
                labelArray.push([mockdata[i].title, true]);
            }
            else labelArray.push([mockdata[i].title, false]);
        }
        let labelarray = [];
        if(item.model.select_status > 1)
        {
            labelarray = JSON.parse(JSON.stringify(item.model.labelArray))
            labelarray[this.props.index] = labelArray;
        }
        else {
            labelarray = labelArray;
        }
        const values = {labelArray:labelarray};
        executeCommand(()=>{
            update(item, {
                ...values
            })
        })
        console.log(propsAPI.save())
        this.setState({
            visible: false,
            labelArray: labelarray
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
    isSelect=()=>{
        if(this.props.id === 0)
        return (<div><Button style={{width:'100%'}} disabled>选择字段</Button></div>)
        else return <Button style={{width:'100%'}} onClick={this.displayTransfer}>选择字段</Button>

    }
    render(){
        return (
            <div>
                {this.isSelect()}
                {this.featuresOperate(this.props.label)}
                <Modal title="选择字段" visible={this.state.visible}
                    onOk={this.handleOk} onCancel={this.handleCancel}
                    style={{}}
                >
                    <div  style={{textAlign: 'center'}}>
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
