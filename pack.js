"use strict";
exports.__esModule = true;
var parser_1 = require("@babel/parser");
var traverse_1 = require("@babel/traverse");
var fs = require("fs-extra");
var path = require("path");
var codepath = getAbsolutePath("./src/a.js");
var ast = getAst(codepath);
function resolveDependencies(modulePath, name) {
    var ast = getAst(modulePath);
    var dependency = getTargetDependency(ast, name);
    // console.log(dependency.scope);
    // console.log(dependency.toString());
    // var s = dependency.scope.getBinding("s");
    // console.log(s.referencePaths[0].scope)
    const resolved = {};
    let outerScope = dependency.scope;
    
    dependency.traverse({
        Identifier: function(path){
            const name = path.node.name;
            const scope = path.scope;
            resolved[`${scope.uid}#${name}`] = hasDefined(name, scope);
            // if(
            //     path.parent.type === "FunctionDeclaration" ||
            //     path.parent.type === "ClassDeclaration"
            // ){
            // //     // console.log("name: ", name)
            //     // resolved[`${scope.uid}#${scope.path.node.id.name}`] = false;
            // } else {
            //     resolved[`${scope.uid}#${name}`] = false;
            // }
            // if(name === "b"){
            //     console.log(getParentScope(path));
            // }
            // if(bindings[name]){
            //     resolved[name] = true;
            // } else {
            //     // console.log(name)
            //     resolved[name] = false;
            // };
            // console.log(scope.getAllBindings())
        }
    })
    // for(const scope of Object.values(scopes)){
    //     const bindings = scope.getAllBindings();
    //     for(const key in resolved){
    //         const name = key.split("#")[1];
    //         if(bindings[name]){
    //             console.log(name, bindings[name])
    //             resolved[key] = true;
    //         }
    //     }
    // }
    // dependency.traverse({
    //     Identifier: function(path){
    //         const name = path.node.name;
    //         const scope = path.scope;
    //         const bindings =scope.bindings;
    //         const key = `${scope.uid}#${name}`
    //         console.log(scope.uid, bindings)
    //         if(bindings[name]){
    //             resolved[key] = true;
    //         };
    //     }
    // })
    // console.log(resolved)
    // console.log("*****")
    const dependencyNames = Object.entries(resolved)
        .filter(entry => !entry[1])
        .map(entry => entry[0].split("#")[1]);
        const collector = {};
    for(const dependency of dependencyNames){
        const path = outerScope.bindings[dependency].path;
        collector[dependency] = path.node
    }
    return collector;
}

function hasBindingInScope(name, scope){
    const allBindings = scope.bindings;
    const bindingNames = Object.keys(allBindings);
    for(const bindingName of bindingNames){
        if(name === bindingName){
            // console.log(name, allBindings)
            return true;
        }
    }
    return false;
}

function hasDefined(name, scope){
    if(hasBindingInScope(name, scope)){
        return true;
    } else {
        const parentScope = getParentScope(scope.path,  {stopBeforeProgram: true});
        if(parentScope.uid === scope.uid){
            return false;
        } else {
            return hasDefined(name, parentScope);
        }
    }

}

function getParentScope(path, {stopBeforeProgram}){
    const currentScope = path.scope;
    const parentPath = path.parentPath;
    if(!parentPath){
        return currentScope;
    }
    const parentScope = parentPath.scope;
    if(stopBeforeProgram && parentScope.path.node.type === "Program"){
        return currentScope;
    }
    if(path.node.type === "Program"){
        return currentScope;
    }
    if(parentScope.uid === currentScope.uid){
        return getParentScope(parentPath, {stopBeforeProgram});
    }
    return parentScope;
}


function getTargetDependency(ast, name) {
    var targetDependency;
    traverse_1["default"](ast, {
        Program: function (path) {
            var bodyPath = path.get("body");
            var _loop_1 = function (i) {
                var bodyKey = "body." + i;
                var bodyItemPath = path.get(bodyKey);
                bodyItemPath.traverse({
                    Identifier: function (path) {
                        var node = path.node;
                        if (node.name === name) {
                            path.stop();
                            // console.log("*****************")
                            // console.log(path.scope)
                            targetDependency = bodyItemPath;
                            return;
                        }
                    }
                });
            };
            for (var i = 0; i < bodyPath.length; i++) {
                _loop_1(i);
            }
        }
    });
    return targetDependency;
}
resolveDependencies("./src/a.js", "fn");
function getAst(path) {
    var code = fs.readFileSync(path, "utf8");
    var ast = parser_1.parse(code, {
        sourceType: "module"
    });
    return ast;
}
function getAbsolutePath(relativePath) {
    var cwd = process.cwd();
    return path.resolve(cwd, relativePath);
}
//# sourceMappingURL=pack.js.map