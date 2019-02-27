import React from 'react';
import { Card, Form, Input, Modal, Button } from 'antd';
import { withPropsAPI } from '@src';
import Selectword from '../DataOperate/selectword'
import Download from '../DataOperate/download'
import Show from '../DataOperate/Datashow/index.js'
import {AppendingLineChart} from "../linechart/linechart.ts";
import d3 from "d3"
import Uploadfile from '../DataOperate/upload';

const { Item } = Form;

const inlineFormItemLayout = {
  labelCol: {
    sm: { span: 6 },
  },
  wrapperCol: {
    sm: { span: 18 },
  },
};

let a=1;

class NodeDetail extends React.Component {
  
  state = {
    visible: false,
    running : false,
  }

  handleSubmit = (e) => {
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
      executeCommand(() => {
        update(item, {
          ...values,
      
        });
      });
    });
  }
  changeColor = (e)=>{
    e.node = [{shape: 'flow-test', state_icon_url:''}];
    e.preventDefault();
    const { propsAPI } = this.props;
    const { getSelected, executeCommand, update, find } = propsAPI;
    const item1 = getSelected()[0];
    console.log(item1)
    // const values = {state_icon_url:'https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg'}
    executeCommand(() => {
      const item = find(item1.id);
      update(item, {
        ...values,
      });
    });
  }
  showModal = () => {
    console.log(a)
    this.setState({
      visible: true,
    });

  }

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }

  isSelectVisible(select_status){
    if(select_status)
    return <Selectword style={{margin:0}}></Selectword>;
  }
  isInputOutput(label){
    if(label === 'Output')
    return (
      <div>
        <Show style={{minWidth:'206px',marginBottom:'10px'}}></Show>
        <Download></Download>
      </div>
    );
    else if(label === 'Input')
    return (
      <Uploadfile></Uploadfile>
    );
  }

  render() {
    const { form, propsAPI } = this.props;
    const { getFieldDecorator } = form;
    const { getSelected } = propsAPI;

    const item = getSelected()[0];
    
    if (!item) {
      return null;
    }

    const { label } = item.getModel();
    const { attr } = item.getModel();
    const { select_status } = item.getModel();
    var arr = []
    for (let i in attr) {
        let o = {};
        o[i] = attr[i];
        arr.push(o)
    }

    return (
      <Card type="inner" title="参数" bordered={false}>
        <Form onSubmit={this.handleSubmit}>

          <Item label="label" {...inlineFormItemLayout} style={{margin:1}}>
            {
              getFieldDecorator('label', {
                initialValue: label,
              })(<Input onBlur={this.handleSubmit} />)
            }
          </Item>
          {this.isSelectVisible(select_status)}
          {arr.map((item)=>{
            const itemKey = Object.keys(item)[0];
            return <Item label={itemKey} {...inlineFormItemLayout} style={{margin:1}}>
                    {
                      getFieldDecorator(`attr.${itemKey}` , {
                        initialValue: item[itemKey],
                      })(<Input onBlur={this.handleSubmit} />)
                    }
                  </Item>;
          })}
          {this.isInputOutput(label)}
        </Form>
      </Card>
    );
  }
}

export default Form.create()(withPropsAPI(NodeDetail));
