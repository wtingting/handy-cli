'use strict';
const pkgDir = require('pkg-dir').sync;
const path = require('path')
const pathExists=require('path-exists').sync
const { isObject } = require('@handy-cli/utils')
const formatPath = require("@handy-cli/format-path")
const { getDefaultRegistry } = require('@handy-cli/get-npm-info')
const npminstall = require("npminstall")
class Package {
    constructor(options) {
        if (!options) {
            throw new Error('Package类options参数不能为空！')
        }
        if (!isObject(options)) {
            throw new Error('Package类options参数必须为对象！')
        }
        //Package的目标路径
        this.targetPath = options.targetPath;
        //缓存package路径
        this.storeDir = options.storeDir;
        //Package的name
        this.packageName = options.packageName;
        //Package的version
        this.packageVersion = options.packageVersion;
    }
    //判断当前Package是否存在
    exists() {
        if(this.storeDir){

        }else{
           return pathExists(this.targetPath)
        }
    }
    //安装Package
    install() {
       return npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [
                { name: this.packageName, version: this.packageVersion }
            ]
        })
    }
    //更新Package
    update() {

    }
    //获取入口文件的路径
    getRootFilePath() {
        //1、获取package.json所在的目录 - pkg-dir
        const dir = pkgDir(this.targetPath)
        if (dir) {
            //2、读取package.json - require() js/json/node
            const pkgFile = require(path.resolve(dir, 'package.json'));
            //3、寻找main/lib - path
            if (pkgFile && pkgFile.main) {
                //4、路径的兼容（macOS/windows）
                return formatPath(path.resolve(dir, pkgFile.main));
            }
        }

        return null;
    }
}
module.exports = Package;
