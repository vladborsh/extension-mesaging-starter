var readline = require('linebyline')
var jsonfile = require('jsonfile')
rl = readline('./all.txt');

var list = [];

rl.on('line', function(line, lineCount, byteCount) {
    console.log(line)
    list.push(line);
})
rl.on('end', function() {
   jsonfile.writeFile('./data.js', list, function (err) {
     console.error(err)
   })
})
.on('error', function(e) {
    console.log(e);
});