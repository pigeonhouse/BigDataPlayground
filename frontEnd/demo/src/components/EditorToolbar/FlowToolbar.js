import React from 'react';
import { Tooltip, Divider, Modal, Button, Input, Link, HashRouter, Route  } from 'antd';
import { Toolbar, Command } from '@src';
import styles from './index.less';
import iconfont from '../../theme/iconfont.less';
import {AppendingLineChart} from "../linechart/linechart.ts";
import d3 from "d3"
import {run} from "../Models/MnistTest/mnist"
import { withPropsAPI } from '@src';
import store from '../../store';
import { getStopLineAction, getShowLineAction } from '../../store/actionCreate';
import Papa from 'papaparse'
import {OneVarLinearRegression} from '../Models/OneVarLinearRegression/OneVarLinearRegression.js'
import Download from '../DataOperate/download'
import Selectword from '../DataOperate/selectword'
class FlowToolbar extends React.Component {

  state = {
    visible: false,
  }

  livyTest = () =>{
  const init={
    method: 'POST', 
    body:JSON.stringify(this.showDetail()),
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    }
    fetch(
      'http://localhost:5000/test',init
    )
      .then(res => res.json())
      .then(data => {
        console.log(data.output.data)
        this.setState({users: data})
      })
      .catch(e => console.log('错误:', e))
  }

  returnLoss = () =>{
    // const init={
    //   method: 'GET', 
    // }
    // fetch(
    //   'http://localhost:5000/returnLoss',init
    // )
    //   .then(res => res.json())
    //   .then(data => {
    //     console.log(data)
    //     this.setState({users: data})
    //   })
    //   .catch(e => console.log('错误:', e))


  }
  
  showDetail(){
    this.setState({
      visible: true,
    });
    const { propsAPI } = this.props;
    console.log(propsAPI.save())

    const inf = propsAPI.save();

    var Sourc = 0;
    var tag = 'Input';
    var stream = new Array();
    var attribute = new Array();


    if(inf.hasOwnProperty('edges')){
      let Deg = new Array(inf.nodes.length).fill(0);

      for (let indexE of inf.edges.keys()) {
        Sourc = inf.edges[indexE].target;
        for (let indexN of inf.nodes.keys()) {
          if (Sourc === inf.nodes[indexN].id) {
            Deg[indexN]++;
          }
        }
      }
      console.log(Deg);

      for (var k = 0; k < inf.nodes.length; ) {
        for (let indexN of inf.nodes.keys()){
          if(Deg[indexN] === 0){
            k++;
            Deg[indexN]--;
            Sourc = inf.nodes[indexN].id;
            tag = inf.nodes[indexN].label;
            attribute = inf.nodes[indexN].attr;
            stream.push({"label":tag,"attribute":attribute});
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
    console.log(stream);
    return stream
  }
  
 handleLegal() {
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
  stopLine = () =>{
    const action = getStopLineAction();
    store.dispatch(action);
    console.log(store.getState().running);
  }
  showLine = () =>{
    // const action = getShowLineAction();
    // store.dispatch(action);
    // console.log(store.getState().running);
    // run(100);
    OneVarLinearRegression();
    // console.log(this.state.stream)
    // var step = this.state.stream
    // console.log(step[0]["label"])
    // console.log(step[0]["attribute"])
    // for(let index = 1; index < step.length; index++){
    //   console.log(step[index]["label"])
    //   console.log(step[index]["attribute"])
    // }

  }

  setTest = (allData,fieldNameArray,vectorLength) =>{
    this.setState({
      dataSet:allData,
      labelArray:fieldNameArray,
      length:vectorLength
    })
  }

  readFile = (e)=>{
    var files = e.target.files; // FileList object
    var reader = new FileReader();
    var fieldNameArray = new Array();
    var allData = new Array();
    var vectorLength = new Array();

    reader.readAsText(files[0],'gbk');
    //console.log(e.target.files[0]);
      reader.onload = function(e) {
      
      //console.log(e.target.result);
       var results = Papa.parse(e.target.result,{header:true,dynamicTyping: true});
       fieldNameArray.push(results.meta.fields);
       vectorLength.push(results.data.length - 1)

       var n = new Array();
      //  console.log(results)
       for(let indexOfCols = 0; indexOfCols < fieldNameArray[0].length; indexOfCols++){
         var colName = fieldNameArray[0][indexOfCols];
         var colValue = new Array();
         for (let indexOfRows = 0; indexOfRows < results.data.length - 1; indexOfRows++){
            colValue.push(results.data[indexOfRows][colName])
         }
         n[colName] = colValue
       }
       allData.push(n)
       console.log(allData)
       
      }
      console.log(allData)
      this.setTest(allData,fieldNameArray,vectorLength)

  }

  makeFile = ()=>{
    var allData = this.state.dataSet[0]

    var fieldNameArray = this.state.labelArray[0]

    var vectorlength = this.state.length[0]
    
    var newData = new Array();

    for(let indexOfRows = 0;indexOfRows < vectorlength; indexOfRows++){
      var row = new Array();
      for(let indexOfCols = 0; indexOfCols < fieldNameArray.length; indexOfCols++ ){
          row.push(allData[fieldNameArray[indexOfCols]][indexOfRows])
      }
      newData.push(row);
    }
    var csv = Papa.unparse({
      "fields": fieldNameArray,
      "data": newData
    });

    console.log(csv)
    this.setState({
      finalData:csv
    })

  }


  render() {
    return (
      <div>
      <div span={4} style={{float:"left", maxHeight:5}}>
          <Input placeholder='Search' style={{maxWidth:180,marginLeft:10}}></Input>
          <Button shape="circle" style={{marginLeft:20, marginRight:20}} icon="search" />
      </div>
      <Toolbar className={styles.toolbar}>
        <Command name="undo">
          <Tooltip title="撤销" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconUndo}`} />
          </Tooltip>
        </Command>
        <Command name="redo">
          <Tooltip title="重做" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconRedo}`} />
          </Tooltip>
        </Command>
        <Divider type="vertical" />
        <Command name="copy">
          <Tooltip title="复制" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconCopyO}`} />
          </Tooltip>
        </Command>
        <Command name="paste">
          <Tooltip title="粘贴" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconPasterO}`} />
          </Tooltip>
        </Command>
        <Command name="delete">
          <Tooltip title="删除" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconDeleteO}`} />
          </Tooltip>
        </Command>
        <Divider type="vertical" />
        <Command name="zoomIn">
          <Tooltip title="放大" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconZoomInO}`} />
          </Tooltip>
        </Command>
        <Command name="zoomOut">
          <Tooltip title="缩小" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconZoomOutO}`} />
          </Tooltip>
        </Command>
        <Command name="autoZoom">
          <Tooltip title="适应画布" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconFit}`} />
          </Tooltip>
        </Command>
        <Command name="resetZoom">
          <Tooltip title="实际尺寸" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconActualSizeO}`} />
          </Tooltip>
        </Command>
        <Divider type="vertical" />
        <Command name="toBack">
          <Tooltip title="层级后置" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconToBack}`} />
          </Tooltip>
        </Command>
        <Command name="toFront">
          <Tooltip title="层级前置" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconToFront}`} />
          </Tooltip>
        </Command>
        <Divider type="vertical" />
        <Command name="multiSelect">
          <Tooltip title="多选" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconSelect}`} />
          </Tooltip>
        </Command>
        <Command name="addGroup">
          <Tooltip title="成组" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconGroup}`} />
          </Tooltip>
        </Command>
        <Command name="unGroup">
          <Tooltip title="解组" placement="bottom" overlayClassName={styles.tooltip}>
            <i className={`${iconfont.iconfont} ${iconfont.iconUngroup}`} />
          </Tooltip>
        </Command>
        
        <Button  onClick={()=>this.handleLegal()}>isLegal</Button>
        <Button  onClick={()=>this.showDetail()}>run</Button>
        <Button onClick={()=>this.livyTest()}>spark-test</Button>
        <Button onClick={()=>this.returnLoss()}>return-loss</Button>

        <Selectword></Selectword>

        <Modal title="Basic Modal" visible={this.state.visible}
          onOk={this.handleOk} onCancel={this.handleCancel}
        >
          <p>iter:
            <div id="iter-number"></div>
          </p>
          <p>train-loss:
            <div id="loss-train"></div>
          </p>
          
          <div id="linechart"></div>
          
          <div id="images">  </div>
          
          <Button type="primary" onClick={()=>this.showLine()}>start</Button>
          <span> </span>
          <Button type="primary" onClick={()=>this.stopLine()}>stop</Button>

          <input type="file" id="files" name="files[]" onChange={(e)=>this.readFile(e)} multiple />
	        <output id="list"></output>
          <Button type="primary" onClick={()=>this.makeFile()}>makeFile</Button>
          <Download 
          list = {this.state.finalData}
          filename = {'test'}
        />

        </Modal>


        {/* <Button className={styles.buttonRight1} href='#'>用户</Button>
        <Button className={styles.buttonRight2} href='#'>退出</Button> */}
        {/* <Link to='/' className={styles.buttonRight2}>退出</Link>
              <Route exact={true}path='/' component={Home}></Route> */}

      </Toolbar>
      </div>
    );
  }
}

export default withPropsAPI(FlowToolbar);
