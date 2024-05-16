---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: spring
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
Q: spring request读取一次后无法读取
在filter中，使用ContentCacheingRequestWrapper 包装下request，当流读取完会被缓存。
```java
@Component
public class RequestWrapperFilter extends OncePreRequestFilter{
    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest,HttpServerResponse response,FilterChain filterChain) throws ServletException{
        filterChain.doFilter(new ContentCacheingRequestWrapper(httpServletRequest),response)
    }
}
```