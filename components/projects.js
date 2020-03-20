const argv = require("yargs").argv;
const paths = require("../components/paths");

var folder_src = paths.src_folder;
var folder_dist = paths.dist_folder;

module.exports = function(type) {
    console.log(`Build Type ${type} ${argv.type}`);
    const argvType = argv.type;
    switch (argvType) {
        case "project":
            folder_src = paths.project_src_folder;
            folder_dist = paths.project_dist_folder;
            break;
        default:
            folder_src = paths.src_folder;
            folder_dist = paths.dist_folder;
    }

    return type == "src" ? folder_src : folder_dist;
};
