"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectEditor = void 0;
var __selfType = requireType("./EffectEditor");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SelectionListener_1 = require("./SelectionListener");
const SceneUtils_1 = require("./SceneUtils");
let EffectEditor = class EffectEditor extends BaseScriptComponent {
    onAwake() {
        this.defaultMaterial = this.postEffect.mainMaterial;
        this.setupSelectionListener();
        this.createEvent("UpdateEvent").bind(() => {
            this.listenForChanges();
        });
    }
    setupSelectionListener() {
        this.selectionListener = new SelectionListener_1.SelectionListener(this);
        this.selectionListener.setOnSelectionUpdate(() => {
            this.update();
        });
    }
    update() {
        this.selectedObject = SceneUtils_1.SceneUtils.findObjectInLensCore(this.selectionListener.getSelectedObject());
        if (isNull(this.selectedObject)) {
            return;
        }
        this.postEffect.mainMaterial = this.defaultMaterial;
    }
    listenForChanges() {
        if (isNull(this.selectedObject)) {
            this.editorObject.enabled = false;
            this.defaultTextObject.enabled = true;
            return;
        }
        let postEffectComponents = this.selectedObject.getComponents("PostEffectVisual");
        if (postEffectComponents.length != 1) {
            this.editorObject.enabled = false;
            this.defaultTextObject.enabled = true;
            return;
        }
        this.defaultTextObject.enabled = false;
        this.editorObject.enabled = true;
        let selectedObjectMaterial = postEffectComponents[0].mainMaterial;
        if (selectedObjectMaterial) {
            if (!selectedObjectMaterial.isSame(this.postEffect.mainMaterial)) {
                this.postEffect.mainMaterial = selectedObjectMaterial;
            }
        }
        else {
            this.postEffect.mainMaterial = this.defaultMaterial;
        }
    }
};
exports.EffectEditor = EffectEditor;
exports.EffectEditor = EffectEditor = __decorate([
    component
], EffectEditor);
//# sourceMappingURL=EffectEditor.js.map