package com.pigeonhouse.bdap.controller;

import com.alibaba.fastjson.JSONObject;
import com.pigeonhouse.bdap.dao.CommonFilesDao;
import com.pigeonhouse.bdap.dao.LivyDao;
import com.pigeonhouse.bdap.dao.ModuleDao;
import com.pigeonhouse.bdap.dao.UserDao;
import com.pigeonhouse.bdap.entity.execution.LivySessionInfo;
import com.pigeonhouse.bdap.entity.mapinfo.nodeinfo.NodeInfo;
import com.pigeonhouse.bdap.entity.metadata.FileAttribute;
import com.pigeonhouse.bdap.entity.metadata.User;
import com.pigeonhouse.bdap.service.TokenService;
import com.pigeonhouse.bdap.util.response.Response;
import com.pigeonhouse.bdap.util.response.statusimpl.CodeStatus;
import com.pigeonhouse.bdap.util.response.statusimpl.LoginStatus;
import com.pigeonhouse.bdap.util.token.PassToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

/**
 * @Author: XueXiaoYue
 * @Date: 2019/9/7 20:38
 */
@RestController
public class UserController {
    @Autowired
    UserDao userDao;
    @Autowired
    TokenService tokenService;
    @Autowired
    LivyDao livyDao;
    @Autowired
    ModuleDao moduleDao;
    @Autowired
    CommonFilesDao commonFilesDao;


    @PassToken
    @PostMapping("/login")
    public Object login(@RequestBody() User user, HttpServletResponse response) {

        User userForBase = userDao.findByUserId(user.getUserId());
        if (userForBase == null) {
            //不存在这个用户
            return new Response(LoginStatus.NO_SUCH_USER, null);
        } else {
            if (!userForBase.getPassword().equals(user.getPassword())) {
                //密码错误
                return new Response(LoginStatus.WRONG_PASSWORD, null);
            } else {
                String livyAddr = livyDao.selectLivyServer();
                LivySessionInfo livySessionInfo = livyDao.createSession(livyAddr);
                Integer sessionId = livySessionInfo.getId();
                String token = tokenService.getLoginToken(user.getUserId(), livyAddr, sessionId);
                //成功，获取token并将其置于cookie中返回前端
                Cookie cookie = new Cookie("loginToken", token);
                response.addCookie(cookie);

                JSONObject sessionInfo = new JSONObject();
                sessionInfo.put("livyAddr", livyAddr);
                sessionInfo.put("sessionId", sessionId);

                JSONObject returnJson = new JSONObject();
                returnJson.put("userInfo", userForBase);
                returnJson.put("sessionInfo", sessionInfo);


                return new Response(LoginStatus.SUCCESS, returnJson);
            }
        }
    }

    /**
     * 获取该用户所有可拖拽模块信息
     * @param request
     * @return
     */
    @GetMapping("/module")
    public Response moduleInfo(HttpServletRequest request) {
        String token = tokenService.getTokenFromRequest(request, "loginToken");
        String userId = tokenService.getValueFromToken(token, "userId").asString();
        ArrayList<FileAttribute> fileList = commonFilesDao.findByUserId(userId);
        List<NodeInfo> moduleList = moduleDao.findAll();

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("files",fileList);
        jsonObject.put("nodes",moduleList);

        return new Response(CodeStatus.CODE_PUT_SUCCESS, jsonObject);
    }


}
