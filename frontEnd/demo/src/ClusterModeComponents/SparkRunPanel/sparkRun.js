import { Component } from 'react';
import { withPropsAPI } from '@src';

import { generateStream } from '../../PublicComponents/HandleStream/GenerateStream'
import { isLegal } from '../../PublicComponents/HandleStream/IsLegal'

var current;
var sum;
class SparkRunning extends Component {
	//点击Run按钮后，执行此函数
	onClickButton = () => {

		if (this.props.running !== true) return;

		const { propsAPI } = this.props;

		//制作工作流保存在stream中
		const stream = generateStream(propsAPI.save());

		sum = stream.nodes.length || 0;
		current = 0;

		this.uploadFlowChart(stream);
	}

	uploadFlowChart = (stream) => {
		const init = {
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify(stream),
			headers: {
				"Content-Type": "application/json;charset=utf-8"
			},
			credentials: 'include'
		}
		fetch('https://result.eolinker.com/MSwz6fu34b763a21e1f7efa84a86a16f767a756952d0f95?uri=localhost:8888/flow/run', init)
			.then(res => {
				if (res.status === 200) {
					res.json().then(res => {
						if (res.code === 200) {
							const result = res.data;

							//按照工作流进行轮询
							this.run(result);

							this.props.stopRunning();
						}
					})
				}
			})
	}

	//改变对应此id标签框的运行状态标志，可改为运行完成或正在运行，取决于color
	changeStatusColor = (id, color) => {
		const { propsAPI } = this.props;
		const { find, update, executeCommand } = propsAPI;
		const item = find(id);
		var value = JSON.parse(JSON.stringify(item.model.keyConfig));
		value.state_icon_url = color;
		executeCommand(() => {
			update(item, { keyConfig: { ...value } });
		});
	}

	//真正执行所用的函数，其中包括setTimeout，每1秒执行一个标签框
	run = (result) => {
		if (current < sum) {
			setTimeout(() => {
				const init = {
					method: 'POST',
					mode: 'cors',
					body: JSON.stringify({ resultUrl: result[current].resultUrl }),
					headers: {
						"Content-Type": "application/json;charset=utf-8"
					},
					credentials: 'include'
				}
				fetch("https://result.eolinker.com/MSwz6fu34b763a21e1f7efa84a86a16f767a756952d0f95?uri=localhost:8888/flow/node/status", init)
					.then(res => {
						if (res.status === 200) {
							res.json().then(res => {
								if (res.code === 200) {
									if (res.data.state === "available") {
										this.changeStatusColor(result[current].id, 'https://gw.alipayobjects.com/zos/rmsportal/MXXetJAxlqrbisIuZxDO.svg');
										current++;
									}
								}
							})
						}
					})
				this.run(result);
			}, 1000)
		}
	}

	render() {
		return (
			<div>
				{this.onClickButton()}
			</div>
		);
	}
}

export default withPropsAPI(SparkRunning);