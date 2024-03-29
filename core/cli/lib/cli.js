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
const program = require('commander')
const init = require('@handy-cli/init')
const exec = require('@handy-cli/exec')

const { homedir } = require('os');
async function cli() {
  try {
    prepare()
    registerCommand()
  } catch (e) {
    if(process.env.LOG_LEVEL==='verbose'){
      console.log(e)
    }
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
function checkPkgVersion() {
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

//检查环境变量 .env文件----带研究
function checkEnv() {
  const dotenv = require("dotenv");
  let  config = dotenv.config({
    path: path.resolve(homedir(), ".env")
  })
  config = createDefaultConfig()
}
//设置默认环境变量
function createDefaultConfig() {
  const cliConfig = {
    home: homedir()
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(homedir(), process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(homedir(), constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
  return cliConfig;
}

//检查是否需要全局更新-https://registry-npmjs.org/模块名称
async function checkGlobalUpdate() {
  //1.获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = 'com-lib-test';//pkg.name;
  //2.调用npm API，获取所有版本号
  const { getNpmSemverVersion } = require("@handy-cli/get-npm-info")
  const lastVersion = await getNpmSemverVersion(npmName, currentVersion)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新${npmName},当前版本：${currentVersion},最新版本：${lastVersion}
    更新命令：npm install -g ${npmName}`))
  }
  //3、提前所有版本号，比对哪些版本号大于当前版本号

  //4、获取最新的版本号，提示用户更新到最新版本

}
async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate()
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d,--debug', '是否开启调试模式', false)
    .option('-tp,--targetPath <target>', '是否指定本地调试文件', '');

  //注册命令
  program.command('init [prjectName]')
    .option('-f,--force', '是否强制初始化项目')
    .action(exec)

  //开启debug模式
  program.on("option:debug", function (opts) {
    let options = program.opts()
    process.env.LOG_LEVEL = 'verbose';
    log.level = process.env.LOG_LEVEL;
    log.verbose('debug', '测试debug模式')
  })
  //设置全局targetPath
  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program.getOptionValue('targetPath')
  })
  //对未知命令监听
  program.on('command:*', function (obj) {
    program.outputHelp()
    console.log(obj)
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('未知命令：' + obj[0]))
    console.log(colors.red('可用命令', availableCommands.join(',')))
  })

  program.parse(process.argv)
}