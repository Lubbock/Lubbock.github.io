---
author: cobo
pubDatetime: 2023-01-30T15:57:52.737Z
title: emacs
featured: false
draft: false
tags:
 - robot
description: this is auto generate
---
打开文件    $ emacs filename &

 

保存并退出     $ ctrl-x ctrl-c (两个连续的组合按键)

取消执行  q

中断（与中断后的继续） ctrl-g

向上 ctrl-p
向下 ctrl-n

向左 ctrl-b（b即 backward）
向右 ctrl-f (f即 forward)

下一页 ctrl-v
上一页 alt-v

 

 

重绘荧屏 ctrl-L（即，将光标所在行放到中间以便阅读，哈哈不用鼠标

哦，这就是用键盘的好处）

 

 

 

下一个单词 alt-f
上一个单词 alt-b

下一个字符 ctrl-f
上一个字符 ctrl-b

行头 ctrl-a
行尾 ctrl-e

句首 alt-a (即到上一句点后面，一个句子的开头)
句尾 alt-e （即到据点后面）

----------------------
档头 alt-< （即alt-shift-<,因为<是一个和shift的组合键哦）
档尾 alt->

删除游标钱的/后面的字 ctrl-d

往回删一个字 alt-del （即删除游标后面的第一个单词）
往前删一个字 alt-d （即删除光标前一个字符）


删除至行尾 ctrl-k
删到一句子结尾 alt-k （即删除到句点）

-----------------------

向右移动8个字符  ctrl-u 8 ctrl-f
向下移动5行  ctrl-u 5 ctrl-n
取消10次操作  c-u 10 c_x u  （即undo 10次）

将当前行移动到当前屏幕第一行 c-u 0 c-l

 

特殊情况， c-u 3 c-v不是上翻3页，而是上翻3行。据说有一个故事。

 

`C-'开头的是 `Ctrl'键加上后面的键一块按下，例如 `C-x 0'就是Ctrl

键和 x键一块按下， 然后再按下0;

以 `M-'开头的就是META键, 一般就是 Alt键.

C-x C-f 文件名 -- 打开文件

C-x C-s -- 保存文件

C-x C-c -- 退出Emacs

C-x u -- 取消上一次操作 （即 ctrl-x后收回手，再按键盘u键）


c-z 或者 c-x c-z 挂起emacs (挂起就是 把程序放到后台操作，前台回

到shell提示符上，输入fg回到emacs界面)

 

 

 

参考

http://forum.ubuntu.org.cn/viewtopic.php?p=105293

http://www.cppblog.com/baby-fly/archive/2010/07/15/120447.html 

 

 

 

 

 

 

课外补充

 

C stands for Ctrl and M stands for Alt 
REFERENCE FORM EMACS TUTORIAL
表述不一定正确，仅供参考，主要是要多实践，一开始可能会不习惯。

PART1 CURSOR
C+p 光标上移
C+n 光标下移
C+b 光标后移
M+b 光标向前移动一个单词
C+f 光标前移
M+f 光标向后移动一个单词
C+v 向下翻页
M+v 向上翻页
C+l 光标移动屏幕中间
C+a 光标移动到本行最前位置
C+e 光标移动到本行最后位置
M+a 光标移动到本句或上一句的最前位置
M+e 光标移动到本句或或下一句的最后位置
M+< 移动到当前文档开始处
M+> 移动到当前文档结束处

OTHERS
C+u + num + cmd 重复执行cmd num次
C+g 取消当前命令或输入一半的命令


INSERTING AND DELETING
C+d 删除光标当前所在字符
M+d 删除光标之后的一个单词
C+k 剪切光标开始到行结尾的字符
M+k剪切光标之后的一句话
C+@ 在两个位置按下，然后再按C+w，则剪切两个位置之间的字符
C+y 粘贴最近一次所剪切的内容
M+y 可以切换不同的剪切的内容，按住M键，然后通过按y来进行选择

UNDO
C+x+u 撤销

FILES
当你打开一个文档并进行编辑后保存，emacs会先对原文档进行改名（在名字前加‘~’）保存，然后再进行保存操作，以防你之后想恢复到原来的文档。
当你编辑一个文档时，这个文档的名字会在emacs的底下显示
C+x+C+f 按C+x然后按C+f，然后再输入你想打开的文件的名字，就打开你想要的文档，如果你输入过程中不想继续可以按C+g，当找不到所需的文档时会自动创建一个文档。
C+x+C+s 保存当前文档

BUFFERS
在emacs里面编辑的每一个文档都是一个buffer，可以通过C+x+C+f+‘文件名’进行切换
如当前emacs里编辑着两个文件，即两个buffer，‘foo’和‘test.cc’。
也可以通过按C+x+b+文档名来进行切换。
假设你忘记了文件的名字，那你可以先输入：
C+x+C+b 查看当前emacs打开的文档列表，可以用C+x+1来关闭打开的列表窗口。
其中里面有两项并不指向任何文档，*Buffer List*和*Messages*，这两项分别保存列表文档的名称，及保存emacs最低下显示的信息，你可以通过C+x+b然后输入这两个名字来查看他们的内容。
如果现在emacs打开了三个文档，你编辑完第一个后没保存，直接切换到第二个，同样是没保存直接切换到第三个，这时如果你想要保存前两个文档，除了分别切换到那两个文档然后再执行保存的方法外，还有更简单的方法是在第三个文档的界面下直接按C+x+s，这时底下的信息栏会一一问你是否要进行对第一个和第二个文档进行保存。

AUTO SAVE
自动保存是一个很好的功能，emacs当然也有。
emacs有一个周期自动保存功能，自动把当前的文档内容保存在用两个‘#’夹起来的文件名里，例如当前文件名为‘test.cc’，则自动保存为#test.cc#，当你正常退出emacs时，emacs会把这个文件删除。
当你的机子当掉的时候，如何恢复文档呢？
只要用emacs打开原来的文件（注意不是被‘##’夹住的文件），emacs会建议你用M+x recover-this-file然后空格来恢复，再输入yes，就可以恢复了。
注：在shell底下如果要查看一个auto-save文件（即‘##’夹住的文件），如用cat命令，需要在这个文件名两端加冒号，如 cat “#test.cc#”。可能是命令行解释工具不能解析这种符号。

MODE LINE
MODE LINE就是emacs底下灰色底的那一行，
如例子：
--：**- TUTORIAL 63% L749 <Fundamental>-------------------
下面说下各部分的名称。
TUTORIAL是当前文档的名字，名字之前的星号是指当前文档有被编辑但未被保存，当保存后星号就变成--（dash），63%是指当前处于全文的位置，L749当然就是指光标所在的行号为749了。<Fundamental>告诉你当前你所处的编辑模式，emacs有多个不同的编辑模式，fundamental是一种主要的模式，不同的模式还会导致某些命令的作用不同。你可以通过输入：M+x XXX-mode+回车来改变当前模式，例如M+x c++-mode，etc。

SEARCHING
C+s+搜索内容 向前搜索，如果想继续可以继续按C+s，不想搜索的时候可以按C+g，如果找到想找的就按回车
C+r+搜索内容 如上，但方向是向后搜索

MULTIPLE WINDOWS
C+x+2 将当前窗口横向一分为二
C+x+3 将当前窗口纵向一分为二
C+x+o 将光标移动到另一窗口
C+x+1 去除其他窗口，剩下光标所在的窗口
C+M+v 光标在一个窗口，使另一个窗口滚动
在每一个窗口都可以一分为二，这样就可以出现多窗口，但最多能打开窗口的数量是和当前框架的大小有关系的。
C+x+4+C+f+文件名 打开一个文件，在一个新窗口里显示

GETTING MORE HELP
C+h+k+cmd 查询cmd的功能，说明比较详细。
C+h+c+要查询的命令 最常用的命令查询，它会简练的介绍命令的作用。
C+h+a+关键字 查询所有含有关键字的命令，这个命令可以帮助你记忆命令

# nnerotree

<f8>: 打开neotree
p, n: 文件目录间上下移动
SPC/RET/TAB: 这三个快捷键都可以打开文件或展开目录
U: 跳转到上一级目录
g: 刷新
H: 显示或隐藏 隐藏文件(dotfiles)
O: 打开目录下的所有目录结构
A: 最大化/最小化neotree窗口
C-c C-n: 创建文件或目录(以"/"结尾)
C-c C-d: 删除文件或目录
C-c C-r: 重命名文件后目录
C-c C-c: 设置当前目录为展示的根目录
C-c C-p: 复制文件或目录

n 下一行 ， p 上一行。
SPC or RET or TAB 若是文件，在其他buffer打开；若是目录，可切换折叠、收起。
g 刷新树。
A 最大/最小化 NeoTree 窗口
H 切换显示隐藏文件。
C-c C-n 创建文件，若以 / 结尾则表示创建文件夹。
C-c C-d 删除文件或目录。
C-c C-r 重命名文件或目录。
C-c C-c 改变根目录。