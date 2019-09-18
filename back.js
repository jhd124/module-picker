const path = require("path");
const fs = require("fs-extra");
const parser = require("@babel/parser")
const codepath = getAbsolutePath("./src/a.js");
const ast = getAst(codepath);
// // const code: string = "var x = 10;function f(){return x}"
console.log(ast)
// function resolveDependencies(){
    
// }

function getAst(path){
    const code = fs.readFileSync(path, "utf8");
    const ast = parser.parse(code, {
        sourceType: "module"
    });
    return ast;
}

function getAbsolutePath(relativePath){
    const cwd = process.cwd();
    return path.resolve(cwd, relativePath);
}