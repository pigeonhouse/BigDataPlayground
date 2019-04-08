import { OneVarLinearRegression } from './MachineLearning/Regression/OneVarLinearRegression'
import { NaiveBayes } from './MachineLearning/Classification/NaiveBayes'
import React, { Component } from 'react'
import { Button,Modal,Icon,message} from 'antd'
import { withPropsAPI } from '@src';
import { runMnist } from './MnistTest/mnist';
import { MutiVarLinearRegression } from './MachineLearning/Regression/MutiVarLinearRegression'
import { OneVarPolynomialRegression } from './MachineLearning/Regression/OneVarPolynomialRegression'
import { DecisionTreeRegression } from './MachineLearning/Regression/DecisionTree'
import { RandomForest } from './MachineLearning/Regression/RandomForest'
import { SVM } from './MachineLearning/Classification/SVM'
import { fillNa } from '../DataOperate/DataProcess/fillNa'
import { Onehot } from '../DataOperate/DataProcess/Onehot'
import { Randis } from '../DataOperate/DataProcess/Randis'
import { SelectCol } from '../DataOperate/DataProcess/SelectCol'
import { SeprtbyFeat } from '../DataOperate/DataProcess/SeprtbyFeat'
import { StrToNum } from '../DataOperate/DataProcess/StrToNum';
import { Nomalize } from '../DataOperate/DataProcess/Nomalize';
var current = 0;
class Run extends Component{
  state = { 
    visible: false,
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

  handleError = () =>{
    const { propsAPI } = this.props;
    console.log(propsAPI.save())
    const inf = propsAPI.save();

    var Sourc;
    var p = 0;
    var str = new Array(inf.nodes.length).fill(0);
    if(inf.hasOwnProperty('edges')){
      let Deg = new Array(inf.nodes.length).fill(0);
      let Varif = new Array(inf.nodes.length).fill(0);
      for (let indexE of inf.edges.keys()){
        Sourc = inf.edges[indexE].target;
        for (let indexN of inf.nodes.keys()){
          if (Sourc === inf.nodes[indexN].id){
            Deg[indexN]++;
            Varif[indexN] = 1;
          }
        }
        Sourc = inf.edges[indexE].source;
        for (let indexN of inf.nodes.keys())
          if (Sourc === inf.nodes[indexN].id)  Varif[indexN] = 1;
      }
      for(let count = 0; count < inf.nodes.length; count++){
        for(let i = 0; i < Deg.length; i++){
          if(Deg[i] === 0){
            str[i] = 1;
            p++;
            for(let j = 0; j < inf.edges.length; j++)
              if(inf.nodes[i].id == inf.edges[j].source)  Deg[j]--;
          }
        }
      }
      //in str >0
      if(p <= inf.nodes.length) return 2; //loop
      for(let i = 0; i < Varif.length; i++){
        if(Varif[i] === 0)  return 3; // alone      in Varif =0
      }
    }else return 1; //nothing
    return 0; 
  }

  showDetail = ()=>{
    // this.handleLegal()
    const { propsAPI } = this.props;
    console.log(propsAPI.save())
    const inf = propsAPI.save();
    // let err = this.handleError();
    // console.log(err);
    // if( err !== 0){
    //   switch(err){
    //     case 1: 
    //       message.error('there is nothing yet!');
    //       break;
    //     case 2:
    //       message.error('there is a loop!');
    //       break;
    //     case 3:
    //       message.error('there is nothing yet!');
    //       break;
    //     case 4:
    //       message.error('there is nothing yet!');
    //       break;
    //     default:
    //       break;
    //   }
    //   return 0;
    // }
    var Sourc = 0;
    var tag = 'Input';
    var stream = new Array();
    var attribute = new Array();
    var labelarray = new Array();


    if(inf.hasOwnProperty('edges')){
      let Deg = new Array(inf.nodes.length).fill(0);
      var sourceId = new Array(inf.nodes.length).fill(0);
      for(let i in sourceId) {
        sourceId[i] = new Array();
      }
      for (let indexE of inf.edges.keys()) {
        Sourc = inf.edges[indexE].target;
        let targetanchor = inf.edges[indexE].targetAnchor;
        let source = inf.edges[indexE].source;
        let sourceanchor = inf.edges[indexE].sourceAnchor;
        for (let indexN of inf.nodes.keys()) {
          if (Sourc === inf.nodes[indexN].id) {
            Deg[indexN]++;
            sourceId[indexN][targetanchor] = {
              source:source,
              sourceAnchor:sourceanchor
            };
          }
        }
      }
      console.log('sourceId');
      console.log(sourceId);
      for (var k = 0; k < inf.nodes.length; ) {
        for (let indexN of inf.nodes.keys()){
          if(Deg[indexN] === 0){
            k++;
            Deg[indexN]--;
            Sourc = inf.nodes[indexN].id;
            let etag = inf.nodes[indexN].elabel;
            tag = inf.nodes[indexN].label;
            attribute = inf.nodes[indexN].attr;
            labelarray = inf.nodes[indexN].labelArray;
            if(inf.nodes[indexN].group === 'ml'){
              const { find, update } = propsAPI;
              const item = find(Sourc);
              let temp = JSON.parse(JSON.stringify(labelarray));
              temp['public'] = [...temp.predict_x, ...temp.predict_y];
              update(item,{labelArray:temp});
            }
            let labelarr = {};
            for(let i in labelarray){
              labelarr[i] = new Array();
              for(let j in labelarray[i]){
                if(labelarray[i][j][1] === true){
                  labelarr[i].push(labelarray[i][j][0]);
                }
              }
            }
            labelarray = JSON.parse(JSON.stringify(labelarr));
            stream.push({
                        'id':Sourc,
                        "label":etag,
                        "tag":tag,
                        "attribute":attribute,
                        "labelArray":labelarray,
                        "sourceId":sourceId[indexN]
                      });
            for (var i = 0; i < inf.edges.length; i++){
              if(Sourc === inf.edges[i].source){
                for (var m = 0; m < inf.nodes.length; m++){
                  if(inf.nodes[m].id === inf.edges[i].target){
                    Deg[m]--;
                  }
                }
              }
            }
          }
        }
      }
    }
    // if(inf.hasOwnProperty('edges')){
    // for (let indexN of inf.nodes.keys()) {
    //   if ('Input' === inf.nodes[indexN].label) {
    //     Sourc = inf.nodes[indexN].id;
    //     attribute = inf.nodes[indexN].attr
    //     stream.push({"label":tag,"attribute":attribute});
    //     break;
    //   }
    // }
    // for (var k = 0; k < inf.nodes.length; k++) {
    //   for (let indexE of inf.edges.keys()) {
    //     if (Sourc === inf.edges[indexE].source) {
    //       Sourc = inf.edges[indexE].target;
    //       for (let indexN of inf.nodes.keys()) {
    //         if (Sourc === inf.nodes[indexN].id) {
    //           tag = inf.nodes[indexN].label;
    //           attribute = inf.nodes[indexN].attr
    //           stream.push({"label":tag,"attribute":attribute})
    //           break;
    //         }
    //       }
    //       break;
    //     }
    //   }
    // }
    console.log('stream:')
    console.log(stream);
    this.run(stream, propsAPI);
  }
  run = (stream, propsAPI)=>{  
    setTimeout(()=>{
      if(current !== stream.length){
        let k = current;
        const all_data = this.inputdata(stream[k], propsAPI);
        var outcome = new Array()
        if(stream[k].tag !== '本地数据')
        {
          if(stream[k].tag !== '数据随机划分'){
            if(!all_data[0].labelArray.hasOwnProperty('public')){
              message.error("have chooesed words")
              return 0;
            } 
          }
          switch (stream[k].tag) {
            case '单变量线性回归':
                outcome = OneVarLinearRegression(all_data);
                break
            case '多变量线性回归':
                outcome = MutiVarLinearRegression(all_data);
                break
            case '单变量多项式回归':
                outcome = OneVarPolynomialRegression(all_data);
                break
            case '决策树回归':
                outcome = DecisionTreeRegression(all_data);
                break
            case '随机森林回归':
                outcome = RandomForest(all_data);
                break
            case '朴素贝叶斯':
                outcome = NaiveBayes(all_data)
                break
            case '支持向量机':
                outcome = SVM(all_data)
                break
            case '数据随机划分':
                outcome = Randis(all_data)
                break
            case '特征区间化':
                outcome = SeprtbyFeat(all_data)
                break  
            case '特征分组归类':
                outcome = StrToNum(all_data)
                break
            case '特征二进制化':
                outcome = Onehot(all_data)
                break
            case '缺失值填充':
                outcome = fillNa(all_data);
                break
            case '归一化':
                outcome = Nomalize(all_data);
                break
            case '卷积神经网络':
                this.showModal()
                runMnist()
                break
            default:
              break;
          }
          console.log(outcome)
          this.outputdata(stream[k].id, outcome, propsAPI);

          const { find, update, executeCommand } = propsAPI;
          const currentitem = find(stream[k].id);
          var value = JSON.parse(JSON.stringify(currentitem.model.keyConfig));
          value.state_icon_url = 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.svg';
          executeCommand(() => {
            update(currentitem, {keyConfig:{...value}});
          });
        }
        if(k < stream.length-1 && stream[k+1].tag !== '本地数据'){
          const { find, update, executeCommand } = propsAPI;
          const nextitem = find(stream[k+1].id);
          var value = JSON.parse(JSON.stringify(nextitem.model.keyConfig));
          value.state_icon_url = 'https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg';
          executeCommand(() => {
            update(nextitem, {keyConfig:{...value}});
          });
        }
        current++;
        if(current === stream.length){
          current = 0;
          console.log("最终图信息")
          console.log(propsAPI.save())
          console.log("-------------------------------")
          //this.deletedata(propsAPI);
        }
        else this.run(stream, propsAPI);
      }
    },1000)
  }
  handleLegal = ()=> {
    const { propsAPI } = this.props;
    var isLegal = 0;
    var noneed = 1;
    const inf = propsAPI.save();

    if(inf.hasOwnProperty('edges')){
      if (inf.nodes.length > 1) {
        var Sourc;
        const lenE = inf.edges.length;
        const LenE =lenE;
        let path = new Array(inf.nodes.length).fill(0);

        for (let indexN of inf.nodes.keys()) {
          if ('Input' === inf.nodes[indexN].label) {
            Sourc = inf.nodes[indexN].id;
            path[indexN] = 1;
            noneed = 0;
            break;
          }
        }
        if(noneed === 0) {
          for (var k = 0; k < lenE; k++) {

            for (let indexE of inf.edges.keys()) {
              if (Sourc === inf.edges[indexE].source) {
                Sourc = inf.edges[indexE].target;

                for (let indexN of inf.nodes.keys()) {
                  if (inf.nodes[indexN].id === Sourc) {
                    if (path[indexN] === 0) {
                      if (k === LenE - 1 && inf.nodes[indexN].label === 'Output') {
                        isLegal = 1;
                        break;
                      } else {
                        path[indexN] = 1;
                        break;
                      }
                    } else {
                      noneed = 1;
                      break;
                    }
                  }
                }
                break;
              }
            }
            if (noneed === 1) {
              break;
            }
          }
        }
      }
    }
    if(isLegal === 1) {
      alert('legal');
    }else{
      alert('illegal');
    }

  }
  inputdata=(stream, propsAPI)=>{
    const { find } = propsAPI;
    var all_data = [];

    all_data.push({
      labelArray: stream.labelArray,
      all_attr: stream.attribute
    })
    const sourceId = stream.sourceId;
    for(let i in sourceId){
      let item = find(sourceId[i].source);
      if(item.model.anchor[1] === 1){
        all_data.push({
          Dataset: JSON.parse(JSON.stringify(item.model.Dataset)),
        })
      }
      else {
        all_data.push({
          Dataset: JSON.parse(JSON.stringify(item.model.Dataset[sourceId[i].sourceAnchor-item.model.anchor[0]])),
        })
      }
    }
    console.log('all_data:');
    console.log(all_data);
    return all_data;
  }
  outputdata=(id, outcome, propsAPI)=>{
    const { find, executeCommand, update } = propsAPI;
    const item = find(id);
    executeCommand(()=>{
      update(item, {
        ...outcome
      })
    })
  }
  deletedata=(propsAPI)=>{
    const inf = propsAPI.save().nodes;
    const { find, executeCommand, update } = propsAPI;
    for(let i in inf){
      if(inf[i].label !== 'Output' && inf[i].label !== 'Input'){
        const item = find(inf[i].id);
        const values = {Dataset:{}}
        executeCommand(()=>{
          update(item, {
            ...values
          })
        })
      }
    }
  }
  render(){
    return (
      <div>
        
        <Button onClick={()=>this.showDetail()} style={{border:0,backgroundColor:'#343941',color:"#ddd",fontSize:25}}>
            <Icon type="play-circle" style={{fontSize:25}}/>运行
        </Button>

        <Modal title="Modal Data" visible={this.state.visible}
            onOk={this.handleOk} onCancel={this.handleCancel} width={900}
          >
            <p>iter:
              <div id="iter-number"></div>
            </p>
            <p>train-loss:
              <div id="loss-train"></div>
            </p>
            <div id="linechart"></div>     
        </Modal>
      </div>
    );
  }
}

export default withPropsAPI(Run);