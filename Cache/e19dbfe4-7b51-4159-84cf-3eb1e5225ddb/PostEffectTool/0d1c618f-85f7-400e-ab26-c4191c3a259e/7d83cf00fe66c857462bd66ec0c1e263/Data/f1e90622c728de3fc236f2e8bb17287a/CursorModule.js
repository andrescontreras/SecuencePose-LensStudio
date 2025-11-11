"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCursorTexture = exports.setCursorTexture = exports.setInfo = exports.lastPriority = exports.lastRotation = exports.lastCursorID = void 0;
const CursorData_1 = require("./CursorData");
exports.lastCursorID = "";
exports.lastRotation = 0;
exports.lastPriority = 100000;
let requestsQueue = [];
let isActiveProcessing = false;
function setInfo(id, rotation, priority) {
    exports.lastCursorID = id;
    exports.lastRotation = rotation;
    exports.lastPriority = priority;
}
exports.setInfo = setInfo;
function setCursorTexture(texture) {
    requestsQueue.push([CursorData_1.RequestType.SetCursor, texture]);
    if (!isActiveProcessing && requestsQueue.length) {
        startProcessing();
    }
}
exports.setCursorTexture = setCursorTexture;
function resetCursorTexture() {
    requestsQueue.push([CursorData_1.RequestType.UnsetCursor, null]);
    if (!isActiveProcessing && requestsQueue.length) {
        startProcessing();
    }
}
exports.resetCursorTexture = resetCursorTexture;
function startProcessing() {
    isActiveProcessing = true;
    const request = requestsQueue.shift();
    performRequest(request[0], request[1]).then(() => {
        if (requestsQueue.length) {
            startProcessing();
        }
        else {
            isActiveProcessing = false;
        }
    }).catch((err) => {
        print("Failed to perform request " + request[0] + ". Reason: " + err);
    });
}
async function performRequest(requestType, texture = null) {
    const request = RemoteApiRequest.create();
    request.endpoint = requestType;
    if (requestType === CursorData_1.RequestType.SetCursor) {
        if (!texture) {
            throw new Error("No Texture Provided For Cursor");
        }
        request.uriResources = [await convertTexture(texture)];
    }
    CursorData_1.CursorRemoteServiceModule.performApiRequest(request, (response) => {
        if (response.statusCode !== 200) {
            print("Cursor request failed: " + response.body);
        }
    });
}
async function convertTexture(texture) {
    //@ts-ignore
    return CursorData_1.CursorRemoteMediaModule.createImageResourceForTexture(texture, CursorData_1.CursorTextureUploadOptions);
}
//# sourceMappingURL=CursorModule.js.map