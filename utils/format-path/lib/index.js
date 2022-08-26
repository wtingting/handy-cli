'use strict';
const path=require("path")
module.exports = formatPath;

function formatPath(p) {
    // TODO
    if(p&&typeof p==="string"){
        //路径分隔符window是\,macOs是/
        // const sep=path.sep;
        return p.replace(/\\/g,'/')
    }
    return p
}
