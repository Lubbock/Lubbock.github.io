---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: springboot.filter.stream
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# Springboot过滤器

#java#spring #springboot

加一个过滤器，在过滤器种取出参数做处理，比较。
> body里的数据使用流来读取，只能读取一次

1. **HttpServletRequest**输入流只能读取一次原因
当我们调用`getInputStream`方法获取输入流时，得到一个`InputStream`对象，实际类型是`ServletInputStream`,它继承于`InputStream`。
InputStream的`read`方法内部有个**position**,标志当前流被读取到的位置，每读取一次，标志就会移动一次，如果读到最后，read返回-1表示已经读取完。如果想要重新读取则需要调用`reset`方法，position就会移动到上次调用mark的位置，mark默认是0，所以就能从头再度。调用`reset`方法前提是已经重写了`reset`方法，当然能否`reset`也是有条件的，取决于`markSupported`方式是否返回true

InputStream默认不实现reset的相关方法，而ServletInputStream也没有重写reset的相关方法，这样就无法重复读取流，这就是我们从request对象中获取的输入流就只能读取一次的原因。

## 重复读取body数据方法
自定义`requestWrapper`继承了`HttpServletRequestWrapper` ，`HttpServletRequestWrapper` 是一个`ServletRequest`的包装类同时也是`ServletRequest实现类。在这个自定义的equestWrapper里，用一个String做缓存，在构造方法里先把request的body中的数据缓存起来，然后重写了getInputStream，返回这个缓存的body，而不是从流中读取。这样，在需要多次读取body的地方，只需要在过滤器中把原来的request换成这个自定义的request，然后把这个自定义的带缓存功能的request传到后续的过滤器链中。

```java

public class BodyReaderRequestWrapper extends HttpServletRequestWrapper {
    private final String body;
 
    /**
     *
     * @param request
     */
    public BodyReaderRequestWrapper(HttpServletRequest request) throws IOException{
        super(request);
        StringBuilder sb = new StringBuilder();
        InputStream ins = request.getInputStream();
        BufferedReader isr = null;
        try{
            if(ins != null){
                isr = new BufferedReader(new InputStreamReader(ins));
                char[] charBuffer = new char[128];
                int readCount = 0;
                while((readCount = isr.read(charBuffer)) != -1){
                    sb.append(charBuffer,0,readCount);
                }
            }else{
                sb.append("");
            }
        }catch (IOException e){
            throw e;
        }finally {
            if(isr != null) {
                isr.close();
            }
        }
 
        sb.toString();
        body = sb.toString();
    }
 
    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(this.getInputStream()));
    }
 
    @Override
    public ServletInputStream getInputStream() throws IOException {
        final ByteArrayInputStream byteArrayIns = new ByteArrayInputStream(body.getBytes());
        ServletInputStream servletIns = new ServletInputStream() {
            @Override
            public boolean isFinished() {
                return false;
            }
 
            @Override
            public boolean isReady() {
                return false;
            }
 
            @Override
            public void setReadListener(ReadListener readListener) {
 
            }
 
            @Override
            public int read() throws IOException {
                return byteArrayIns.read();
            }
        };
        return  servletIns;
    }
}
```

```java

@Order(999) // 序号越低，优先级越高
// 加上WebFilter即可成为过滤器
@WebFilter(filterName="myFilter", urlPatterns="/api/workorder/service/selfAppeal")
public class ExternalFilter implements Filter  {
 
    private final static Logger logger = LoggerFactory.getLogger(ExternalFilter.class);
    
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.info("filter init");
    }
 
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        ResponseObject object = new ResponseObject();
        HttpServletRequest req = (HttpServletRequest)servletRequest;
        HttpServletResponse res = (HttpServletResponse)servletResponse;
        // 一个request的包装类，初始化时缓存了body,重写了getInputStream返回缓存的body，实现重复读取body
        BodyReaderRequestWrapper requestWrapper  = new BodyReaderRequestWrapper(req);
        String requestURI = requestWrapper.getRequestURI();
        System.out.println("--------------------->过滤器：请求地址" + requestURI);
        String md5 = requestWrapper.getHeader("md5")  ;
       
        if (md5 == null || !md5.toLowerCase().equals(MD5.md5(ReqGetBody.getBody(requestWrapper)).toLowerCase())) {
            object.setStatus(501);
            object.setStatusText("数据md5校验失败");
            render(object, res);
            return;
        }
        // 这里传递下去的就是自定义的request了，所以后续的Controller才能重复读取到body里的参数
        filterChain.doFilter(requestWrapper, res);
    }
 
    @Override
    public void destroy() {
 
    }
 
    /** 
    * @Title: render 
    * @Description: 发送Response 
    * @param object
    * @param response void
    * @author MasterYi
    * @date 2020年1月15日上午10:48:45
    */ 
    private void render(ResponseObject object, HttpServletResponse response) {
        response.setContentType("application/json;charset=UTF-8");
        try {
            response.setStatus(200);
            response.getWriter().write(JSONObject.toJSON(object).toString());
        } catch (IOException e) {
            logger.error("ExternalFilter写入response异常");
        }
    }
}
```