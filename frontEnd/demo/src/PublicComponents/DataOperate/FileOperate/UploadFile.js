import React, { Component } from 'react';
import { Icon, Button } from 'antd'
import Papa from 'papaparse'
import { withPropsAPI } from '@src';

/**
 * 任意csv文件上传至Input组件中
 */

class UploadFile extends Component {

	readFile = (e) => {
		var files = e.target.files;
		var reader = new FileReader();
		const { propsAPI } = this.props;
		const { getSelected, update } = propsAPI;

		//从句柄读入数据
		reader.readAsText(files[0], 'gbk');
		reader.onload = function (e) {
			var fieldNameArray = [];
			let vectorLength;
			var results = Papa.parse(e.target.result, { header: true, dynamicTyping: true });

			fieldNameArray.push(results.meta.fields);
			vectorLength = results.data.length - 1
			var n = new Array();

			//进行规格化 为对象内 label为特征名，value为整个特征的值，类型为数组
			for (let indexOfCols = 0; indexOfCols < fieldNameArray[0].length; indexOfCols++) {
				var colName = fieldNameArray[0][indexOfCols];
				var colValue = new Array();
				for (let indexOfRows = 0; indexOfRows < results.data.length - 1; indexOfRows++) {
					colValue.push(results.data[indexOfRows][colName])
				}
				n.push({ label: colName, value: colValue })
			}

			let m = fieldNameArray[0].map((item) => {
				return [item, false];
			})
			var values = {
				Dataset: b,
				labelArray: m,
				length: vectorLength
			}
			values['keyConfig'] = JSON.parse(JSON.stringify(item.model.keyConfig));
			values.keyConfig.state_icon_url = 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.svg';
			
			const item = getSelected()[0];
			update(item, { ...values });

			console.log(propsAPI.save())
		}
	}

	render() {
		return (
			<Button href="javascript:void(0)"
				style={{
					textAlign: 'center',
					position: 'relative',
					cursor: 'pointer',
					borderRadius: '4px',
					overflow: 'hidden',
					display: 'inline-block',
					'*display': 'inline',
					'*zoom': 1,
				}}
			>
				<input
					type="file"
					style={{
						position: 'absolute',
						right: 0,
						top: 0,
						opacity: 0,
						filter: 'alpha(opacity=0)',
						cursor: 'pointer',
					}}
					onChange={(e) => this.readFile(e)}
				></input>
				<Icon style={{ cursor: 'pointer' }} type="upload" /> 上传本地文件
            </Button>
		);
	}
}

export default withPropsAPI(UploadFile);
