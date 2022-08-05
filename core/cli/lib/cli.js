"use strict";

module.exports = cli;
const semver = require("semver");
const colors = require("colors/safe");

const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const pkg = require("../package.json");
const log = require("@handy-cli/log");
const constant = require("./const");
const path = require("path");

const {homedir}= require('os');
async function cli() {
  try {
    checkPigVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    chenkInputArgs();
    checkEnv();
    await checkGlobalUpdate()
  } catch (e) {
    log.error(e);
  }
}
//检查node版本
function checkNodeVersion() {
  //获取当前版本号
  const currentVersion = process.version;
  //最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  //semver:gt大于，lt小于,gte大于等于
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`handy-cli 需要安装v${lowestVersion}以上版本的 Node.js`)
    );
  }
}
//监测版本号发出通知
function checkPigVersion() {
  log.notice("cli", pkg.version);
}
//检查root启动，自动降级root权限，（对ios有效）
function checkRoot() {
  //process.geteuid()
  const rootCheck = require("root-check");
  rootCheck();
}
//检查主目录
function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}
//检查入参设置deubg模式
function chenkInputArgs() {
  const minimist = require("minimist");
  const args = minimist(process.argv.slice(2));
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL;
  //方法二
  // log.level=args.debug?"verbose":"info"
    // log.verbose('debug','测试debug模式')

}
let config;
//检查环境变量 .env文件----带研究
function checkEnv() {
  const dotenv = require("dotenv");
  config=dotenv.config({
    path:path.resolve(homedir(),".env")
  })
  config=createDefaultConfig()
  log.verbose("环境变量",process.env.CLI_HOME_PATH);
}
//设置默认环境变量
function createDefaultConfig(){
  const cliConfig={
    home:homedir()
  }
  if(process.env.CLI_HOME){
    cliConfig['cliHome']=path.join(homedir(),process.env.CLI_HOME)
  }else{
    cliConfig['cliHome']=path.join(homedir(),constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH=cliConfig.cliHome
  return cliConfig;
}

//检查是否需要全局更新-https://registry-npmjs.org/模块名称
async function checkGlobalUpdate(){
  //1.获取当前版本号和模块名
  const currentVersion=pkg.version;
  const npmName='com-lib-test';//pkg.name;
  //2.调用npm API，获取所有版本号
  const {getNpmSemverVersion}= require("@handy-cli/get-npm-info")
  const lastVersion=await getNpmSemverVersion(npmName,currentVersion)
  if(lastVersion&&semver.gt(lastVersion,currentVersion)){
    log.warn(colors.yellow(`请手动更新${npmName},当前版本：${currentVersion},最新版本：${lastVersion}
    更新命令：npm install -g ${npmName}`))
  }
  //3、提前所有版本号，比对哪些版本号大于当前版本号
  
  //4、获取最新的版本号，提示用户更新到最新版本
  
}