package com.bigdataplayground.demo.molules.spark.controller;

import com.bigdataplayground.demo.molules.spark.domain.ApiResult;
import com.bigdataplayground.demo.molules.spark.domain.HdfsOptRequest;
import com.bigdataplayground.demo.molules.spark.domain.Node;
import com.bigdataplayground.demo.molules.spark.service.HdfsService;
import com.bigdataplayground.demo.molules.spark.service.SparkExecutor;
import com.bigdataplayground.demo.molules.spark.util.ToolSet;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.Files;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
// import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.web.bind.annotation.*;

@RestController
//@EnableRedisHttpSession
public class SparkController {
  private String appAddr = "10.122.217.207:5000"; //后端所在地址（本机地址)
  private String livyAddr = "10.105.222.90:8998"; // livy 服务器+端口
  private String hdfsAddr = "10.105.222.90:9000"; // HDFS namenode

  private ObjectMapper objectMapper = new ObjectMapper();
  private String runningData;

  @RequestMapping(path = {"/"}, method = {RequestMethod.POST, RequestMethod.GET})
  String home() {
    return "yo!";
  }

  @RequestMapping(path = {"/handleInput"}, method = {RequestMethod.POST})
  String handleInput(@RequestBody String body)
      throws IOException, URISyntaxException, InterruptedException {
    HdfsService hdfsService = new HdfsService("hdfs://" + hdfsAddr, "tseg");
    String data;
    String path = body;
    String ext = Files.getFileExtension(path);
    //获取后缀名

    ApiResult result = hdfsService.readFile("/demoData/" + body);

    if (result.getData() != null) {
      data = (String) result.getData();
    } else {
      return ApiResult.createNgMsg("File does not exist").toString();
    }
    switch (ext) {
      case "csv":
        return ToolSet.readCSVFile(data);
      default:
        return data;
    }
  }

  @RequestMapping(path = {"/RunningPost"}, method = {RequestMethod.POST})
  public String runningPost(@RequestBody String body) {
    runningData = body;
    System.out.println(body);
    return "received";
  }

  /**
   * 处理hdfs的相关操作，因为大部分操作不幂等，所以只接受POST
   * 目前的功能有：
   * String param
   * String kind 功能
   * <p>
   * tree
   * 目录/文件结构，返回一个jsonlist，json里面包含了文件/目录信息，如果是目录的话，subDirectory里面是子目录的jsonList
   * mkdir 创建目录，返回成功信息
   * rm 删除文件/目录，param = R时递归地删除目录，param 时可以删除文件和空目录 返回成功信息
   * read 读文件，返回文件内容
   * save 写文件，文件内容在content="",不加入content或content=""创建空文件，类似于touch
   * param = O (Big O) 时支持覆盖，否则不支持。 返回成功信息
   * <p>
   * upload 从本地上传文件 例如从 src/main/scala/handleFile.scala 上传至 ./test/1.scala
   * <p>
   * String user 用户名
   * 确定了权限和./的位置（对了，多用户存储的时候需要传入读写权限，现在先不考虑这个。。) String path
   * 目录或文件路径 String localPath 上传文件的本地路径 示例：        localPath       path /src.txt
   * ./dst.txt       （无同名文件） ——>./dst.txt       上传并重命名 /src.txt    ./dst.txt
   * （有同名文件） ——> 上传失败 /src.txt    ./              （目录存在）   ——>  ./src.txt
   * 上传至目录（同名文件) /src.txt    ./directory/dst.txt     （目录不存在）  ——>
   * ./directory/dst.txt   新建目录、上传并重命名 /src.txt    ./directory     （目录不存在）  ——>
   * ./directory   误上传（新文件无后缀名）** 也就是 目标路径path
   * 可以指向一个未创建的文件名或者是已创建的目录，如果中途遇到未创建的目录则会依次创建。
   * 不过真正用的时候都是要先选择路径再传文件，一般只会发生上面第三种情况。
   * <p>
   * <p>
   * 文件名中不能含有 反斜杠(\)、引号("")、花括号({})
   *
   * @return ApiResult
   * @throws URISyntaxException
   * @throws IOException
   * @throws InterruptedException
   */
  @PostMapping(path = "/hdfs", headers = "Content-Type=application/json")
  public ApiResult hdfs(@RequestBody HdfsOptRequest hdfsOptRequest)
      throws URISyntaxException, IOException, InterruptedException {
    if (hdfsOptRequest.getPath().isEmpty() || hdfsOptRequest.getPath() == null) {
      return ApiResult.createNgMsg("path = null or empty!");
    }
    if (hdfsOptRequest.getUser().isEmpty() || hdfsOptRequest.getUser() == null) {
      return ApiResult.createNgMsg("user = null or empty!");
    }
    if (hdfsOptRequest.getKind().isEmpty() || hdfsOptRequest.getKind() == null) {
      return ApiResult.createNgMsg("kind = null or empty!");
    }

    HdfsService hdfsService = new HdfsService("hdfs://" + hdfsAddr, hdfsOptRequest.getUser());
    switch (hdfsOptRequest.getKind()) {
      case "tree": {
        return hdfsService.tree(hdfsOptRequest.getPath());
      }
      case "mkdir":
        return hdfsService.makeDirectory(hdfsOptRequest.getPath());
      case "rm":
        // R:递归地删除文件夹，高危操作，要让用户确定一下。为避免误操作，删除文件时不能加参数。
        if (hdfsOptRequest.getParam().equals("R")) {
          return hdfsService.removeR(hdfsOptRequest.getPath());
        } else {
          return hdfsService.remove(hdfsOptRequest.getPath());
        }
      case "read":
        return hdfsService.readFile(hdfsOptRequest.getPath());
      case "save":
        if (hdfsOptRequest.getContent() == null)
          hdfsOptRequest.setContent("");
        boolean override =
            (hdfsOptRequest.getPath() != null && hdfsOptRequest.getParam().equals("O"));
        return hdfsService.saveFile(
            hdfsOptRequest.getPath(), hdfsOptRequest.getContent(), override);
      case "upload":
        return hdfsService.uploadFromLocal(hdfsOptRequest.getLocalPath(), hdfsOptRequest.getPath());
      default:
        return ApiResult.createNgMsg("Error Kind");
    }
  }

  @RequestMapping(path = {"/run"}, method = {RequestMethod.POST, RequestMethod.GET})
  public String run(@RequestBody String body, HttpServletRequest request) throws IOException {
    System.out.println("isRequestedSessionIdFromCookie" + request.isRequestedSessionIdFromCookie());

    String preBody;
    List<Node> preNodeList = null;
    SparkExecutor sparkExecutor = new SparkExecutor(livyAddr, appAddr);

    preBody = (String) request.getSession().getAttribute("node");
    if (preBody != null)
      preNodeList = objectMapper.readValue(preBody, new TypeReference<List<Node>>() {});

    List<Node> nodeList = objectMapper.readValue(body, new TypeReference<List<Node>>() {});
    // 覆盖session
    request.getSession(true).setAttribute("node", body);

    System.out.println(
        request.getSession().getId() + "body " + request.getSession(true).getAttribute("node"));

    System.out.println("preBody " + preBody);
    System.out.println("body " + body);

    List<List<Object>> finalData = new ArrayList<>();
    int i = 0;
    for (; i < nodeList.size() && preNodeList != null && i < preNodeList.size()
         && nodeList.get(i).equals(preNodeList.get(i));
         i++) {
      System.out.println("skip " + nodeList.get(i).getLabel());
    }

    for (int j = i; j < nodeList.size(); j++) {
      Node node = nodeList.get(j);
      System.out.println(node.getLabel() + " is running");

      sparkExecutor.executeNode(node);

      if (!node.getLabel().equals("hdfsFile")) {
        List<Object> tmp = new ArrayList<>();
        //不加双引号会识别不了
        tmp.add("\"" + node.getId() + "\"");
        tmp.add(runningData);

        System.out.println("#Result of " + node.getLabel() + "#");
        System.out.println(tmp);
        finalData.add(tmp);
      }
    }

    System.out.println("#finalData sent to front#");
    System.out.println(finalData.toString());

    return finalData.toString();
  }
}
