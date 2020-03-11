const argv = require('yargs').argv
const paths = require('../components/paths');

var folder_src = paths.src_folder;
var folder_dist = paths.dist_folder;

module.exports = function(type) {

    console.log(`Build Type ${type} ${argv.type}`);
    const argvType = argv.type

    switch (argvType) {
        case 'abandonment':
            folder_src = paths.src_assets_aband_folder;
            folder_dist = paths.dist_assets_aband_folder;
        break;
        case 'quickquote':
            folder_src = paths.src_assets_qq_folder;
            folder_dist = paths.dist_assets_qq_folder;
        break;
        case 'hospital':
            folder_src = paths.hospitalfinder_src_folder;
            folder_dist = paths.hospitalfinder_dist_folder;
        break;
        default:
            folder_src = paths.src_folder;
            folder_dist = paths.dist_folder;
    }
      
    return type == "src" ? folder_src : folder_dist
}