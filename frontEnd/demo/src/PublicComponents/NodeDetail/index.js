import React from 'react';
import { Card, Form, Input } from 'antd';
import { withPropsAPI } from '@src';

import Attributes from './Attributes';
import SelectWord from './SelectWord';
import GetInputOutput from './GetInputOutput';
import NewCols from './NewCols';
import { JoinColumns, NewGeneratedColumn } from './DataProcessing';
import GenerateColumn from'../GenerateColumn';
import styles from './index.less';

/**
 * 右侧属性细节组件
 * 包括选择字段，参数输入，输入文件，预处理参数选择
 */

const { Item } = Form;
const inlineFormItemLayout = {
	labelCol: {
		sm: { span: 11 },
	},
	wrapperCol: {
		sm: { span: 13 },
	},
};

class NodeDetail extends React.Component {
	render() {
		const { form, propsAPI } = this.props;
		const { getFieldDecorator } = form;
		const { getSelected } = propsAPI;
		const item = getSelected()[0];

		if (!item) {
			return null;
		}
		const { labelName, groupName, attributes, newCols } = item.getModel();
		const { label } = labelName;
		const { group } = groupName.label;

		return (
			<Card
				type="inner"
				title="参数"
				bordered={false}
				style={{ paddingRight: 0 }}
				className={styles.scrollapp}
			>
				<Form>
					{/**显示label：{label}*/}
					<Item style={{ margin: 0 }} label="label" {...inlineFormItemLayout}>
						{
							getFieldDecorator('label', {
								initialValue: label,
							})(<Input disabled />)
						}
					</Item>

					{/* 显示attributes，即属性的细节，取决于标签框中的attributes属性*/}
					<Attributes attributes={attributes} />

					{/* 选择字段后后面的列可接收到新的列名 */}
					<NewCols newCols={newCols} />

					{/* 选择字段 */}
					<SelectWord item={item} attributes={attributes} />

					{/* 检测是否为输入输出Item，若是则进行相关处理 */}
					<GetInputOutput label={label} group={group} />

				     
				</Form>
			</Card>
		);
	}
}

export default Form.create()(withPropsAPI(NodeDetail));
