const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const generator = require("@babel/generator");
const fs = require("fs-extra");
const path = require("path");

const dependencies = {};

const myVisitor = {
    ImportSpecifier(path) {
        const name = path.node.imported.name;
        const source = path.parent.source.value;
        const theDependencies = dependencies[source];
        if (!theDependencies) {
            dependencies[source] = []
        }
        dependencies[source].push(name)
    },
    CallExpression(path) {
        const node = path.node;
        console.log('node :', node);
        const name = path.node.callee.name
        // console.log('node :', node);
        console.log('name :', name);
    }
}
const code = fs.readFileSync("./myJsFile.js", "utf-8");
const ast = parser.parse(code, {
    "sourceType": "module"
});

// console.log('ast :', ast.program.body[0]);

traverse.default(ast, myVisitor)

const dependenciesNodes = {

}

for (const modulePath of Object.keys(dependencies)) {
    packFunction(modulePath, dependencies[modulePath]);
}

function packFunction(modulePath, functionNames) {
    const code = fs.readFileSync(modulePath, "utf-8");
    const ast = parser.parse(code, {
        "sourceType": "module"
    })
    traverse.default(ast, {
        FunctionDeclaration(path) {
            const name = path.node.id.name;
            if (functionNames.includes(name)) {
                if (!dependenciesNodes[modulePath]) {
                    dependenciesNodes[modulePath] = []
                }
                dependenciesNodes[modulePath].push(path.parent)
            }
        }
    })
}

for (const modulePath of Object.keys(dependenciesNodes)) {
    // console.log('path :', path);
    const functionNodes = dependenciesNodes[modulePath];
    let code = "";
    for (const func of functionNodes) {
        // console.log('func.toString() :', generator.default(func));
        code += generator.default(func).code + "\n";
    }
    // console.log('path.resolve("dist", modulePath) :', path.resolve("dist", modulePath));
    // const filePath = path.resolve("dist", modulePath);
    // fs.ensureFileSync(filePath);
    // fs.writeFileSync(filePath, code)
}