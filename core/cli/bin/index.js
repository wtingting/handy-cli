#!/usr/bin/env node
const importLocal=require("import-local")
//importLocal 判断使用的包是本地安装包，还是全局安装包
if(importLocal(__filename)){
  require("npmlog").info("cli","正在使用 handy-cli本地版本")
}else{
  require('../lib/cli')(process.argv.slice(2))
}