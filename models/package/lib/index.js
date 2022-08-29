'use strict';
const pkgDir = require('pkg-dir').sync;
const path = require('path')
const faExtra = require("fs-extra")
const pathExists = require('path-exists').sync
const { isObject } = require('@handy-cli/utils')
const formatPath = require("@handy-cli/format-path")
const { getDefaultRegistry, getNpmLatestVersion } = require('@handy-cli/get-npm-info')
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
        //Package的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_')
    }
    async prepare() {
        // if(this.storeDir&&!pathExists(this.storeDir)){
        //     //创建文件目录
        //     faExtra.mkdirpSync(this.storeDir)
        // }
        // if(this.packageVersion==='latest'){
        //获取最高版本
        this.packageVersion = await getNpmLatestVersion(this.packageName)
        // }
    }
    //获取指定版本的缓存路径
    getLatestCacheFilePath(_pkcVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${_pkcVersion}@${this.packageName}`)
    }
    //判断当前Package是否存在
    async exists() {
        if (this.storeDir) {
            //获取最高版本---最高版本不存在就重新安装，存在不处理
            const latestPackageVersion = await getNpmLatestVersion(this.packageName)
            //拼写缓存文件名称
            const cacheFilePath = this.getLatestCacheFilePath(latestPackageVersion)
            //设置为最高版本
            this.packageVersion = latestPackageVersion
            //判断文件是否存在
            return pathExists(cacheFilePath)
        }
        return false;
        // else{
        //    return pathExists(this.targetPath)
        // }
    }
    //安装Package
    async install() {
        //    await this.prepare()
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
    // async update() {
    //     await this.prepare()
    //     //获取最新版本好
    //     const latestPackageVersion=await getNpmLatestVersion(this.packageName)
    //     //判断最新版本是否存在
    //     getLatestCacheFilePath
    //     //不存在重新安装
    //     this.install()
    // }
    //获取入口文件的路径
    getRootFilePath() {
        let targetPath = this.storeDir ? this.getLatestCacheFilePath(this.packageVersion) : this.targetPath
        //1、获取package.json所在的目录 - pkg-dir
        const dir = pkgDir(targetPath)
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
