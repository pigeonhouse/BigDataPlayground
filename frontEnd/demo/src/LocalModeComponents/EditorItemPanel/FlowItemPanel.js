import React from 'react';
import { ItemPanel, Item } from '@src';
import { Menu, Icon } from 'antd';
import ItemDecoration from '../../PublicComponents/ItemDecoration/ItemDecoration'
import styles from './index.less';

/**
 * 左侧下拉菜单栏，包括可操作实现的组件
 */
const SubMenu = Menu.SubMenu;

class FlowItemPanel extends React.Component {
  state={
    isMouseEnter:false
  }
  mouseEnter=()=>{
    this.setState({isMouseEnter:true})
  }
  mouseLeave=()=>{
    this.setState({isMouseEnter:false})
  }
  render() {
    return (
      <div onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave} 
      className={this.state.isMouseEnter?styles.scrollapp:styles.unscrollapp}
      style={{backgroundColor:'#fff'}}>
        <Menu
            defaultOpenKeys={['sub2','sub3']}
            mode="inline"
            style={{maxHeight:'calc(100vh - 105px)', width:'245px', borderRight:0}}
            selectable={false}
          >
          <ItemDecoration/>
          <SubMenu key="sub2" title={<span><Icon type="mail" /><span>数据预处理</span></span>}>
          <Menu.Item key="7">
              <ItemPanel><Item
                type="node"
                size="200*40"
                shape="one-one"
                model={{
                  label: '缺失值填充',
                  elabel:'Fillna',
                  anchor: [1, 1],
                  attr:{type:'average'},
                  attrDetail:[],
                  // attrDetail:[{elabel:'type',label:'填充值', type:'Input', regexp:'^[0-9]+.?[0-9]*'}],
                  // attrDetail:[{elabel:'type',label:'填充值', type:'Select', evalue:['average', 'median', 'max', 'min'], value:['平均值', '中位数', '最大值', '最小值']}],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  group: 'feature',
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}      
          /></ItemPanel></Menu.Item>

          <Menu.Item key="8">
            <ItemPanel><Item
                type="node"
                size="200*40"
                shape="one-one"
                model={{
                  label: '归一化',
                  elabel:'MinMaxScaler',
                  attr:{},
                  attrDetail:[],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  anchor: [1, 1],
                  group: 'feature',
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}
              /></ItemPanel></Menu.Item>

              <Menu.Item key="9">
                <ItemPanel><Item
                type="node"
                size="200*40"
                shape="one-one"
                model={{
                  label: '特征区间化',
                  attr:{},
                  attrDetail:[],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  anchor: [1, 1],
                  group: 'feature',
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}
              /></ItemPanel></Menu.Item>

              <Menu.Item key="10">
                <ItemPanel><Item
                type="node"
                size="200*40"
                shape="one-one"
                model={{
                  label: '特征分组归类',
                  attr:{},
                  attrDetail:[],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  anchor: [1, 1],
                  group: 'feature',
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}    
              /></ItemPanel></Menu.Item>

              <Menu.Item key="11">
                <ItemPanel><Item
                type="node"
                size="200*40"
                shape="one-one"
                model={{
                  label: 'one-hot编码',
                  attr:{},
                  attrDetail:[],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  anchor: [1, 1],
                  group: 'feature',
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}           
              /></ItemPanel></Menu.Item>
              <Menu.Item key="12">
                <ItemPanel><Item
                type="node"
                size="200*40"
                shape="one-two"
                model={{
                  label: '数据随机划分',
                  attr:{public:0.7},
                  attrDetail:[],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  anchor: [1, 2],
                  group: 'feature',
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}           
              /></ItemPanel></Menu.Item>

          </SubMenu>

          <SubMenu key="sub3" title={<span><Icon type="appstore" /><span>机器学习</span></span>}>
            <SubMenu key="g3" title="回归">
            
              <Menu.Item key="13"><ItemPanel><Item
                  type="node"
                  size="200*40"
                  shape='two-one'
                  model={{
                    label: '单变量线性回归',
                    anchor: [2, 1],
                    attr:{},
                    attrDetail:[],
                    Dataset: [],
                    labelArray: {}, 
                    length: 0,
                    group:"ml",
                    evaluation:[],
                    keyConfig:{
                      color_type: '#1890FF',
                      state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                    }
                  }}
                  
                /></ItemPanel></Menu.Item>
              <Menu.Item key="14"><ItemPanel><Item
                  type="node"
                  size="200*40"
                  shape='two-one'
                  model={{
                    label: '单变量多项式回归',
                    attr:{'多项式最高幂': 5},
                    attrDetail:[{elabel:'多项式最高幂',label:'多项式最高幂', type:'Input', regexp:'^[1-9][0-9]*$'}],
                    anchor: [2, 1],
                    Dataset: [],
                    labelArray: {},
                    length: 0,
                    group:"ml",
                    keyConfig:{
                      color_type: '#1890FF',
                      state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                    }
                  }}            
                /></ItemPanel></Menu.Item>

                <Menu.Item key="15"><ItemPanel><Item
                  type="node"
                  size="200*40"
                  shape='two-one'
                  model={{
                    label: '多变量线性回归',
                    attr:{},
                    attrDetail:[],
                    group:"ml",
                    anchor: [2, 1],
                    Dataset: [],
                    labelArray: {}, 
                    length: 0,
                    keyConfig:{
                      color_type: '#1890FF',
                      state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                    }
                  }}           
                /></ItemPanel></Menu.Item>

                <Menu.Item key="16"><ItemPanel><Item
                  type="node"
                  size="200*40"
                  shape='two-one'
                  model={{
                    label: '决策树回归',
                    attr:{},
                    attrDetail:[],
                    anchor: [2, 1],
                    Dataset: [],
                    labelArray: {}, 
                    length: 0,
                    group:"ml",
                    keyConfig:{
                      color_type: '#1890FF',
                      state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                    }
                  }}              
                /></ItemPanel></Menu.Item>
                <Menu.Item key="17"><ItemPanel><Item
                  type="node"
                  size="200*40"
                  shape='two-one'
                  model={{
                    label: '随机森林回归',
                    attr:{},
                    attrDetail:[],
                    anchor: [2, 1],
                    Dataset: [],
                    labelArray: {}, 
                    length: 0,
                    group:"ml",
                    keyConfig:{
                      color_type: '#1890FF',
                      state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                    }
                  }}           
                /></ItemPanel></Menu.Item>         
            </SubMenu>

            <SubMenu key="g4" title="分类">
              <Menu.Item key="18"><ItemPanel><Item
                type="node"
                size="200*40"
                shape='two-one'
                model={{
                  label: '朴素贝叶斯',
                  attr:{},
                  attrDetail:[],
                  anchor: [2, 1],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  group:"ml",
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}   
              /></ItemPanel></Menu.Item>

              <Menu.Item key="19"><ItemPanel><Item
                type="node"
                size="200*40"
                shape='two-one'
                model={{
                  label: '支持向量机',
                  attr:{},
                  attrDetail:[],
                  anchor: [2, 1],
                  Dataset: [],
                  labelArray: {}, 
                  length: 0,
                  group:"ml",
                  keyConfig:{
                    color_type: '#1890FF',
                    state_icon_url: 'https://gw.alipayobjects.com/zos/rmsportal/uZVdwjJGqDooqKLKtvGA.svg',
                  }
                }}    
              /></ItemPanel></Menu.Item>
            </SubMenu>
          </SubMenu>
        </Menu>
      
      </div> 
    );
  }
}

export default FlowItemPanel;
