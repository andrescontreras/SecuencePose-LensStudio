"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cursor = void 0;
var __selfType = requireType("./Cursor");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const CursorData_1 = require("./CursorData");
const CursorModule_1 = require("./CursorModule");
const CursorUtils_1 = require("./CursorUtils");
let Cursor = class Cursor extends BaseScriptComponent {
    // In radians
    setRotation(angle) {
        this.rotation = angle * 180 / Math.PI;
        this.tryUpdateCursor();
    }
    setCursorType(cursorType) {
        this.cursorType = cursorType;
        this.tryUpdateCursor();
    }
    tryUpdateCursor() {
        if (this.isSet) {
            (0, CursorModule_1.setCursorTexture)(this.prepareTexture());
        }
    }
    getTexture() {
        if (this.cursorType === CursorData_1.CursorType.Custom) {
            return this.cursorTexture;
        }
        if (global.deviceInfoSystem.getOS() === OS.MacOS) {
            return this.macIconTextures[this.cursorType];
        }
        if (global.deviceInfoSystem.getOS() === OS.Windows) {
            return this.winIconTextures[this.cursorType];
        }
        throw new Error("Your OS isn't supported");
    }
    prepareTexture() {
        this.cropTextureProvider.inputTexture = this.getTexture();
        if (this.rotationType === CursorData_1.RotationType.Custom) {
            this.cropTextureProvider.rotation = CursorUtils_1.CursorUtils.degToRad(this.rotation);
        }
        else {
            this.cropTextureProvider.rotation = this.transform.getWorldRotation().toEulerAngles().z + CursorUtils_1.CursorUtils.degToRad(this.rotationOffset);
        }
        return this.cropTexture;
    }
    setupTriggers() {
        const interactionComponent = this.getSceneObject().getComponent("InteractionComponent");
        const onStart = () => {
            if (CursorModule_1.lastPriority < this.priority) {
                return;
            }
            this.isSet = true;
            (0, CursorModule_1.setCursorTexture)(this.prepareTexture());
            (0, CursorModule_1.setInfo)(this.id, this.cropTextureProvider.rotation, this.priority);
        };
        const onChange = () => {
            if (CursorModule_1.lastPriority < this.priority) {
                return;
            }
            const texture = this.prepareTexture(); // need to do this before 'if' to have updated rotation
            if (this.id !== CursorModule_1.lastCursorID || this.cropTextureProvider.rotation !== CursorModule_1.lastRotation) {
                this.isSet = true;
                (0, CursorModule_1.setCursorTexture)(texture);
                (0, CursorModule_1.setInfo)(this.id, this.cropTextureProvider.rotation, this.priority);
            }
        };
        const onEnd = () => {
            if (this.id !== CursorModule_1.lastCursorID) {
                return;
            }
            (0, CursorModule_1.resetCursorTexture)();
            (0, CursorModule_1.setInfo)("", 0, 100000);
            this.isSet = false;
        };
        if (!CursorUtils_1.CursorUtils.isEditor()) {
            if (interactionComponent) {
                interactionComponent.onTouchStart.add(onStart);
                interactionComponent.onTouchMove.add(onChange);
                interactionComponent.onTouchEnd.add(onEnd);
            }
            else {
                this.createEvent("TouchStartEvent").bind(onStart);
                this.createEvent("TouchMoveEvent").bind(onChange);
                this.createEvent("TouchEndEvent").bind(onEnd);
            }
            return;
        }
        switch (this.triggerType) {
            case CursorData_1.TriggerType.onTouch:
                if (interactionComponent) {
                    interactionComponent.onTouchStart.add(onStart);
                    interactionComponent.onTouchMove.add(onChange);
                    interactionComponent.onTouchEnd.add(onEnd);
                }
                else {
                    this.createEvent("TouchStartEvent").bind(onStart);
                    this.createEvent("TouchMoveEvent").bind(onChange);
                    this.createEvent("TouchEndEvent").bind(onEnd);
                }
                break;
            case CursorData_1.TriggerType.onHover:
                if (interactionComponent) {
                    interactionComponent.onHoverStart.add(onStart);
                    interactionComponent.onTouchMove.add(onChange); // There are no hover move events when touch is active
                    interactionComponent.onHover.add(onChange);
                    interactionComponent.onHoverEnd.add(onEnd);
                }
                else {
                    this.createEvent("HoverStartEvent").bind(onStart);
                    this.createEvent("TouchMoveEvent").bind(onChange); // There are no hover move events when touch is active
                    this.createEvent("HoverEvent").bind(onChange);
                    this.createEvent("HoverEndEvent").bind(onEnd);
                }
                break;
            case CursorData_1.TriggerType.onPan:
                if (interactionComponent) {
                    interactionComponent.onPanStart.add(onStart);
                    interactionComponent.onPanMove.add(onChange);
                    interactionComponent.onPanEnd.add(onEnd);
                }
                else {
                    this.createEvent("PanGestureStartEvent").bind(onStart);
                    this.createEvent("PanGestureMoveEvent").bind(onChange);
                    this.createEvent("PanGestureEndEvent").bind(onEnd);
                }
                break;
            case CursorData_1.TriggerType.onPinch:
                if (interactionComponent) {
                    interactionComponent.onPinchStart.add(onStart);
                    interactionComponent.onPinchMove.add(onChange);
                    interactionComponent.onPinchEnd.add(onEnd);
                }
                else {
                    this.createEvent("PinchGestureStartEvent").bind(onStart);
                    this.createEvent("PinchGestureMoveEvent").bind(onChange);
                    this.createEvent("PinchGestureEndEvent").bind(onEnd);
                }
                break;
            case CursorData_1.TriggerType.Custom:
                this.start = onStart;
                this.change = onChange;
                this.end = onEnd;
                break;
            default:
                throw new Error("Trigger type not implemented");
        }
    }
    createCropTexture() {
        this.cropTexture = global.assetSystem.createAsset("Asset.Texture");
        this.cropTexture.control = global.scene.createResourceProvider("Provider.RectCropTextureProvider");
        this.cropTextureProvider = this.cropTexture.control;
    }
    __initialize() {
        super.__initialize();
        this.isSet = false;
        this.start = () => { };
        this.change = () => { };
        this.end = () => { };
        this.onAwake = () => {
            this.transform = this.getTransform();
            this.id = this.uniqueIdentifier;
            this.createCropTexture();
            this.setupTriggers();
        };
    }
};
exports.Cursor = Cursor;
exports.Cursor = Cursor = __decorate([
    component
], Cursor);
//# sourceMappingURL=Cursor.js.map