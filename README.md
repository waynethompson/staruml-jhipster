# staruml-jhipster
jHipster extension for [StarUML 2](http://staruml.io/) to create [jHipster Domain Language](http://jhipster.github.io/jhipster_uml.html#jdl) from a model.


[jHipster website](https://github.com/jhipster/generator-jhipster)
[jHipster github](http://jhipster.github.io/)

## Installation

Follow the intructions to install the [staruml extension from a github repository](http://docs.staruml.io/en/latest/managing-extensions.html#install-extension) using this url https://github.com/waynethompson/staruml-jhipster/

1. Show Extension Manager by selecting Tools | Extension Manager....
2. Select Install From Url button.
3. Enter **https://github.com/waynethompson/staruml-jhipster/** on input box
4. press Install button.



## Usage

Currently this extension only works with classes and enums.

###Steps to create a jdl document
1. Create a model following the staruml documentation [working with class digarams](http://docs.staruml.io/en/latest/modeling-with-uml/working-with-class-diagram.html)
2. Click **Tools > jhipster > Generate JDL...**
3. Select the folder of your jhipster project
4. This will generate a entities.jh file in you jhipster folder. On the cmd line in your jhipster folder run **jhipster-uml entities.jh**
