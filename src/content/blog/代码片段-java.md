---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: 代码片段-java
featured: false
draft: false
tags:
 - 代码片段
 - java
description: this is auto generate
---
# 代码片段收集

> 收集平常好用的代码片段



## Mybatis

### jpa拼接脚本

```java
	@Select("<script> " +
			" select v.* from tb_srv_inse t left join vsm_apply_detail p " +
			" on t.application_id = p.application_id left join tb_vsm_group v " +
			" on p.hsm_group_id = v.id " +
			" <where> v.id is not null " +
			" <if test='tenantId != null'>" +
			"	and t.srv_inse_tenant_id = #{tenantId}" +
			" </if>" +
			" </where> " +
			" </script> ")
```





### 动态查询

```java
    @Select("<script> select t.* from tb_srv_inse t where t.srv_inse_type != 3 and t.id " +
            "in (select s.tb_srv_inse_id from sys_user_srv_inse_role s where s.user_id=#{userId} " +
            " <if test='tbSrvInse.srvInseName !=null and tbSrvInse.srvInseName !=\"\"'> " +
            "and t.srv_inse_name like '%${tbSrvInse.srvInseName}%'" +
            "</if>" +
            ") </script>")
    IPage<TbSrvInse> queryInlineUserMMyyTbSrvInse(Page<TbSrvInse> page, @Param("userId") String userId, @Param("tbSrvInse") TbSrvInse tbSrvInse);
```



## 常用业务代码

```java
	items = JSON.parseObject(shget, new TypeReference<List<SysUserSrvInseRole>>() {
				}.getType());
```

### 区间合成

先找到区间开始的索引，在拉出区间

```java
private static String toRange(List<Integer> waitMerge) {
        List<Integer> heads = new ArrayList<>();
        for (int i = 0; i < waitMerge.size(); i++) {
            if (i == 0) {
                heads.add(0);
                continue;
            }
            int beforeNode = i - 1;
            if ((waitMerge.get(beforeNode)+1) != waitMerge.get(i)) {
                heads.add(i);
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < heads.size(); i++) {
            int nextHead = i + 1;
            if (nextHead >= heads.size()) {
                Integer i1 = heads.get(i);
                if (i1 == (waitMerge.size() - 1)) {
                    sb.append(",");
                    sb.append(waitMerge.get(i1));
                }else {
                    sb.append(",");
                    sb.append(waitMerge.get(i1));
                    sb.append("-");
                    sb.append(waitMerge.get(waitMerge.size() - 1));
                }
            }else {
                Integer nb = heads.get(nextHead);
                Integer ls = heads.get(i);
                if (ls == (nb - 1)) {
                    sb.append(",");
                    sb.append(waitMerge.get(ls));
                }else {
                    sb.append(",");
                    sb.append(waitMerge.get(ls));
                    sb.append("-");
                    sb.append(waitMerge.get(nb - 1));
                }
            }
        }
        return sb.toString();
    }

```


