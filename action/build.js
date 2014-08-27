// build.js
// 0. 找到build的tmp目录
// 0. task id (svn + time + user)

// shell 

// 1. svn co => task is dir
// 2. task_id dir build
// 3. tar output => 产出目录下
// 4. rm -rf svn dir
// 5. 返回tar包地址

// url ： http://fedev.baidu.com：8888/build?git=""&user=""&pwd=""&type=0&async=
//     0: fisp默认
    // 1: fis默认
    // 2: build.sh

    //有async返回taskid。

var async = require('async');
var cp = require("child_process").spawn();
var project = require("./lib.project.js");

var default_build_type = {
    0 : "fisp",
    1 : "fis",
    2 : "build.sh"
};

modules.exports = function(req, res, app){

    var async = req.query['async'] || false;

    var git = req.query['git'] || null;
    var svn = req.query['svn'] || null;

    var repo = {};
        repo.user = req.query['user'] || 'fis-cloud';
        repo.pwd = req.query['pwd'] || '';
    if(git){
        repo.url = git;
        repo.cmd = "git clone " + repo.url;
    } else if (svn) {
        repo.url = svn;
        repo.cmd = "svn co " + repo.url + "--username=" + repo.user + " --password" + repo.pwd; 
    } else {
        res.send(400, "Error: there is no svn or git");
        return;
    }

    var build_type = req.query['type'] || 0;

    var task_id = getTaskID();
    if(async){
        build();
        res.send(200, task_id);
    }else{
        async.parallel({
            result : function(cb){
                build(cb);
            }
        },
        function(err, result){
            if(err){
                res.send(400, err);
            }else{
                res.send(200, task_id);
            }
        });
    }

    function getTaskID(){
        var time = new Date();
        var task_id = repo.url + "_" + repo.user +  "_" + time;
    }

    function build(cb){
        var dir = fis.util.mkdir(project.getTemPath + "/" + task_id);
        var child = cp.spawn("sh", ["./operate.sh", repo.cmd, build_type], {cwd : dir});

        sp.stdout.setEncoding('utf8');
        var stdout_data = "\n";
        sp.stdout.on('data', function (data) {
            stdout_data += (data + "\n");
        });

        sp.stderr.setEncoding('utf8');
        var stderr_data = "\n";
        sp.stderr.on('data', function (data) {
            stderr_data += (data + "\n");
        });

        child.on('close', function (code, signal) {
            if(code == 0){
                //正确退出
                cb & cb(null, stdout);
            }else{
                cb & cb(stderr);
            }
        });
    }
}


