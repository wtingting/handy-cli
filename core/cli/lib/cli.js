'use strict';

module.exports = cli;
const semver=require("semver");
const colors=require("colors/safe");

const userHome=require("user-home");
const pathExists = require('path-exists').sync;
const pkg=require("../package.json");
const log=require("@handy-cli/log")
const constant=require("./const");
function cli() {
    try {
        checkPigVersion()
        checkNodeVersion() 
        checkRoot()
        checkUserHome()
        
        chenkInputArgs()
        log.verbose('debug','测试debug模式')
    } catch (e) {
        log.error(e)
    }
    
}
//检查node版本
function checkNodeVersion(){
    //获取当前版本号
    const currentVersion=process.version;
    //最低版本号
    const lowestVersion=constant.LOWEST_NODE_VERSION; 
    //semver:gt大于，lt小于,gte大于等于
    if(!semver.gte(currentVersion,lowestVersion)){
        throw new Error(colors.red(`handy-cli 需要安装v${lowestVersion}以上版本的 Node.js`))
    }

}
//监测版本号发出通知
function checkPigVersion(){
    log.notice("cli",pkg.version)
}
//检查root启动，自动降级root权限，（对ios有效）
function checkRoot(){
    //process.geteuid()
    const rootCheck=require("root-check");
    rootCheck()
}
//检查主目录
function checkUserHome(){
    if(!userHome||!pathExists(userHome)){
        throw new Error(colors.red("当前登录用户主目录不存在！"))
    }
}
//检查入参设置deubg模式
function chenkInputArgs(){
    const minimist=require("minimist");
    const args=minimist(process.argv.slice(2))
    log.level=args.debug?"verbose":"info"
}

function checkEnv(){
    
}