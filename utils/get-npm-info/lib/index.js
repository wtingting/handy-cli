'use strict';
const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver')
//查询传入包的npm版本信息
function getNpmInfo(npmName, registry) {
    if (!npmName)
        return null;
    const registryUrl = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(registryUrl, npmName)
    return axios.get(npmInfoUrl).then(res => {
        if (res.status == 200) {
            return res.data;
        }
        return null;
    }).catch(err => {
        return Promise.reject(err)
    }
    )
}
function getDefaultRegistry(isOriginal = true) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}
//调用npm接口返回版本号
async function getNpmVersion(npmName, registry) {
    const data = await getNpmInfo(npmName, registry)
    if (data) {
        return Object.keys(data.versions);
    } else {
        return []
    }
}
function getSemverVersion(baseVersion, versions) {
    versions = versions.filter(version => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => semver.gt(b, a)) //排序
    return versions;
}
async function getNpmSemverVersion(npmName, baseVersion, registry) {
    const versions = await getNpmVersion(npmName, registry)
    const newVersions = getSemverVersion(baseVersion, versions)
    if (newVersions && newVersions.length > 0) {
        return newVersions[0]
    }
    return null
}
module.exports = {
    getNpmInfo,
    getNpmVersion,
    getNpmSemverVersion
} 