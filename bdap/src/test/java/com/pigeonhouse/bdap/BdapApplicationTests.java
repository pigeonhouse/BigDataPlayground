package com.pigeonhouse.bdap;

import com.pigeonhouse.bdap.controller.filesystem.FileHeaderAttriController;
import com.pigeonhouse.bdap.controller.filesystem.SparkCodeController;
import com.pigeonhouse.bdap.controller.runcode.PostCode;
import com.pigeonhouse.bdap.dao.FileHeaderAttriDao;
import com.pigeonhouse.bdap.dao.LivyDao;
import com.pigeonhouse.bdap.dao.SparkCodeDao;
import com.pigeonhouse.bdap.dao.UserDao;
import com.pigeonhouse.bdap.entity.execution.LivySessionInfo;
import com.pigeonhouse.bdap.entity.execution.NodeInfo;

import com.pigeonhouse.bdap.entity.execution.ValueAttributes;
import com.pigeonhouse.bdap.service.filesystem.FileHeaderAttriService;
import com.pigeonhouse.bdap.service.runcode.SparkExecution;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

@RunWith(SpringRunner.class)
@SpringBootTest
public class BdapApplicationTests {

    @Autowired
    UserDao userDao;

    @Autowired
    SparkCodeDao sparkCodeDao;

    @Autowired
    LivyDao livyDao;

    @Autowired
    SparkCodeController sparkCodeController;

    @Autowired
    FileHeaderAttriDao fileHeaderAttriDao;

    @Autowired
    FileHeaderAttriService fileHeaderAttriService;

    @Autowired
    FileHeaderAttriController fileHeaderAttriController;

    @Autowired
    SparkExecution sparkExecution;

    @Autowired
    PostCode postCode;

    @Test
    public void test() throws Exception{

        ArrayList<Integer> anchor_01 = new ArrayList<>(Arrays.asList(0,1));
        ArrayList<ValueAttributes> attrs_01 = new ArrayList<>();
        attrs_01.add(new ValueAttributes("file","String","hdfs:///bdap/demoData/simpleTest.csv"));
        NodeInfo nodeInfo_01 = new NodeInfo("abc","LoadData",null,anchor_01,attrs_01,false);

        ArrayList<Integer> anchor_02 = new ArrayList<>(Arrays.asList(1,1));
        ArrayList<ValueAttributes> attrs_02 = new ArrayList<>();
        attrs_02.add(new ValueAttributes("targetCols","Array[String]",new ArrayList<>(Arrays.asList("age"))));
        attrs_02.add(new ValueAttributes("normalizationType","String","MinMax"));
        NodeInfo nodeInfo_02 = new NodeInfo("def","Normalization",new ArrayList<>(Arrays.asList("abc")),anchor_02,attrs_02,true);

        ArrayList<NodeInfo> flowInfo = new ArrayList<>();
        flowInfo.add(nodeInfo_01);
        flowInfo.add(nodeInfo_02);

        //LivySessionInfo livySessionInfo = new LivySessionInfo();

        LivySessionInfo livySessionInfo = livyDao.createSession("10.105.222.90:8998");
        while(!"idle".equals(livyDao.refreshSessionStatus(livySessionInfo).getState())){
            Thread.sleep(1000);
            System.out.println("starting a new session.......");
        }

        sparkExecution.executeFlow(flowInfo,livySessionInfo);

    }


//    @Test
//    public void test01() {
//
//        sparkCodeDao.addSparkCode("PD001", "static/Prediction", "预测", "Predict", "import org.apache.spark.ml.classification.LogisticRegression\n" +
//                "import org.apache.spark.ml.feature.VectorAssembler\n" +
//                "\n" +
//                "val userId = \"%s\"\n" +
//                "val id = \"%s\"\n" +
//                "val trainCol = \"%s\"\n" +
//                "val label = \"%s\"\n" +
//                "val newColName = \"%s\"\n" +
//                "var df_ = df_%s\n" +
//                "\n" +
//                "val all = trainCol + \" \" + label\n" +
//                "val aimarray = all.split(\" \")\n" +
//                "val trainArray = trainCol.split(\" \")\n" +
//                "\n" +
//                "df_ = df_.select(aimarray.map(A => col(A)): _*)\n" +
//                "\n" +
//                "val assembler = new VectorAssembler().setInputCols(trainArray).setOutputCol(\"features_lr\")\n" +
//                "df_ = assembler.transform(df_)\n" +
//                "\n" +
//                "val predictions = Model_%s.transform(df_)\n" +
//                "val predict_result = predictions.selectExpr(\"features_lr\", label, s\"round(prediction,1) as ${newColName}\")\n" +
//                "\n" +
//                "df_ = predict_result\n" +
//                "\n" +
//                "val df_%s = predict_result\n" +
//                "\n" +
//                "df_.write.format(\"parquet\").mode(SaveMode.Overwrite).save(userId + \"/\" + id)\n" +
//                "\n" +
//                "val fin = df_.limit(100).toJSON.collectAsList.toString\n" +
//                "\n" +
//                "val colname = df_.columns\n" +
//                "val fin_ = fin.substring(1, fin.length - 1)\n" +
//                "val start = \"\"\"{\"colName\":\"\"\"\"\n" +
//                "val end = \"\\\"\"\n" +
//                "var json = colname.mkString(start,\", \",end) + \"}, \"\n" +
//                "\n" +
//                "json = \"[\" + json ++ fin_ + \"]\"\n" +
//                "\n" +
//                "val result = Http(\"%s\").postData(fin.toString).header(\"Content-Type\", \"application/json\").header(\"Charset\", \"UTF-8\").option(HttpOptions.readTimeout(10000)).asString", "two-one");
//
//        sparkCodeDao.addInputAttribute("PD001", "新列名", "newColName", "字母");
//
//    }
//
//    @Test
//    public void test02() throws IOException {
//
//        HashMap<String, String> map = new HashMap<>();
//        map.put("userId", "2017211524");
//        map.put("moduleId", "123456");
//        map.put("targetCol", "age");
//        map.put("type", "average");
//        map.put("filePath", "/test");
//
//        String s = joinCodeService.transParam("OF001", map);
//        System.out.println(s);
//    }
//
//    @Test
//    public void test03(){
//
//        ArrayList<NodeInfo> list = new ArrayList<>();
//        HashMap<String, String> map = new HashMap<>();
//        map.put("filePath", "hdfs://10.105.222.90:8020/ xty/adult.csv");
//        map.put("userId", "qj");
//        map.put("moduleId", "123456");
//        list.add(new NodeInfo(1, "OF001", "", map, true));
//
//        HashMap<String, String> map1 = new HashMap<>();
//        map1.put("userId", "qj");
//        map1.put("moduleId", "234567");
//        map1.put("previousId", "123456");
//        map1.put("targetCol", "age");
//        map1.put("type", "average");
//        list.add(new NodeInfo(2, "PP005", "", map1, true));
//
//        HashMap<String, String> map2 = new HashMap<>();
//        map2.put("userId", "qj");
//        map2.put("moduleId", "345678");
//        map2.put("previousId", "234567");
//        map2.put("targetCol", "age");
//        map2.put("normalAlgorithm", "Normal");
//        list.add(new NodeInfo(3, "PP003", "", map2, true));
////        postCode.postcode(list, request);
//
//    }
}
