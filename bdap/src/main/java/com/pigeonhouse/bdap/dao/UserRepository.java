package com.pigeonhouse.bdap.dao;

import com.pigeonhouse.bdap.entity.prework.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;


/**
 * @Author: XueXiaoYue
 * @Date: 2019/9/7 20:32
 */

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByUserId(String studentId);

}
