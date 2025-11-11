"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
var Utils;
(function (Utils) {
    function isEditor() {
        //@ts-ignore
        return typeof Editor !== 'undefined';
    }
    Utils.isEditor = isEditor;
})(Utils || (exports.Utils = Utils = {}));
//# sourceMappingURL=Utils.js.map