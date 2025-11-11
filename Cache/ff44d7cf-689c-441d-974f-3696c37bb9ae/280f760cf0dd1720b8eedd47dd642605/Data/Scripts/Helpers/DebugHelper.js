// DebugHelper.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Enable / disable objects on tap, logs out debug message

// @input bool showDebugJoints
// @input bool advanced
// @input SceneObject[] debugObjects {"showIf":"advanced","showIfValue":"true"}

function toggleObjects() {
   
    for (var i = 0; i < script.debugObjects.length; i++) {
        if (script.debugObjects[i]) {          
            script.debugObjects[i].enabled = script.showDebugJoints;
        }
    }
}

toggleObjects();