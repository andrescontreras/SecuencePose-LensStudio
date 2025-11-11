"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionListener = void 0;
class SelectionListener {
    constructor(script) {
        this.script = script;
        //@ts-ignore
        this.selectedObject = null;
        //@ts-ignore
        this.prevSelectedObject = null;
        this.onSelectionUpdate = () => { };
        //@ts-ignore
        if (typeof Editor !== 'undefined') {
            this.updateEvent = this.script.createEvent("UpdateEvent");
            this.updateEvent.bind(() => {
                if (this.checkForSelectionUpdate()) {
                    this.onSelectionUpdate && this.onSelectionUpdate();
                }
            });
        }
    }
    //@ts-ignore
    getSelectedObject() {
        if (isNull(this.selectedObject)) {
            return null;
        }
        return this.selectedObject;
    }
    setOnSelectionUpdate(cb) {
        this.onSelectionUpdate = cb;
    }
    checkForSelectionUpdate() {
        //@ts-ignore
        if (!(typeof Editor !== 'undefined')) {
            return false;
        }
        const newSelectedObject = this.getSelection();
        if (isNull(newSelectedObject)) {
            this.selectedObject = this.prevSelectedObject;
            return false;
        }
        if (isNull(this.selectedObject)) {
            this.selectedObject = newSelectedObject;
            return true;
        }
        if (this.selectedObject.id.toString() !== newSelectedObject.id.toString()) {
            this.selectedObject = newSelectedObject;
            this.prevSelectedObject = this.selectedObject;
            return true;
        }
        return false;
    }
    //@ts-ignore
    getSelection() {
        //@ts-ignore
        const currentSelection = Editor.context.selection;
        return currentSelection.sceneObjects.length == 1 ? currentSelection.sceneObjects[0] : null;
    }
}
exports.SelectionListener = SelectionListener;
//# sourceMappingURL=SelectionListener.js.map