import json, pprint, requests, textwrap

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
        elif self.label == 'hdfsFile':
            data = {'code': code % (self.id, self.attribute['fileName'])}
        elif self.label == 'LogisticRegression':
            data = {'code': code % (self.id, ArraytoString(self.labelArray['train_x']), ArraytoString(self.labelArray['train_y']), self.sourceID[0]['source'] + ' ' + self.sourceID[1]['source'])}
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
        elif self.label == "Lenet5_train":
            data = {'code': code % ()}
        elif self.label == "Reshape":
            data = {'code': code % (self.id, self.attribute['维度'], self.attribute['图片x像素'], self.attribute['图片y像素'], self.attribute['图片z像素'])}
        elif self.label == "Convolution":
            data = {'code': code % (self.id, self.sourceID[0]['source'], self.attribute['x'], self.attribute['y'], self.attribute['输出平面数量'] ,self.attribute['输入平面数量'], self.attribute['activation'])}
        elif self.label == "MaxPooling":
            data = {'code': code % (self.attribute['过滤器横向大小'], self.attribute['过滤器纵向大小'], self.attribute['横向步长'], self.attribute['纵向步长'])}
        elif self.label == "Linear":
            data = {'code': code % (self.attribute['输入维度'], self.attribute['输出维度'], self.attribute['activation'])}
        elif self.label == "NewNetwork":
            data = {'code': code % self.id}
        elif self.label == "InputPicture":
            data = {'code': code % (self.id, self.attribute['训练集数据'], self.attribute['训练集标签'], self.attribute['验证集数据'], self.attribute['验证集标签'])}
        elif self.label == "Train":
            data = {'code': code % (self.id)}
        elif self.label == "Evaluation":
            data = {'code': code % (self.id, self.sourceID[0]['source'])}
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
        
        headers = {'Content-Type': 'application/json'}

        session_url = 'http://10.105.222.90:8998/sessions/0'

        compute = requests.post(session_url+'/statements', data=json.dumps(data_mine), headers=headers)
      
        result_url = 'http://10.105.222.90:8998' + compute.headers['location']

        r = requests.get(result_url, headers={'Content-Type': 'application/json'})
     
        print(r.json())

        while(True):
            r = requests.get(result_url, headers={'Content-Type': 'application/json'})
            if r.json()['state'] == 'available':
                print("finish")
                break

        pprint.pprint(r.json())
