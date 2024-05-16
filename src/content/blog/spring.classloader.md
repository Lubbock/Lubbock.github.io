---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: spring.classloader
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
#classloader #spring
# Spring classloader
java外置驱动包，代码里加载驱动后，发现spring的compoent，DriverManager获取不到外置依赖包的jar。
java加载外置驱动包方案:
```java
@Slf4j
public class DynaJarFilePathConfig {

    private static String TOMCAT = "tomcat";
    private static String TONG_WEB = "tongweb";
    private static String WEB_TYPE = "webType";

    static Map<String, String> EXTERNLIB_PATH = new HashMap();

    static {
        EXTERNLIB_PATH.put(TOMCAT, "/data/kcsp/libs/tomcat/");
        EXTERNLIB_PATH.put(TONG_WEB, "/data/kcsp/libs/tongweb/");
        EXTERNLIB_PATH.put("jetty", "/data/kcsp/libs/jetty/");
    }

    public static void loadDriver() throws Exception {
//        System.setProperty(WEB_TYPE, TOMCAT);
//        String webType = System.getProperty(WEB_TYPE);
        String externLib = "/data/kcsp/libs/drivers";
//        String externLib = EXTERNLIB_PATH.getOrDefault(TOMCAT, EXTERNLIB_PATH.get(TOMCAT));

        File file = new File(externLib);
//        if (!file.exists()) {
//            log.error("系统所需依赖外置jar包文件不存在！");
//            throw new KcspException("系统所需依赖外置jar包文件不存在！");
//        }
        URL[] uris = FileUtils.listFiles(file, new String[]{"jar"}, true)
                .stream()
                .map(it -> {
                    try {
                        System.out.println(it.toURI().toURL().toString());
                        return it.toURI().toURL();
                    } catch (MalformedURLException e) {
                        return null;
                    }
                }).filter(Objects::nonNull).toArray(URL[]::new);

        ClassLoader contextClassLoader = Thread.currentThread().getContextClassLoader();
        URLClassLoader urlLoader = new URLClassLoader(uris, contextClassLoader);
        Thread.currentThread().setContextClassLoader(urlLoader);
    }
}
```
spring内置容器获取外置jar包方案,
```java
 URLClassLoader classLoader = (URLClassLoader)this.getClass().getClassLoader();

        File file = new File("/data/kcsp/libs/drivers");
        URL[] uris = FileUtils.listFiles(file, new String[]{"jar"}, true)
                .stream()
                .map(it -> {
                    try {
                        System.out.println(it.toURI().toURL().toString());
                        return it.toURI().toURL();
                    } catch (MalformedURLException e) {
                        return null;
                    }
                }).filter(Objects::nonNull).toArray(URL[]::new);

        Method add = null;
        try {
            add = URLClassLoader.class.getDeclaredMethod("addURL", new Class[] { URL.class });
            add.setAccessible(true);
            for (URL temp : uris) {
                add.invoke(classLoader, temp);
            }
        } catch (Exception e) {
            log.error("", e);
        }
```

# ClassLoader
