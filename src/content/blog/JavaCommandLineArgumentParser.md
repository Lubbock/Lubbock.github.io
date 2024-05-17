---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: JavaCommandLineArgumentParser
featured: false
draft: false
tags:
 - java
description: JavaCommandLineArgumentParser
---

#java

- Command Line Argument Categories
- Switches
- Targets
- The Command Line Argument Parser
    - switchPresent()
    - switchValue(),switchLongValue() and switchDoubleValue()
    - switchValues()
    - switchPojo()
    - targets()
- Full Code For Command Line Argument Parser

When you start a Java program from the command line you may sometimes need to pass command line arguments to the program's main method. These command line arguments may contain various configuration information your program needs to do its job properly.

In this tutorial I will show you how to use a command line argument parser I have developed. The full code for the command line argument parsers is listed at the end of this tutorial (it's just one class). If you want to use it in your own projects, feel free to do so. Consider it published under the Apache License 2, which allows you to use it in both open source and commercial projects. The code is also available on GitHub in case you want to fork it.

## Command Line Argument Categories
The command line argument parser described in this tutorial breaks command line arguments into two categories:
- Targets
- Switches
A target is what the Java program is to work on. For instance, this could be a file name of a file to copy (or whatever your Java program does with the file).

A switch is a configuration parameter for your Java program. Switches are often optional.

Look at these example command line arguments for a Java program that copies files:
```sh
-overwrite file.txt file2.txt
```
The interpretation of these command line arguments could be that the copy program should copy file.txt to a file named file2.txt and overwrite file2.txt if it already exists.

These command line arguments consists of one switch (-overwrite) and two targets (file.txt and file.2.txt). Both switches and targets will be explained in more detail in the following sections.

### Switches
As mentioned above, switches are usually used to provide additional configuration information to the Java application.

Switches always start with a - character. For instance -port, -ha or --debug .

Switches may consist of just the switch itself (meaning it is either present or not), or switches may have values. Look at this series of command line arguments:
```sh
-ha -port 9999
```
The first switch -ha is a boolean switch. It is either present or not. The second switch -port has the value 9999 following it. This means that the value of the switch -port is 9999. It is not merely present or not. You will see later how the command line argument parser distinguishes between the different types of switches.

### Targets
Targets are all command line arguments which are not switches. All the rest of the arguments when the switches and switch values are removed. Look at these command line arguments:
```sh
-overwrite file.txt file2.txt
```
When the switch -overwrite is removed, the two arguments file.txt and file2.txt remain. These arguments are considered targets. You will see later how the command line argument parser knows the difference between switch values and targets.

## The Command Line Argument Parser
The command line argument parser consists of a single Java class named CliArgs. It's fully qualified Java class name is com.jenkov.cliargs.CliArgs .

The CliArgs class takes an array of String as argument to its constructor. Here is an example of how to instantiate CliArgs:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

}
```
Once you have a CliArgs instance you can start asking it for switches and targets.

The CliArgs class contains the following methods you can use to obtain switch information and values:
- switchPresent()
- switchValue()
- switchLongValue()
- switchDoubleValue()
- switchValues()

To access the targets of the command line arguments you can call:

- targets()

Each of these methods will be explained in more detail below.

#### switchPresent()
The switchPresent() method can be used to ask if a given switch is present or not. For instance, the -overwrite switch shown earlier. Here is an example of how to check if the -overwrite switch is present among the command line arguments:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    boolean overwrite = cliArgs.switchPresent("-overwrite");

}
```
If the command line arguments contains the -overwrite switch anywhere, the switchPresent() method will return true. If not, the switchPresent() method will return false.

#### switchValue(),switchLongValue() and switchDoubleValue()
The switchValue() method can be use to obtain the value of a switch. The value of a switch is the argument following right after the switch itself. In the following command line arguments the switch -port has the value 9999 :

```sh
-port 9999
```
Here is a code example showing how to use switchValue() to read the value of the -port switch:

```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    String port = cliArgs.switchValue("-port");

}
```
If you want the value of a switch parsed into a long or double you can use the switchLongValue() and switchDoubleValue() methods. Here is a code example showing how to use them:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    String port       = cliArgs.switchValue("-port");
    long   portLong   = cliArgs.switchLongValue("-port");
    long   portDouble = cliArgs.switchDoubleValue("-port");

}
```
All three methods exists in versions that take a default value in case the switch is not present. Here is a code example showing you how using default values looks:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    String port       = cliArgs.switchValue("-port", 9999);
    long   portLong   = cliArgs.switchLongValue("-port", 9999L);
    long   portDouble = cliArgs.switchDoubleValue("-port", 9999D);

}
```
In case the -port switch was not present, the value 9999 would be returned from the above method calls. That is the default value passed as second parameter to all the method calls.

#### switchValues()
The switchValues() method is used to obtain multiple values for a switch. The switchValues() method will return all values after the switch and until the next switch is met (next argument starting with a - character).

Here is first an example set of command line argument:

```sh
-from file1.txt file2.txt -to copy1.txt copy2.txt
```
These command line arguments contain two switches with two switch values each. You can read the switch values like this:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    String[] from = cliArgs.switchValues("-from");
    String[] to   = cliArgs.switchValues("-two");

}
```
The values of the -from switch will be file1.txt and file2.txt. Those are all the values present between the -from switch and the next switch (the -to switch).

The values of the -to switch will be copy1.txt and copy2.txt. Those are all the values after the -to switch.
#### switchPojo()
In case your Java application can take a lot of command line arguments, explicitly checking for each individual switch may be a bit verbose in code. Instead you can create a swith POJO (Plain Old Java Object) class to hold all the switches. Here is such a switch POJO class example:
```java
public class CliSwitches {

    public boolean  ha    = false;
    public int      port  = 8080;
    public byte     port2 = 123;
    public String[] conf  = null;

}
```
This CliSwitches class contains 4 switches. The command line arguments will be interpreted as belonging to one of these 4 switches (or be a target). For instance:
```sh
-port 9999 -ha -conf val1 val2
```
You can now read all the switches from the command line directly into an instance of the CliSwitches class, using the switchPojo() method. Here is how that looks:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    CliSwitches switches = cliArgs.switchPojo(CliSwitches.class);

    //access switches.port, switches.port2, switches.ha and switches.conf
}
```
You can create your own POJO class. The CliArgs switchPojo() method will use the property names inside the class to match against switches in the command line. Dashes (-) inside switch names will be matched with underscores (_) in property names.

#### tagets()
The targets() method returns all the arguments which are not switches or switch values. The switches are easy to recognize. They start with the - character.

Finding out what arguments are switch values and what are targets is a bit harder. The CliArgs class distinguishes between switch values and targets by assuming, that all arguments which have not been "taken" already as switch values must be targets. That means, that you must first read all the potential switch values out of the CliArgs instance, and then as the last action read the targets. Here is how that looks in code:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    int port = cliArgs.switchLongValue("-port");

    String[] targets = cliArgs.targets();

}
```
With these command line arguments:
```sh
-port 9999 web-root
```
will the method targets() as executed in the code above, return the String
```sh
web-root
```
The method switchLongValue("-port") assumes that the switch only has one value, so the switch only "takes" the following argument (9999). That leaves the last argument free, which means it will be interpreted as a target.

Targets can be located many places in the argument list. Look at this list of command line arguments:

```sh
-port 9999 web-root -zip always
```
You can parse these arguments using this code:
```java
public static void main(String[] args) {

    CliArgs cliArgs = new CliArgs(args);

    int    port = cliArgs.switchLongValue("-port");
    String zip  = cliArgs.switchValue("-zip");

    String[] targets = cliArgs.targets();
}
```
The switchLongValue("-port") method call will take the following argument 9999, and the switchValue("-zip") call will take the following argument always. Therefore the targets() method call will return the argument web-root , because web-root is the only argument that has not been "taken" yet, even if it is located in the middle of the argument list.

It doesn't matter whether you "take" switch values using the different switch methods, or if you take them by copying them into a POJO. Once a command line argument has been taken by a switch method, it is marked as taken internally, and will not be considered as part of the target arguments.

## Full Code for Command Line Argument Parser

Here is the full Java code for my command line argument parser named CliArgs. You can also get my CliArgs Java command line parser on GitHub.

```java
public class CliArgs {

  private String[] args = null;

  private HashMap<String, Integer> switchIndexes = new HashMap<String, Integer>();
  private TreeSet<Integer>         takenIndexes  = new TreeSet<Integer>();

  private List<String> targets = new ArrayList<String>();

  public CliArgs(String[] args){
     parse(args);
  }

  public void parse(String[] arguments){
     this.args = arguments;
     //locate switches.
     switchIndexes.clear();
     takenIndexes.clear();
     for(int i=0; i < args.length; i++) {
       if(args[i].startsWith("-") ){
         switchIndexes.put(args[i], i);
         takenIndexes.add(i);
       }
     }
  }

  public String[] args() {
    return args;
  }

  public String arg(int index){
    return args[index];
  }

  public boolean switchPresent(String switchName) {
    return switchIndexes.containsKey(switchName);
  }

  public String switchValue(String switchName) {
    return switchValue(switchName, null);
  }

  public String switchValue(String switchName, String defaultValue) {
    if(!switchIndexes.containsKey(switchName)) return defaultValue;
    
    int switchIndex = switchIndexes.get(switchName);
    if(switchIndex + 1 < args.length){
      takenIndexes.add(switchIndex +1);
      return args[switchIndex +1];
    }
    return defaultValue;
  }

  public Long switchLongValue(String switchName) {
    return switchLongValue(switchName, null);
  }

  public Long switchLongValue(String switchName, Long defaultValue) {
    String switchValue = switchValue(switchName, null);
    
    if(switchValue == null) return defaultValue;
    return Long.parseLong(switchValue);
  }

  public Double switchDoubleValue(String switchName) {
    return switchDoubleValue(switchName, null);
  }

  public Double switchDoubleValue(String switchName, Double defaultValue) {
    String switchValue = switchValue(switchName, null);
    
    if(switchValue == null) return defaultValue;
    return Double.parseDouble(switchValue);
  }


  public String[] switchValues(String switchName) {
    if(!switchIndexes.containsKey(switchName)) return new String[0];
    
    int switchIndex = switchIndexes.get(switchName);
    
    int nextArgIndex = switchIndex + 1;
    while(nextArgIndex < args.length && !args[nextArgIndex].startsWith("-")){
      takenIndexes.add(nextArgIndex);
      nextArgIndex++;
    }

    String[] values = new String[nextArgIndex - switchIndex - 1];
    for(int j=0; j < values.length; j++){
      values[j] = args[switchIndex + j + 1];
    }
    return values;
  }

  public <T> T switchPojo(Class<T> pojoClass){
    try {
      T pojo = pojoClass.newInstance();
    
      Field[] fields = pojoClass.getFields();
      for(Field field : fields) {
        Class  fieldType = field.getType();
        String fieldName = "-" + field.getName().replace('_', '-');
        
        if(fieldType.equals(Boolean.class) || fieldType.equals(boolean.class)){
          field.set(pojo, switchPresent(fieldName) );
        } else if(fieldType.equals(String.class)){
          if(switchValue(fieldName) != null){
            field.set(pojo, switchValue(fieldName ) );
          }
        } else if(fieldType.equals(Long.class)    || fieldType.equals(long.class) ){
          if(switchLongValue(fieldName) != null){
            field.set(pojo, switchLongValue(fieldName) );
          }
        } else if(fieldType.equals(Integer.class)    || fieldType.equals(int.class) ){
          if(switchLongValue(fieldName) != null){
            field.set(pojo, switchLongValue(fieldName).intValue() );
          }
        } else if(fieldType.equals(Short.class)    || fieldType.equals(short.class) ){
          if(switchLongValue(fieldName) != null){
            field.set(pojo, switchLongValue(fieldName).shortValue() );
          }
        } else if(fieldType.equals(Byte.class)    || fieldType.equals(byte.class) ){
          if(switchLongValue(fieldName) != null){
            field.set(pojo, switchLongValue(fieldName).byteValue() );
          }
        } else if(fieldType.equals(Double.class)  || fieldType.equals(double.class)) {
          if(switchDoubleValue(fieldName) != null){
            field.set(pojo, switchDoubleValue(fieldName) );
          }
        } else if(fieldType.equals(Float.class)  || fieldType.equals(float.class)) {
          if(switchDoubleValue(fieldName) != null){
            field.set(pojo, switchDoubleValue(fieldName).floatValue() );
          }
        } else if(fieldType.equals(String[].class)){
          String[] values = switchValues(fieldName);
          if(values.length != 0){
            field.set(pojo, values);
          }
        }
      }
    
      return pojo;
    } catch (Exception e) {
      throw new RuntimeException("Error creating switch POJO", e);
    }
  }

  public String[] targets() {
    String[] targetArray = new String[args.length - takenIndexes.size()];
    int targetIndex = 0;
    for(int i = 0; i < args.length ; i++) {
      if( !takenIndexes.contains(i) ) {
        targetArray[targetIndex++] = args[i];
      }
    }

    return targetArray;
  }

}
```
