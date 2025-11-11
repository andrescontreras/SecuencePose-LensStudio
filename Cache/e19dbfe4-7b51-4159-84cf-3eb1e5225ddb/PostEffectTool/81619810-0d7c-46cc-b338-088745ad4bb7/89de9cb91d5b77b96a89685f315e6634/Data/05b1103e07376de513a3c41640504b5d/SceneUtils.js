"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneUtils = void 0;
var SceneUtils;
(function (SceneUtils) {
    //@ts-ignore
    function findObjectInLensStudio(sceneObjectToFind) {
        if (!sceneObjectToFind) {
            // print("You get what you give");
            return null;
        }
        const pathToObject = [sceneObjectToFind];
        while (sceneObjectToFind.hasParent()) {
            sceneObjectToFind = sceneObjectToFind.getParent();
            pathToObject.push(sceneObjectToFind);
        }
        sceneObjectToFind = pathToObject.pop();
        //@ts-ignore
        let root;
        //@ts-ignore
        Editor.context.scene.sceneObjects.forEach((sceneObject) => {
            //@ts-ignore
            const id = Editor.Engine.idToUniqueIdentifier(sceneObject.id);
            if (sceneObjectToFind.uniqueIdentifier === id) {
                root = sceneObject;
            }
        });
        if (!root) {
            // print("Couldn't find object in LS scene");
            return null;
        }
        while (pathToObject.length) {
            sceneObjectToFind = pathToObject.pop();
            let newRoot = null;
            root.children.forEach((sceneObject) => {
                //@ts-ignore
                const id = Editor.Engine.idToUniqueIdentifier(sceneObject.id);
                if (sceneObjectToFind.uniqueIdentifier === id) {
                    newRoot = sceneObject;
                }
            });
            if (!newRoot) {
                // print("Couldn't find object in LS scene");
                return null;
            }
            root = newRoot;
        }
        return root;
    }
    SceneUtils.findObjectInLensStudio = findObjectInLensStudio;
    //@ts-ignore
    function findObjectInLensCore(sceneObjectToFind) {
        if (!sceneObjectToFind) {
            // print("You get what you give");
            return null;
        }
        //@ts-ignore
        const pathToObject = [sceneObjectToFind];
        while (sceneObjectToFind.getParent()) {
            sceneObjectToFind = sceneObjectToFind.getParent();
            pathToObject.push(sceneObjectToFind);
        }
        sceneObjectToFind = pathToObject.pop();
        const rootObjectsCount = global.scene.getRootObjectsCount();
        let root;
        for (let i = 0; i < rootObjectsCount; i++) {
            const sceneObject = global.scene.getRootObject(i);
            //@ts-ignore
            const uuid = Editor.Engine.idFromUniqueIdentifier(sceneObject.uniqueIdentifier).toString();
            if (sceneObjectToFind.id.toString() === uuid) {
                root = sceneObject;
            }
        }
        if (!root) {
            // print("Couldn't find object in Lens scene");
            return null;
        }
        while (pathToObject.length) {
            sceneObjectToFind = pathToObject.pop();
            let newRoot = null;
            root.children.forEach((sceneObject) => {
                //@ts-ignore
                const uuid = Editor.Engine.idFromUniqueIdentifier(sceneObject.uniqueIdentifier).toString();
                if (sceneObjectToFind.id.toString() === uuid) {
                    newRoot = sceneObject;
                }
            });
            if (!root) {
                // print("Couldn't find object in Lens scene");
                return null;
            }
            root = newRoot;
        }
        return root;
    }
    SceneUtils.findObjectInLensCore = findObjectInLensCore;
    function printHierarchyFromRoot(object) {
        while (object.hasParent()) {
            object = object.getParent();
        }
        dfsPrintHierarchy(object);
    }
    SceneUtils.printHierarchyFromRoot = printHierarchyFromRoot;
    function dfsPrintHierarchy(root, level = 0) {
        let str = "";
        for (let i = 0; i < level; i++) {
            str += "-";
        }
        // print(str + root.name + " <> " + root.uniqueIdentifier);
        root.children.forEach((child) => {
            dfsPrintHierarchy(child, level + 1);
        });
    }
})(SceneUtils || (exports.SceneUtils = SceneUtils = {}));
//# sourceMappingURL=SceneUtils.js.map