const argv = require('yargs').argv
const paths = require('../components/paths');

var folder_src = paths.src_folder;
var folder_dist = paths.dist_folder;

module.exports = function(type) {

    console.log(`Build Type ${type} ${argv.type}`);
    const argvType = argv.type

    if(argvType === "abandonment") {
        folder_src = paths.src_assets_aband_folder;
        folder_dist = paths.dist_assets_aband_folder;
    }
    
    if(argvType === "quickquote") {
        folder_src = paths.src_assets_qq_folder;
        folder_dist = paths.dist_assets_qq_folder;
    }

    if(argvType === "hospital") {
        folder_src = paths.hospitalfinder_src_folder;
        folder_dist = paths.hospitalfinder_dist_folder;
    }

    return type == "src" ? folder_src : folder_dist
}