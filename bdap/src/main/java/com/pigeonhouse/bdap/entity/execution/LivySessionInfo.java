package com.pigeonhouse.bdap.entity.execution;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LivySessionInfo implements Serializable {

    private String livyAddr;
    private int id;
    private String state;

}
