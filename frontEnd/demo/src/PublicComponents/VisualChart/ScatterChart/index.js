export function createScatterChart(myChart, props) {
    const { dataSet, chartStyle, loading, titleText } = props;
    const { xLabel, yLabel, color } = chartStyle;
    if (loading === true) {
        myChart.showLoading();
        return;
    } else {
        myChart.hideLoading();
    }

    if (xLabel === undefined || yLabel === undefined) return;
    var option = {
        title: {
            text: titleText,
            x: 'center'
        },
        xAxis: {
            name: xLabel
        },
        yAxis: {
            name: yLabel
        },
        series: [{
            symbolSize: 20,
            data: fetData(xLabel, yLabel, dataSet),
            type: 'scatter'
        }],
        color
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

function fetData(xLabel, yLabel, dataSet) {
    let value = new Array();

    dataSet.map((data) => {
        value.push([
            data[xLabel],
            data[yLabel]
        ])
    })
    return value;
}
