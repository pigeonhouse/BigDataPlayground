package com.pigeonhouse.filesystemservice.service;

import com.pigeonhouse.filesystemservice.entity.HeaderAttribute;
import com.pigeonhouse.filesystemservice.entity.LivySessionInfo;
import com.pigeonhouse.filesystemservice.entity.MetaData;
import com.pigeonhouse.filesystemservice.util.PathParser;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HdfsService {
    @Value("${defaultHdfsUri}")
    private String defaultHdfsUri;
    @Value("${defaultDirectory}")
    private String defaultDirectory;

    @Autowired
    LivyService livyService;

    private Logger logger = LoggerFactory.getLogger(HdfsService.class);

    private FileSystem getFileSystem() throws IOException {
        Configuration conf = new Configuration();
        conf.set("dfs.client.use.datanode.hostname", "true");
        conf.set("fs.defaultFS", defaultHdfsUri);
        return FileSystem.get(conf);
    }

    private String getHdfsPath(String path) {
        String hdfsPath = defaultHdfsUri + defaultDirectory;
        return hdfsPath + path;
    }

    /**
     * #name 标志该目录下存在一个叫name的文件夹
     */
    public void mkdir(String path) throws Exception {
        FileSystem fileSystem = getFileSystem();
        String dirPath = PathParser.getDirPath(path);
        String name = PathParser.getName(path);
        fileSystem.mkdirs(new Path(getHdfsPath(dirPath) + "/#" + name));
        fileSystem.mkdirs(new Path(getHdfsPath(path)));
    }

    /**
     * .common 标志该目录下存在一个叫common的文件是星标文件
     */
    public void setCommonFile(String path) throws Exception {
        FileSystem fileSystem = getFileSystem();
        String dirPath = PathParser.getDirPath(path);
        String name = PathParser.getName(path);
        fileSystem.mkdirs(new Path(getHdfsPath(dirPath) + "/." + name));
    }
    /**
     * 取消星标文件的功能函数
     */
    public void cancelCommonFile(String path) throws Exception {
        String dirPath = PathParser.getDirPath(path);
        String name = PathParser.getName(path);
        delete(dirPath + "/." + name);
    }

    /**
     *获取当前文件夹下的文件列表
     */
    public List<Map<String, Object>> listFiles(String path) throws Exception {
        List<Map<String, Object>> result = new ArrayList<>();
        FileSystem fileSystem = getFileSystem();

        String hdfsPath = getHdfsPath(path);
        System.out.println(hdfsPath);
        FileStatus[] statuses = fileSystem.listStatus(new Path(hdfsPath));
        List<String> commonFileList = new ArrayList<>();
        List<String> dirList = new ArrayList<>();

        for (FileStatus status : statuses) {
            String[] pathBuf = status.getPath().toString().split("/");
            String name = pathBuf[pathBuf.length - 1];
            if (name.startsWith(".")) {
                commonFileList.add(name.replace(".", ""));
            }
            if (name.startsWith("#")) {
                dirList.add(name.replace("#", ""));
            }
        }
        for (FileStatus status : statuses) {
            Map<String, Object> fileMap = new HashMap<>(3);
            String[] pathBuf = status.getPath().toString().split("/");
            String name = pathBuf[pathBuf.length - 1];
            if (name.startsWith(".") || name.startsWith("#") || "savedModels".equals(name)) {
                continue;
            }
            fileMap.put("fileName", name);
            fileMap.put("isDir", dirList.contains(name));
            fileMap.put("isCommonFile", commonFileList.contains(name));

            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String timeText = format.format(status.getModificationTime());
            fileMap.put("ModificationTime", timeText);
            result.add(fileMap);

        }
        return result;

    }
    /**
     *删除指定路径中的文件
     */
    public void delete(String path) throws Exception {
        FileSystem fileSystem = getFileSystem();
        fileSystem.delete(new Path(getHdfsPath(path)), true);
        Path commonFileNote = new Path(getHdfsPath(PathParser.getDirPath(path)+"/."+PathParser.getName(path)));
        Path dirNote = new Path(getHdfsPath(PathParser.getDirPath(path)+"/#"+PathParser.getName(path)));
        System.out.println(commonFileNote.toString());
        System.out.println(dirNote.toString());
        if(fileSystem.exists(commonFileNote)){
            fileSystem.delete(commonFileNote,true);
        }
        if(fileSystem.exists(dirNote)){
            fileSystem.delete(dirNote,true);
        }
    }

    /**
     *上传文件
     */
    public void upload(MultipartFile file, String path) throws IOException {
        String fileName = file.getOriginalFilename();
        FileSystem fs = getFileSystem();
        Path newPath = new Path(defaultHdfsUri + defaultDirectory + path + "/" + fileName);
        FSDataOutputStream outputStream = fs.create(newPath);
        outputStream.write(file.getBytes());
        outputStream.close();
        close(fs);
    }
    /**
     *读取经过orc压缩后的列式存储数据源头文件
     */
    public MetaData getMetaDataFromOrc(String userId, String path, LivySessionInfo livySessionInfo)  {
        String[] splits = path.split("/");
        String fileName = splits[splits.length - 1];
        String dirPath = PathParser.getDirPath(path);
        String readDataCode = "val df = spark.read.orc(\"hdfs:///bdap/students/" + userId + path + "\")\n";
        livyService.postCode(livySessionInfo, readDataCode,userId);

        String previewData = livyService.getCsv(livySessionInfo,20);

        List<HeaderAttribute> headerAttributes = livyService.getSchema(livySessionInfo);

        return new MetaData(fileName,dirPath, headerAttributes, previewData);
    }

    private void close(FileSystem fileSystem) {
        if (fileSystem != null) {
            try {
                fileSystem.close();
            } catch (IOException e) {
                logger.error(e.getMessage());
            }
        }
    }

}
