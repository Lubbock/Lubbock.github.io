---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: springboot.transactional
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
# 事务管理

#java #spring #springboot 

**springboot事务**，在开发企业应用，业务人员一个操作是祭祀数据读写的多部操作的结合。由于数据操作在顺序执行过程中，任何一步操作都有可能发生异常，由于业务逻辑并未正确的完成，之前成功操作数据的并不可靠，需要在这种情况下进行回退。
事务的作用就是为了保证用户的每一个操作都是可靠的，事务中的每一步操作都必须成功执行，只要有发生异常就回退到事务开始未进行操作的状态。

## 入门

**springboot**，当我们使用`spring-boot-starter-jdbc`或`spring-boot-starter-data-jpa`依赖的时候，框架自动默认分别注入`DataSourceTransactionManager`或`JpaTransactionManager`。所以我们不需要任何额外配置就可以用`@Transactional`注解进行事务的使用。
### springboot事务的使用
**spring boot**使用事务非常简单，首先使用注解`@EnableTransactionManagement`开始事务支持后，然后在访问数据库的Service方法上添加注解`@Transactional`。
关于事务管理器，不管是`jpa`还是`jdbc`都实现自接口`platformTransactionManager`，如果添加的是`spring-boot-starter-jdbc`依赖，框架会默认注入**DataSourceTransactionManager**实例。如果添加的是**spring-boot-starter-data-jpa**依赖，框架会默认注入**JpaTransactionManager**实例。

```java
@EnableTransactionManagement // 启注解事务管理，等同于xml配置方式的 <tx:annotation-driven />
@SpringBootApplication
public class ProfiledemoApplication {

    @Bean
    public Object testBean(PlatformTransactionManager platformTransactionManager){
        System.out.println(">>>>>>>>>>" + platformTransactionManager.getClass().getName());
        return new Object();
    }

    public static void main(String[] args) {
        SpringApplication.run(ProfiledemoApplication.class, args);
    }
}
```
人为指定事务管理器。
```java
@EnableTransactionManagement
@SpringBootApplication
public class ProfiledemoApplication {

    // 其中 dataSource 框架会自动为我们注入
    @Bean
    public PlatformTransactionManager txManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    @Bean
    public Object testBean(PlatformTransactionManager platformTransactionManager) {
        System.out.println(">>>>>>>>>>" + platformTransactionManager.getClass().getName());
        return new Object();
    }

    public static void main(String[] args) {
        SpringApplication.run(ProfiledemoApplication.class, args);
    }
}
```
多个事务管理器，如何处理

```java
@EnableTransactionManagement // 开启注解事务管理，等同于xml配置文件中的 <tx:annotation-driven />
@SpringBootApplication
public class ProfiledemoApplication implements TransactionManagementConfigurer {

    @Resource(name="txManager2")
    private PlatformTransactionManager txManager2;

    // 创建事务管理器1
    @Bean(name = "txManager1")
    public PlatformTransactionManager txManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    // 创建事务管理器2
    @Bean(name = "txManager2")
    public PlatformTransactionManager txManager2(EntityManagerFactory factory) {
        return new JpaTransactionManager(factory);
    }

    // 实现接口 TransactionManagementConfigurer 方法，其返回值代表在拥有多个事务管理器的情况下默认使用的事务管理器
    @Override
    public PlatformTransactionManager annotationDrivenTransactionManager() {
        return txManager2;
    }

    public static void main(String[] args) {
        SpringApplication.run(ProfiledemoApplication.class, args);
    }

}
```
```java

@Component
public class DevSendMessage implements SendMessage {

    // 使用value具体指定使用哪个事务管理器
    @Transactional(value="txManager1")
    @Override
    public void send() {
        System.out.println(">>>>>>>>Dev Send()<<<<<<<<");
        send2();
    }

    // 在存在多个事务管理器的情况下，如果使用value具体指定
    // 则默认使用方法 annotationDrivenTransactionManager() 返回的事务管理器
    @Transactional
    public void send2() {
        System.out.println(">>>>>>>>Dev Send2()<<<<<<<<");
    }

}
```
如果spring容器内存在多个**PlatformTransactionManager**同时没有实现接口**TransactionManagementConfigurer**指定默认值，在使用注解`@Transactional`需要用value指定，否则会抛出异常。

## 事务详解
当项目存在多个数据源登，这时候需要在声明事务时指定不同的书屋管理器，在声明事务时，只需要通过value属性指定配置的事务管理器名即可。
除了指定不同的事务管理器之后，还能对事务进行隔离级别和传播行为的控制，下面给出详细解释。

### 隔离级别
隔离级别指若干个并发的事务之间的隔离程度。参照`Isolation`枚举定义了五个隔离级别的值

- DEFAULT : 默认值，表示使用底层数据库的默认隔离级别，对大部分数据库而言，通常就是 `READ_COMMITED`
- READ_UNCOMMITTED ：该隔离级别表示一个事务可以读取另一个事务修改但还没有提交的数据。该级别不能防止脏读和不可重复读，因此很少使用该隔离级别。
- READ_COMMITTED ：该隔离级别表示一个事务只能读取另一个事务已经提交的数据。该级别可以防止脏读，这也是大多数情况下的推荐值。
- REPEATABLE_READ ：该隔离级别表示一个事务在整个过程中可以多次重复执行某个查询，并且每次返回的记录都相同。即使在多次查询之间有新增的数据满足该查询，这些新增的记录也会被忽略。该级别可以防止脏读和不可重复读。
- SERIALIZABLE ：所有的事务依次逐个执行，这样事务之间就完全不可能产生干扰，也就是说，该级别可以防止脏读、不可重复读以及幻读。但是这将严重影响程序的性能。通常情况下也不会用到该级别。

指定方法： 通过使用`isolation`属性设置，如：
```java
@Transactional(isolation = Isolation.DEFAULT)
```
### 传播行为
事务的传播行为是，如果在开始当前事务之前，一个事务上下文已经存在，此时有若干个选项可以指定一个事务性方法的执行行为。参照`Propagation`

```java
public enum Propagation {  
    REQUIRED(0),
    SUPPORTS(1),
    MANDATORY(2),
    REQUIRES_NEW(3),
    NOT_SUPPORTED(4),
    NEVER(5),
    NESTED(6);
}

```
- REQUIRED ：如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。
- SUPPORTS ：如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。
- MANDATORY ：如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。
- REQUIRES_NEW ：创建一个新的事务，如果当前存在事务，则把当前事务挂起。
- NOT_SUPPORTED ：以非事务方式运行，如果当前存在事务，则把当前事务挂起。
- NEVER ：以非事务方式运行，如果当前存在事务，则抛出异常。
- NESTED ：如果当前存在事务，则创建一个事务作为当前事务的嵌套事务来运行；如果当前没有事务，则该取值等价于 REQUIRED 。

## 编程式事务
一般情况声明式事务已经够用，有些场景下，需要获取事务的状态，是执行成功了还是失败回滚，这时候需要编程时事务。在**springboot**可以使用两种编程式事务。

### TransactionManager

```java
TransactionStatus status=transactionMnaager.getTransaction(new DefaultTransactionDefinition());
try{
    Person person=Person.newPerson()
    save(person)
    transactionManager.commit(status)
}catch(Exception e){
    transactionManager.rollback(status)
    throw e
}
```
可以把事务结果同步返回给调用端，出异常返回false,成功返回true.

## TransactionTemplate

```java
transactionTemplate.execute(new TransactionCallback<Object>{
    @Override
                public Object doInTransaction(TransactionStatus status) {
                    //你的事务操作
                }
})
```
和使用@Transactional的区别在于，你需要把你的事务操作扔进TransactionCallback的doInTransaction方法。

如果在doInTransaction内抛出异常就会回滚当前事务。需要注意的是，这个异常并不会被框架层代码吞掉，execute方法会继续抛出它，因此我们就能通过捕获异常来回滚我们的分布式事务了。

使用例子
```java
        final ObjectHolder<String> orderCodeHolder = new ObjectHolder<>(null);
        try {
            CreateOrderResponseDTO createOrderResponseDTO = transactionTemplate.execute(new TransactionCallback<CreateOrderResponseDTO>() {
                @Override
                public CreateOrderResponseDTO doInTransaction(TransactionStatus status) {
                    // 一些校验 以及构造订单
                    OrderWithWaresDTO orderWithWaresDTO = validateAndBuildOrder(request);

                    // 调用订单中心创建订单
                    String orderCode = orderCenterService.registerOrder(orderWithWaresDTO);
                    orderCodeHolder.set(orderCode);
                    orderWithWaresDTO.setOrderCode(orderCode);

                    // 调用支付中心创建支付单
                    CreatePaymentOrderResponse response = paymentCenterService.createPayment(orderWithWaresDTO);
                    
                    //...业务操作

                    //落本地数据路
                    createLocalOrder(orderWithWaresDTO);

                    CreateOrderResponseDTO createOrderResponseDTO = new CreateOrderResponseDTO();
                    //...业务操作

                    return createOrderResponseDTO;
                }
            });
            return Result.success(createOrderResponseDTO);
        }catch (Exception ex){
            log.error("下单失败，回滚订单中心",ex);
            if(Objects.nonNull(orderCodeHolder.get())){
                // TODO: 2019-06-05 这边也有可能是失败 考虑做成重试
                orderCenterService.deleteOrder(orderCodeHolder.get());
            }
            return Result.fail("创建订单失败");
        }
```
transactionTemplate的execute方法传入了TransactionCallback接口的匿名实现，因此我们外部参数要和TransactionCallback中的方法进行交互需要声明为final类型，而String类型一旦声明就不能修改了，因此这边通过Holder类包装了一下。

```java
public class ObjectHolder<T> {

    private T object;

    public ObjectHolder(T object){
        this.object = object;
    }

    public T get() {
        return object;
    }

    public void set(T object) {
        this.object = object;
    }
}
```

# Java事务类型
java事务的类型分为`JDBC事务`,`JTA(Java Transaction API)事务`,`容器事务`。

## JDBC事务
jdbc事务是用**connection 对象**控制。JDBC Connection接口提供了两种书屋模式：`自动提交`和`手工提交`。
java.sql.Connection提供了以下控制事务的方法：
```java
public void setAutoCommit(boolean)
public boolean getAutoCommit()
public void commit()
public void rollback()
```
使用JDBC事务界定时，可以将多个SQL语句结合到一个事务中。JDBC事务的一个缺点是事务的范围**局限于一个数据库连接**。一个JDBC事务不能跨越多个数据库。
## JTA （Java Transaction API）事务
JTA是一种高层的，与实现无关的，与协议无关的API，应用程序和应用服务器可以使用**JTA**来访问事务。

**JTA**允许应用程序执行**分布式**事务处理，在两个或多个网络计算机资源上访问并且更新数据，这些数据可以分布在多个数据库上。JDBC驱动程序的JTA支持极大地增强了数据访问能力。

如果计划用 JTA 界定事务，那么就需要有一个实现 `javax.sql.XADataSource`、 `javax.sql.XAConnection` 和 `javax.sql.XAResource` 接口的 JDBC 驱动程序。一个实现了这些接口的驱动程序将可以参与 JTA 事务。一个 `XADataSource` 对象就是一个 `XAConnection` 对象的工厂。 XAConnections 是参与 JTA 事务的 JDBC 连接。

您将需要用应用服务器的管理工具设置 XADataSource。（从应用服务器和 JDBC 驱动程序的文档中可以了解到相关的指导）

J2EE应用程序用 JNDI 查询数据源。一旦应用程序找到了数据源对象，它就调用 javax.sql.DataSource.getConnection 以获得到数据库的连接

XA 连接与非 XA 连接不同。一定要记住 XA 连接参与了 JTA 事务。这意味着 XA 连接不支持 JDBC 的自动提交功能。同时，应用程序一定不要对 XA 连接调用`java.sql.Connection.commit`或者`java.sql.Connection.rollback`。相反，应用程序应该使用 `UserTransaction.begin`、 `UserTransaction.commit`和`UserTransaction.rollback`

### JTA原理
假设有两个Connection,con1,con2过程如下
```java
con1 = XAResouce1.getConnection...       
con2 = XAResouce2.getConnection...       

con1 do some thing.       
con2 do some thing.       
after they finish.       

pre1 = XAResouce1.prepare();       
pre2 = XAResouce2.prepare();       

if( both pre1 and pre2 are OK）{       
　　XAResouce1 and 2 commit       
}else {       
　　XAResouce1 and 2 rollback       
} 
```
在XAResouce1 and 2 commit。可能出现XAResouce1 commit ok,XAResouce2 commit failed。这时候会抛出一个启发式异常。程序可以处理这个异常比如**XAResource.recover**之类。
一般情况，没别的方法，需要数据管理员根据数据操作日志`undo`所有的操作或者恢复数据备份。有的数据库在进行数据操作的时候会生成一个反操作日志。比如insert对delete等。

Global Transaction 需要XA接口（包括在JTA里面）的支持。
```java
import javax.sql.XAConnection;
import javax.transaction.xa.Xid;
import javax.transaction.xa.XAResource;
import javax.transaction.xa.XAException;
import javax.transaction.Transaction;
import javax.transaction.TransactionManager;
// 其中的
javax.sql.XAConnection;
javax.transaction.xa.Xid;
javax.transaction.xa.XAResource;
//这些XA接口的实现，需要数据库的JDBC提供。
//数据库本身要支持XA。数据库的JDBC也要提供XA的实现。
```




## 容器事务

容器事务由**J2EE**应用服务器提供的，容器事务大多基于**JTA**完成，这是一个基于**JNDI**，相当复杂的API实现。相对编码实现JTA事务管理，我们可以通过EJB容器提供的容器事务管理机制（CMT）完成同一个功能，这项功能由J2EE应用服务器提供。这使得我们可以简单的指定将哪个方法加入事务，一旦指定，容器将负责事务管理任务。这是我们土建的解决方式，因为通过这种方式我们可以将事务代码排除在逻辑编码之外，同时将所有困难交给J2EE容器去解决。使用EJB CMT的另外一个好处就是程序员无需关心JTA API的编码，不过，理论上我们必须使用EJB.

## 三种java事务差异
1. JDBC事务控制的`局限性在一个数据库连接内`，但是使用简单
2. JTA事务的功能强大，事务可以`跨越多个数据库或多个DAO`,使用也比较复杂
3. 容器事务，主要指的是J2EE应用服务器提供的书屋管理，`局限于EJB应用`使用
