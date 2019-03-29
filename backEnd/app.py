from flask import Flask, render_template, request
from flask_cors import CORS
import json, pprint, requests, textwrap
from convertPost import convertPost
import nodeCreate

global inputData
global runningData


def ArraytoString(Array):
    String = ""

    for i in range(0, len(Array)):
        if i == len(Array) - 1:
            String = String + Array[i]
        else:
            String = String + Array[i] + " "

    return String

class nodes:

    def __init__(self, id, label, sourceID, attribute, labelArray):
        self.id = id
        self.label = label
        self.attribute = attribute
        self.sourceID = sourceID
        self.labelArray = labelArray

    def matchfunction(self, code):
        if self.label == "Fillna":
            data = {'code': code %(self.id, self.sourceID[0]['source'], ArraytoString(self.labelArray['public']), self.attribute['type'])}
        elif self.label == "MinMaxScaler":
            data = {'code': code %(self.id, self.sourceID[0]['source'], ArraytoString(self.labelArray['public']))}
        elif self.label =='localFile':
            data = {'code': code }
        elif self.label == 'hdfsFile':
            data = {'code': code % self.id}
        elif self.label == 'LogisticRegression':
            data = {'code': code % (self.id)}
        elif self.label == "TransformType":
            data = {'code': code % (self.id, ArraytoString(self.labelArray['public']), self.sourceID[0]['source'], "number")}
        elif self.label == "Stringindex":
            data = {'code': code % (self.id, ArraytoString(self.labelArray['public']), self.sourceID[0]['source'])}
        elif self.label == "SortBy":
            data = {'code': code % (self.id, self.sourceID[0]['source'], ArraytoString(self.labelArray['public']))}
        elif self.label == "StandardScaler":
            data = {'code': code % (self.id, ArraytoString(self.labelArray['public']), self.sourceID[0]['source'])}
        elif self.label == "QuantileDiscretizer":
            data = {'code': code % (self.id, ArraytoString(self.labelArray['public']), self.attribute['新生成列名'], self.sourceID[0]['source'], self.attribute['类别数'])}
        elif self.label == "OneHotEncoding":
            data = {'code': code % (self.id, ArraytoString(self.labelArray['public']), self.sourceID[0]['source'])}
        elif self.label == "LinearRegression":
            data = {'code': code % ()}
        else:
            data = None

        return data

    def excuted(self):
        fileobj = open("./Closed_/" + self.label + ".scala", "r")
        
        try:
            code = fileobj.read()
        finally:
            fileobj.close()
        
        data_mine = self.matchfunction(code)

        session_url = 'http://10.105.222.90:8998/sessions/2'
        compute = requests.post(session_url+'/statements', data=json.dumps(data_mine), headers=headers)
      
        result_url = host + compute.headers['location']

        r = requests.get(result_url, headers=headers)

        while(True):
            r = req=ests.get(result_url, headers=headers)
            if r.json()['state'] == 'available':
                print("finish")
                break

        pprint.pprint(r.json())

app = Flask(__name__)

CORS(app)

@app.route('/InputPost', methods=['GET', 'POST'])
def InputPost():
    print(request.json)
    global inputData
    inputData = request.json
    return "received"

@app.route('/RunningPost', methods=['GET', 'POST'])
def RunningPost():
    print(request.json)
    global runningData
    runningData = request.json
    return "received"



@app.route('/')
def hello_world():
    return render_template('index.html')

host = 'http://10.105.222.90:8998'
headers = {'Content-Type': 'application/json'}
global loss


def convertPost(data):
    colName = data['colName'].split(",")
    s = []
    for name in colName:
        temp = {}
        temp['label'] = name
        temp['value'] = data[name].split(",")
        s.append(temp)
    re = [s]
    re.append([colName])
    re.append(len(data[name].split(",")))
    return re

@app.route('/handleInput', methods=['GET', 'POST']) 
def handleInput():
    print(request.json)
    fileobj = open("./handleInput.scala", "r")

    try:
        code = fileobj.read()
    finally:
        fileobj.close()

    data_mine = {'code':code % request.json}

    print(data['code'])

    headers = {'Content-Type': 'application/json'}
    session_url = 'http://10.105.222.90:8998/sessions/2'
    compute = requests.post(session_url + '/statements', data=json.dumps(data_mine), headers=headers)

    result_url = 'http://10.105.222.90:8998' + compute.headers['location']

    r = requests.get(result_url, headers=headers)
    print(r.json())

    while(True):
        r = requests.get(result_url, headers=headers)
        if r.json()['state'] == 'available':
            print("finish")
            break

    pprint.pprint(r.json())

    data = convertPost(inputData)
    print(data)

    return json.dumps(data)

#处理第一次读取文件时scala传来的post请求
@app.route('/InputPost', methods=['GET', 'POST'])
def InputPost():
    print(request.json)
    global inputData
    inputData = request.json
    return "received"


#处理scala运行时的post请求
@app.route('/RunningPost', methods=['GET', 'POST'])
def RunningPost():
    print(request.json)
    global runningData
    runningData = request.json
    return "received"

##任务完成进度测试
# @app.route('/JobRequest', methods=['GET', 'POST'])
# def JobRequest():
#     global jobCompleted
#     jobCompleted += 3
#     return json.dumps(jobCompleted)


#处理前端传来的图信息并按步执行
@app.route('/run', methods=['GET', 'POST'])
def run():
    print(request.json)
    picture = request.json
    node_ = []
    for i in range(0, len(picture)):
        node = nodes(picture[i]['id'], picture[i]['label'], picture[i]['sourceId'], picture[i]['attribute'], picture[i]['labelArray'])
        node_.append(node)

    finalData = []
    for node in node_:
        print(node.label)
        node.excuted()
       
        if node.label != "hdfsFile":
            temp = [node.id, runningData]
            finalData.append(temp)

    
    print(finalData)

    return json.dumps(finalData)


    # data_mine = {'kind': 'spark'}
    # create_session = requests.post('http://10.105.222.90:8998' + '/sessions', data=json.dumps(data_mine), headers=headers)
    # session_url = 'http://10.105.222.90:8998' + create_session.headers['location']

    # while(True):
    #     r = requests.get(session_url, headers=headers)
    #     if r.json()['state'] == 'idle':
    #         print("started")
    #         break

    ## 创建session

    # requests.delete(session_url, headers=headers)
    ##关闭session 


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
