if (script.onAwake) {
	script.onAwake();
	return;
};
function checkUndefined(property, showIfData){
   for (var i = 0; i < showIfData.length; i++){
       if (showIfData[i][0] && script[showIfData[i][0]] != showIfData[i][1]){
           return;
       }
   }
   if (script[property] == undefined){
      throw new Error('Input ' + property + ' was not provided for the object ' + script.getSceneObject().name);
   }
}
// @input float priority = 0
checkUndefined("priority", []);
// @input int cursorType {"widget":"combobox", "values":[{"label":"Canvas", "value":0}, {"label":"ClosedHand", "value":1}, {"label":"OpenHand", "value":2}, {"label":"Rotation", "value":3}, {"label":"Scale", "value":4}, {"label":"ZoomIn", "value":5}, {"label":"ZoomOut", "value":6}, {"label":"Default", "value":7}, {"label":"Custom", "value":8}]}
checkUndefined("cursorType", []);
// @input Asset.Texture cursorTexture {"showIf":"cursorType", "showIfValue":8}
checkUndefined("cursorTexture", [["cursorType",8]]);
// @input int rotationType {"widget":"combobox", "values":[{"label":"Custom", "value":0}, {"label":"Lock To World Rotation", "value":1}]}
checkUndefined("rotationType", []);
// @input float rotation = 0 {"showIf":"rotationType", "showIfValue":0}
checkUndefined("rotation", [["rotationType",0]]);
// @input float rotationOffset = 0 {"showIf":"rotationType", "showIfValue":1}
checkUndefined("rotationOffset", [["rotationType",1]]);
// @input int triggerType {"widget":"combobox", "values":[{"label":"onHover", "value":0}, {"label":"onTouch", "value":1}, {"label":"onPinch", "value":2}, {"label":"onPan", "value":3}, {"label":"Custom", "value":4}]}
checkUndefined("triggerType", []);
// @input Asset.Texture[] macIconTextures
checkUndefined("macIconTextures", []);
// @input Asset.Texture[] winIconTextures
checkUndefined("winIconTextures", []);
var scriptPrototype = Object.getPrototypeOf(script);
if (!global.BaseScriptComponent){
   function BaseScriptComponent(){}
   global.BaseScriptComponent = BaseScriptComponent;
   global.BaseScriptComponent.prototype = scriptPrototype;
   global.BaseScriptComponent.prototype.__initialize = function(){};
   global.BaseScriptComponent.getTypeName = function(){
       throw new Error("Cannot get type name from the class, not decorated with @component");
   }
}
var Module = require("../../../../../Modules/Src/Src/Scripts/Editor/MouseCursor/Cursor");
Object.setPrototypeOf(script, Module.Cursor.prototype);
script.__initialize();
if (script.onAwake) {
   script.onAwake();
}
