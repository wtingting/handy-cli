'use strict';
const log = require("npmlog")
//判断debug模式,如果不设置debug模式，低于info:2000的命令不会显示，如verbose
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";

log.heading="handycli";//修改前缀
log.headingStyle={fg:"red"};//前缀样式

log.addLevel("success", 5000, {
    fg: "green",
    bold: true
})//添加自定义命令，fg:前景色，bg:背景色,bold:字体加粗
module.exports = log;