package com.pigeonhouse.bdap.controller.filesystem;

import com.alibaba.fastjson.JSONObject;
import com.pigeonhouse.bdap.config.HdfsConfig;
import com.pigeonhouse.bdap.entity.metadata.CsvHeader;
import com.pigeonhouse.bdap.entity.metadata.FileAttribute;
import com.pigeonhouse.bdap.service.ResponseService;
import com.pigeonhouse.bdap.service.TokenService;
import com.pigeonhouse.bdap.service.filesystem.CommonFilesService;
import com.pigeonhouse.bdap.service.filesystem.FileHeaderAttriService;
import com.pigeonhouse.bdap.util.response.statusimpl.CommonFileStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;

/**
 * @Author XingTianYu
 * @date 2019/9/24 20:32
 * 常用文件操作相关API
 */
@RestController
public class CommonFilesController {
    @Autowired
    CommonFilesService commonFilesService;
    @Autowired
    FileHeaderAttriService fileHeaderAttriService;
    @Autowired
    TokenService tokenService;
    @Autowired
    ResponseService responseService;


    /**
     * 在常用数据表中插入标注为常用数据集的文件头信息，该文件已在fileheader数据库中存有文件头
     * <p>
     * <p>
     * oppositePath：文件相对路径
     *
     * @return 错误提示信息或插入成功通知
     */
    @PostMapping("/commonFiles/setNewFile")
    public Object insertNewFile(HttpServletRequest request,@RequestParam("oppositePath") String oppositePath) {
        try {
            String token = tokenService.getTokenFromRequest(request, "loginToken");
            String userId = tokenService.getValueFromToken(token, "userId").asString();
            oppositePath=oppositePath==null?"/":oppositePath.startsWith("/")?oppositePath:"/"+oppositePath;
            Boolean isExist = commonFilesService.fileExist(oppositePath, userId);
            if (isExist) {
                return responseService.response(CommonFileStatus.FILE_HAS_EXISTED, null,request);
            } else {
                HdfsConfig hdfsConfig=new HdfsConfig();
                CsvHeader csvHeader = fileHeaderAttriService.findByFilePath(hdfsConfig.getDefaultDirectory()+"/"+userId + oppositePath);
                //相对路径必须以"/"开头
                commonFilesService.setNewFile(csvHeader, userId);
                return responseService.response(CommonFileStatus.FILE_INSERT_SUCCESS, null, request);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 在常用数据表删除取消标注文件的文件头信息，该文件已在fileheader数据库中划分文件头
     * <p>
     * <p>
     * oppositePath：文件相对路径
     *
     * @return 错误提示信息或插入成功通知
     */
    @PostMapping("/commonFiles/deleteFiles")
    public Object deleteFileFromCommonFiles(HttpServletRequest request,@RequestParam("oppositePath") String oppositePath,HttpServletResponse response) {
        try {

            String token = tokenService.getTokenFromRequest(request, "loginToken");
            String userId = tokenService.getValueFromToken(token, "userId").asString();

            oppositePath=oppositePath==null?"/":oppositePath.startsWith("/")?oppositePath:"/"+oppositePath;
            Boolean isExist = commonFilesService.fileExist(oppositePath, userId);
            if (!isExist) {
                return responseService.response(CommonFileStatus.FILE_NOT_EXISTED, null, request);
            } else {
                //CsvHeader csvHeader = fileHeaderAttriService.findByFilePath(oppositePath);
                commonFilesService.deleteFile(userId, oppositePath);
                return responseService.response(CommonFileStatus.FILE_DELETE_SUCCESS, null, request);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * @return 常用数据列表JSON
     */

    @GetMapping("/commonFiles/getCommonFiles")
    public Object getCommonFiles(HttpServletRequest request) {

        String token = tokenService.getTokenFromRequest(request, "loginToken");
        String userId = tokenService.getValueFromToken(token, "userId").asString();

        try {
            ArrayList<FileAttribute> fileList = commonFilesService.getFileListById(userId);
            if (fileList != null) {
                return responseService.response(CommonFileStatus.FILE_GET_SUCCESS, JSONObject.toJSON(fileList), request);
            } else {
                return responseService.response(CommonFileStatus.USER_NOT_FOUND, null, request);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }


    /**
     * 在常用数据表中插入新用户
     *
     * @param userId   用户ID
     * @param userName 用户名称
     * @return 错误提示信息或插入成功通知
     */
//    @PostMapping("/commonFiles/setNewUser")
//    public Object insertNewUser(@RequestParam(value = "userId") String userId, @RequestParam(value = "userName") String userName) {
//        try {
//            CommonFiles commonFiles = new CommonFiles();
//            commonFiles.setUserId(userId);
//            commonFiles.setUserName(userName);
//            commonFiles.setFileList(new ArrayList<FileAttribute>());
//            if (commonFilesService.setNewUser(commonFiles)) {
//                return new Response(CommonFileStatus.USER_INSERT_SUCCESS, null);
//            } else {
//                return new Response(CommonFileStatus.USER_HAS_EXISTED, null);
//            }
//
//        } catch (Exception e) {
//            System.out.println(e);
//
//        }
//        return null;
//    }


}
