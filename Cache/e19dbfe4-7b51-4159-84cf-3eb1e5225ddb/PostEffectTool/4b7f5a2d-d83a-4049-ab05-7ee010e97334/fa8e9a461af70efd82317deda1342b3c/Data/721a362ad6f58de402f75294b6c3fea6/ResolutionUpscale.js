"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolutionUpscale = void 0;
var __selfType = requireType("./ResolutionUpscale");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let ResolutionUpscale = class ResolutionUpscale extends BaseScriptComponent {
    onAwake() {
        this.renderTargetProvider = this.renderTarget.control;
        this.createEvent("UpdateEvent").bind(() => this.upscaleRenderTarget(this.renderTargetProvider, this.deviceCamera));
    }
    upscaleRenderTarget(renderTargetProvider, deviceCamera) {
        if (deviceCamera.control.getWidth() == this.prevResolution.x && deviceCamera.control.getHeight() == this.prevResolution.y) {
            return;
        }
        this.prevResolution.x = deviceCamera.control.getWidth();
        this.prevResolution.y = deviceCamera.control.getHeight();
        if (this.prevResolution.x * this.prevResolution.y > this.maxPixelCount) {
            return;
        }
        const aspect = deviceCamera.control.getAspect();
        let pixelCnt = Math.sqrt(this.maxPixelCount / aspect);
        pixelCnt = Math.min(pixelCnt, this.maxWidth);
        if (pixelCnt * aspect > this.maxWidth) {
            pixelCnt = this.maxWidth / aspect;
        }
        this.resolution.x = Math.round(pixelCnt * aspect);
        this.resolution.y = Math.round(pixelCnt);
        renderTargetProvider.resolution = this.resolution;
    }
    __initialize() {
        super.__initialize();
        this.maxPixelCount = 6000000;
        this.resolution = new vec2(0, 0);
        this.prevResolution = new vec2(0, 0);
        this.maxWidth = 8000;
    }
};
exports.ResolutionUpscale = ResolutionUpscale;
exports.ResolutionUpscale = ResolutionUpscale = __decorate([
    component
], ResolutionUpscale);
//# sourceMappingURL=ResolutionUpscale.js.map