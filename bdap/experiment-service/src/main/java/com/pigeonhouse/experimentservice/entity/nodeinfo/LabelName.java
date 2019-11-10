package com.pigeonhouse.experimentservice.entity.nodeinfo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class LabelName {

    /**
     * 中文标签（页面上显示的）
     */
    private String label;

    /**
     * 英文标签（代码中的）
     */
    private String elabel;

    public LabelName(String elabel) {
        this.elabel = elabel;
    }
}
