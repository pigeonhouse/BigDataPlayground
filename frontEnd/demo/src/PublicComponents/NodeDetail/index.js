import React from 'react';
import { Card, Form, Input, Button } from 'antd';
import { withPropsAPI } from '@src';
import Selectword from '../DataOperate/selectword'
import Uploadfile from '../DataOperate/upload'
import LocalTestData from '../DataOperate/LocalTestData'
import LocalTrainData from '../DataOperate/LocalTrainData'
import HdfsFile from '../DataOperate/hdfsFile'
import styles from './index.less';
import Feature from '../DataOperate/Feature'
import Papa from 'papaparse'
import { Stat } from '../DataOperate/stat'

const { Item } = Form;

const inlineFormItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};

class NodeDetail extends React.Component {
  
  state = {
    visible: false,
    running : false,
    labelArray:[],
  }

  componentWillMount(){
    const {  propsAPI } = this.props;
    const { getSelected } = propsAPI;
    const item = getSelected()[0];
    const { labelArray } = item.getModel();
    if(labelArray.public){
      this.setState({
        labelArray:labelArray.public
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { form, propsAPI } = this.props;
    const { getSelected, executeCommand, update } = propsAPI;
    console.log(getSelected)
    console.log(update)
    console.log(propsAPI)
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const item = getSelected()[0];
      if (!item) {
        return;
      }
      var re = /^[0-9]+.?[0-9]*/;
      for(let i in values.attr){
        if(re.test(item.model.attr[i])){
          values.attr[i] = Number(values.attr[i]);
        }
      }
      executeCommand(() => {
        update(item, {
          ...values,
        });
      });
    });
  }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = () => {
    this.setState({
      visible: false,
    });
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  }
  isInputOutput(label, group, Dataset){
    if(label === 'hdfs数据')
      return(
        <HdfsFile ></HdfsFile>
      )
    else if(label === '本地数据')
      return (
        <Uploadfile ></Uploadfile>
      )
    else if(label === 'Titanic测试' && Dataset.length === 0){
      return(
        <LocalTestData ></LocalTestData>
      )
    }
    else if(label === 'Titanic训练' && Dataset.length === 0){
      return(
        <LocalTrainData ></LocalTrainData>
      )
    }
    else if(group === 'input' && Dataset.length === 0){
      const { propsAPI } = this.props;
      const { getSelected } = propsAPI;
      const item = getSelected()[0];
      const model = item.getModel();
      const init={
        method: 'POST', 
        body:"fileName=" + model.label,
        mode: 'cors',
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
      　　  },
        }
        fetch(
          'http://10.105.222.92:3000/showData',init
        )
        .then((response) => {
          if(response.status===200){
            response.json().then((respData)=>{
            let len = respData.length
            var s = respData[0]
            for(let i = 1; i<len; i++){
                s = s + "\n" + respData[i]
            }
            var fieldNameArray = [];
            let vectorLength;
            const { propsAPI } = this.props;
            const { getSelected, update } = propsAPI;
            var results = Papa.parse(s,{header:true,dynamicTyping: true});
            fieldNameArray.push(results.meta.fields);
            vectorLength = results.data.length - 1
            var n = new Array();

            for(let indexOfCols = 0; indexOfCols < fieldNameArray[0].length; indexOfCols++){
              var colName = fieldNameArray[0][indexOfCols];
              var colValue = new Array();
              for (let indexOfRows = 0; indexOfRows < results.data.length - 1; indexOfRows++){
              colValue.push(results.data[indexOfRows][colName])
              }
              n.push({label:colName,value:colValue})
              }
              var STAT = new Array();
              STAT = Stat(n);
              let m = fieldNameArray[0].map((item)=>{
                return [item, false];
              })
              var values = {
                  Dataset:STAT,
                  labelArray:{public:m}, 
                  length:vectorLength
              }
              const item = getSelected()[0];
              values['keyConfig'] = JSON.parse(JSON.stringify(item.model.keyConfig));
              values.keyConfig.state_icon_url = 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.svg';
              update(item, {...values});
              console.log("propsAPI")
              console.log(propsAPI.save())
            })
          }
        })
        .catch(e => console.log('错误:', e))
    }
  }
  isFeature = (group, label, sourceID)=>{
    if(group === 'feature'){
      return <Feature
              label={label}
              sourceID = {sourceID}
              labelArray = {this.state.labelArray}/>
    }
  }
  changeLabelArray = (labelArray)=>{
    this.setState({
      labelArray,
    })
  }
  handleSubmitTest = (e) => {
    e.preventDefault();

    const { form, propsAPI } = this.props;
    const { getSelected, executeCommand, update } = propsAPI;
  
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      const item = getSelected()[0];
      if (!item) {
        return;
      }
      let labelArray = JSON.parse(JSON.stringify(item.model.labelArray));
      labelArray['predict_y'] = [[values['预测集名称'], true]];
      executeCommand(() => {
        update(item, {
          labelArray:labelArray
        });
      });
    });
  }
  testLabelInput=(group, getFieldDecorator)=>{
    if(group === 'ml'){
      const { propsAPI } = this.props;
      const { getSelected, update } = propsAPI;
      const item = getSelected()[0];
      let labelArray = JSON.parse(JSON.stringify(item.model.labelArray));
      labelArray['predict_y'] = [['predict', true]];
      update(item, {
        labelArray:labelArray
      });
      return <Item style={{margin:0}} label="预测集名称" {...inlineFormItemLayout}>
              {
                getFieldDecorator('预测集名称', {
                  initialValue: 'predict',
                })(<Input onBlur={this.handleSubmitTest}/>)
              }
            </Item>
    }
  }
  render() {
    const { form, propsAPI } = this.props;
    const { getFieldDecorator } = form;
    const { getSelected } = propsAPI;

    const item = getSelected()[0];
    
    if (!item) {
      return null;
    }
    const { label, attr, anchor, group, Dataset } = item.getModel();

    if(label === '数据随机划分'){
      var targetid = new Array();
    }
    else {
      var targetid = new Array(anchor[0]).fill(0);
      const inf = propsAPI.save().edges;
      for(let i in inf){
          if(inf[i].target === item.id && inf[i].targetAnchor < anchor[0]){
            targetid[inf[i].targetAnchor] = inf[i].source;
          }
      }
      if(anchor[0] === 2){
        targetid=[targetid[0], ...targetid];
      }
    }
    var arr = []
    if(group !== 'feature'){
      for (let i in attr) {
        let o = {};
        o[i] = attr[i];
        arr.push(o)
      }
    }
    return (
      <Card 
        type="inner" 
        title="参数" 
        bordered={false} 
        style={{paddingRight:0}}
        className={styles.scrollapp}
      >
        <Form onSubmit={this.handleSubmit}>
          <Item style={{margin:0}} label="label" {...inlineFormItemLayout}>
            {
              getFieldDecorator('label', {
                initialValue: label,
              })(<Input onBlur={this.handleSubmit}/>)
            }
          </Item>
          {arr.map((item)=>{
            const itemKey = Object.keys(item)[0];
            var re = /^[0-9]+.?[0-9]*/;
            return <Item style={{margin:0}} label={itemKey} {...inlineFormItemLayout}>
                    {
                      getFieldDecorator(`attr.${itemKey}` , {
                        rules:re.test(item[itemKey])?[{
                          required:false,
                          pattern: new RegExp(/^[1-9]\d*$/, "g"),
                          message: '请输入数字'
                        }]:[],
                        initialValue: item[itemKey],
                      })(<Input style={{margin:0}} onBlur={this.handleSubmit}/>)
                    }
                  </Item>;
          })}
          {targetid.map((value, index)=>{
            return <Selectword 
                      sourceid={value}
                      label={label}
                      index={index}
                      style={{margin:0}}
                      changeLabelArray={this.changeLabelArray}
                    ></Selectword>;
          })}
          {this.testLabelInput(group, getFieldDecorator)}
          {this.isFeature(group, label, targetid[0])}
          {this.isInputOutput(label, group, Dataset)}
        </Form>
      </Card>
    );
  }
}

export default Form.create()(withPropsAPI(NodeDetail));