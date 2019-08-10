import React, { Component } from 'react'
import { Button, Icon, message } from 'antd'
import { withPropsAPI } from '@src';

import { OneVarLinearRegression } from '../Processor/MachineLearning/Regression/OneVarLinearRegression'
import { NaiveBayes } from '../Processor/MachineLearning/Classification/NaiveBayes'
import { MutiVarLinearRegression } from '../Processor/MachineLearning/Regression/MutiVarLinearRegression'
import { OneVarPolynomialRegression } from '../Processor/MachineLearning/Regression/OneVarPolynomialRegression'
import { DecisionTreeRegression } from '../Processor/MachineLearning/Regression/DecisionTree'
import { RandomForest } from '../Processor/MachineLearning/Regression/RandomForest'
import { SVM } from '../Processor/MachineLearning/Classification/SVM'

import { fillNa } from '../Processor/FeatureProcess/fillNa'
import { Onehot } from '../Processor/FeatureProcess/Onehot'
import { Randis } from '../Processor/FeatureProcess/Randis'
import { SeprtbyFeat } from '../Processor/FeatureProcess/SeprtbyFeat'
import { StrToNum } from '../Processor/FeatureProcess/StrToNum';
import { Nomalize } from '../Processor/FeatureProcess/Nomalize';

import { inputdata } from '../../PublicComponents/HandleStream/streamRunner'
import { outputdata } from '../../PublicComponents/HandleStream/streamRunner'
import { generateStream } from '../../PublicComponents/HandleStream/generateStream'
import { isLegal } from '../../PublicComponents/HandleStream/isLegal'

/**
 * Local版本的Run组件，点击Button后执行画布上组件对应的流程
 */

var current = 0;
class Run extends Component {
	//点击Run按钮后，执行此函数
	onClickButton = () => {
		const { propsAPI } = this.props;
		
		//制作工作流保存在stream中
		const stream = generateStream(propsAPI);

		//按照工作流进行执行
		this.run(stream);
	}

	//根据当前执行的标签框的label执行对应函数，并返回最终结果
	selectFunction = (stream, all_data) => {
		switch (stream) {
			case '单变量线性回归':
				return OneVarLinearRegression(all_data);
			case '多变量线性回归':
				return MutiVarLinearRegression(all_data);
			case '单变量多项式回归':
				return OneVarPolynomialRegression(all_data);
			case '决策树回归':
				return DecisionTreeRegression(all_data);
			case '随机森林回归':
				return RandomForest(all_data);
			case '朴素贝叶斯':
				return NaiveBayes(all_data)
			case '支持向量机':
				return SVM(all_data)
			case '数据随机划分':
				return Randis(all_data)
			case '特征区间化':
				return SeprtbyFeat(all_data)
			case '特征分组归类':
				return StrToNum(all_data)
			case 'one-hot编码':
				return Onehot(all_data)
			case '缺失值填充':
				return fillNa(all_data);
			case '归一化':
				return Nomalize(all_data);
			default:
				break;
		}
	}

	//改变对应此id标签框的运行状态标志，可改为运行完成或正在运行，取决于color
	changeStatusColor = (id, color) => {
		const { propsAPI } = this.props;
		const { find, update, executeCommand } = propsAPI;
		const nextitem = find(id);
		var value = JSON.parse(JSON.stringify(nextitem.model.keyConfig));
		value.state_icon_url = color;
		executeCommand(() => {
			update(nextitem, { keyConfig: { ...value } });
		});
	}

	//真正执行所用的函数，其中包括setTimeout，每1秒执行一个标签框
	run = (stream) => {
		const { propsAPI } = this.props;
		if (isLegal(propsAPI)) return;
		setTimeout(() => {
			if (current !== stream.length) {
				let k = current;

				//拿到当前标签框的all_data，及所有数据及属性等等
				const all_data = inputdata(stream[k], propsAPI);
				console.log(all_data)
				var outcome = new Array()
				if (stream[k].label !== '本地数据') {
					const { find } = propsAPI;
					const item = find(stream[k].id);
					const group = item.model.group;
					if (group == "feature") {
						if (stream[k].label !== '数据随机划分') {
							if (!all_data[0].labelArray.hasOwnProperty('public')) {
								message.error("还没有选择字段，请在右边参数栏点击选择字段");
								this.changeStatusColor(stream[k].id,
									'https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg');
								return;
							}
						}
					}
					else if (group == 'ml') {
						if (all_data[0].labelArray.train_x.length == 0 || all_data[0].labelArray.train_y.length == 0
							|| all_data[0].labelArray.predict_x.length == 0) {
							message.error("还没有选择完字段，请在右边参数栏点击选择字段");
							this.changeStatusColor(stream[k].id,
								'https://gw.alipayobjects.com/zos/rmsportal/czNEJAmyDpclFaSucYWB.svg');
							return 0;
						}
					}

					//得到此标签框的执行输出
					outcome = this.selectFunction(stream[k].label, all_data);

					//将输出放入对应标签框内的Dataset
					outputdata(stream[k].id, outcome, propsAPI);
					console.log('----------')
					this.changeStatusColor(stream[k].id,
						'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.svg');
				}
				if (k < stream.length - 1 && stream[k + 1].label !== '本地数据') {
					this.changeStatusColor(stream[k + 1].id,
						'https://loading.io/spinners/palette-ring/index.rotate-palette-loader.svg');
				}
				current++;
				if (current === stream.length) {
					current = 0;
					console.log("最终图信息")
					console.log(propsAPI.save())
					console.log("-------------------------------")
					message.success("成功执行完毕!")
				}
				else this.run(stream);
			}
		}, 1000)
	}
	render() {
		return (
			<Button onClick={() => this.onClickButton()} style={{ border: 0, backgroundColor: '#343941', color: "#ddd", fontSize: 25 }}>
				<Icon type="play-circle" style={{ fontSize: 25 }} />运行
        	</Button>
		);
	}
}

export default withPropsAPI(Run);