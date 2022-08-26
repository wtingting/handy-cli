'use strict';
const log=require("@handy-cli/log")
module.exports = exec;
const Package=require('@handy-cli/package') 
const path=require('path')
const SETTINGS={
    init:"com-lib-test"//@handy-cli/int
}
const CACHE_DIR="dependencies"
async function exec() {
    //1、targetPath=>modulePath
    //2、modulePath=>Package(npm 模块)
    //3、Package.getRootFile(获取入口文件)
    //4、Package.update/ Package.install
    //封装=》复用
    const cmdObj=arguments[arguments.length-1]
    const packageName=SETTINGS[cmdObj.name()]
    const packageVersion='latest';

    let targetPath=process.env.CLI_TARGET_PATH;
    const homePath=process.env.CLI_HOME_PATH;
    let storeDir=""
    let pkg=null

    //未输入目录路径
    if(!targetPath){
        //生成缓存路径
        targetPath=path.resolve(homePath,CACHE_DIR);//生成缓存路径
        storeDir=path.resolve(targetPath,'node_modules')
        log.verbose('targetPath',targetPath)
        log.verbose('storeDir',storeDir)
        pkg=new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        })
        if(pkg.exists()){
            //更新package
        }else{
            //安装package
          await pkg.install()
        }
    }else{
        pkg=new Package({
            targetPath,
            packageName,
            packageVersion
        })

    }
    const rootFile=pkg.getRootFilePath()
    if(rootFile)
    require(rootFile).apply(null,arguments)
}
