//https://github.com/eslint/eslint/blob/master/lib/rules/no-use-before-define.js
import {parse} from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
// import traverse from "@babel/traverse";
// import generator from "@babel/generator";
import * as fs from "fs-extra";
import * as path from "path";
import * as _ from "lodash";
import { Node, File, Identifier } from "@babel/types";

interface DependencyNode{
    modulePath: string;
    name: string;
    ast: object;
    dependency: DependencyNode;
}

const codepath: string = getAbsolutePath("./src/a.js");
const ast: object = getAst(codepath);
// const code: string = "var x = 10;function f(){return x}"
// console.log(ast)
function resolveDependencies(modulePath: string, name: string): void{
    const ast = getAst(modulePath);
    const dependency = getTargetDependency(ast, name);
    // console.log(dependency)
    dependency.traverse({
        Identifier(path){
            

            console.log(path.node.name, path.inList)
        }
    })
    // const nameVisitor = {
    //     FunctionDeclaration(path){
    //         // console.log(path.scope.bindings)
    //     },
    //     Identifier(path, state) {
    //         if(path.isReferencedIdentifier()){
    //             console.log(path.scope.bindings)//.map(binding => binding.referencePaths))
    //         }
    //           // ...s
    //     }
    // }
    // traverse(ast, nameVisitor);
}

function getTargetDependency(ast: Node , name:string): NodePath{
    let targetDependency;
    traverse(ast, {
        Program(path){
            const bodyPath = path.get("body");
            for(let i = 0; i < bodyPath.length; i++){
                const bodyKey = `body.${i}`;
                const bodyItemPath = path.get(bodyKey);
                bodyItemPath.traverse({
                    Identifier(path: NodePath){
                        const node = path.node;
                        if(node.name === name){
                            targetDependency = bodyItemPath;
                            return;
                        }
                    }
                });
            }
        }
    })
    // const body = ast.program.body;
    // for(const piece of body){
    //     console.log(piece.traverse)
        // traverse(piece, {
        //     Identifier(path){
        //         if(path.node.name === name){
        //             return path.node
        //         }
        //     }
        // })   
    // }
    return targetDependency;
}

resolveDependencies("./src/a.js", "fn");

function getAst(path: string): object{
    const code: string = fs.readFileSync(path, "utf8");
    const ast: object = parse(code, {
        sourceType: "module"
    });
    return ast;
}

function getAbsolutePath(relativePath: string): string{
    const cwd = process.cwd();
    return path.resolve(cwd, relativePath);
}

