// MovementTrigger.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Detects if full body movement gestures matche the preset and send out triggers if so.



// @input string moveType = "gesture" {"label" : "Movement Type",  "widget" : "combobox", "values" : [{"label" : "Touch Screen Trigger", "value" : "touchScreenTrigger"}, {"label" : "Distance Check", "value" : "distanceCheck"}, {"label" : "Gesture", "value" : "gesture"}]}
// @input Component.ScriptComponent gestureLibrary {"showIf" : "moveType", "showIfValue" : "gesture"}
// @input string[] gestureNames {"showIf" : "moveType", "showIfValue" : "gesture", "label" : "Gesture Poses"}
// @input string jointName1 = "Nose" { "widget":"combobox","values":[{ "label" : "Nose" , "value" : "Nose"},{ "label" : "Right Eye" , "value" : "RightEye"},{ "label" : "Left Eye" , "value" : "LeftEye"},{ "label" : "Right Ear" , "value" : "RightEar"},{ "label" : "Left Ear" , "value" : "LeftEar"},{ "label" : "Neck" , "value" : "Neck"},{ "label" : "Left Hip" , "value" : "LeftHip"},{ "label" : "Left Knee" , "value" : "LeftKnee"},{ "label" : "Left Ankle" , "value" : "LeftAnkle"},{ "label" : "Right Hip" , "value" : "RightHip"},{ "label" : "Right Knee" , "value" : "RightKnee"},{ "label" : "Right Ankle" , "value" : "RightAnkle"},{ "label" : "Left Shoulder" , "value" : "LeftShoulder"},{ "label" : "Left Elbow" , "value" : "LeftElbow"},{ "label" : "Left Wrist" , "value" : "LeftWrist"},{ "label" : "Right Shoulder" , "value" : "RightShoulder"},{ "label" : "Right Elbow" , "value" : "RightElbow"},{ "label" : "Right Wrist" , "value" : "RightWrist"},{ "label" : "Hip" , "value" : "Hip"},{ "label" : "Eye Center" , "value" : "EyeCenter"}],"showIf" : "moveType", "showIfValue" : "distanceCheck"}
// @input string jointName2 = "Nose" { "widget":"combobox","values":[{ "label" : "Nose" , "value" : "Nose"},{ "label" : "Right Eye" , "value" : "RightEye"},{ "label" : "Left Eye" , "value" : "LeftEye"},{ "label" : "Right Ear" , "value" : "RightEar"},{ "label" : "Left Ear" , "value" : "LeftEar"},{ "label" : "Neck" , "value" : "Neck"},{ "label" : "Left Hip" , "value" : "LeftHip"},{ "label" : "Left Knee" , "value" : "LeftKnee"},{ "label" : "Left Ankle" , "value" : "LeftAnkle"},{ "label" : "Right Hip" , "value" : "RightHip"},{ "label" : "Right Knee" , "value" : "RightKnee"},{ "label" : "Right Ankle" , "value" : "RightAnkle"},{ "label" : "Left Shoulder" , "value" : "LeftShoulder"},{ "label" : "Left Elbow" , "value" : "LeftElbow"},{ "label" : "Left Wrist" , "value" : "LeftWrist"},{ "label" : "Right Shoulder" , "value" : "RightShoulder"},{ "label" : "Right Elbow" , "value" : "RightElbow"},{ "label" : "Right Wrist" , "value" : "RightWrist"},{ "label" : "Hip" , "value" : "Hip"},{ "label" : "Eye Center" , "value" : "EyeCenter"}],"showIf" : "moveType", "showIfValue" : "distanceCheck"}

// @input Component.ScreenTransform screenTrigger  {"showIf" : "moveType", "showIfValue" : "touchScreenTrigger"}
// @input string jointName = "Nose" { "widget":"combobox","values":[{ "label" : "Nose" , "value" : "Nose"},{ "label" : "Right Eye" , "value" : "RightEye"},{ "label" : "Left Eye" , "value" : "LeftEye"},{ "label" : "Right Ear" , "value" : "RightEar"},{ "label" : "Left Ear" , "value" : "LeftEar"},{ "label" : "Neck" , "value" : "Neck"},{ "label" : "Left Hip" , "value" : "LeftHip"},{ "label" : "Left Knee" , "value" : "LeftKnee"},{ "label" : "Left Ankle" , "value" : "LeftAnkle"},{ "label" : "Right Hip" , "value" : "RightHip"},{ "label" : "Right Knee" , "value" : "RightKnee"},{ "label" : "Right Ankle" , "value" : "RightAnkle"},{ "label" : "Left Shoulder" , "value" : "LeftShoulder"},{ "label" : "Left Elbow" , "value" : "LeftElbow"},{ "label" : "Left Wrist" , "value" : "LeftWrist"},{ "label" : "Right Shoulder" , "value" : "RightShoulder"},{ "label" : "Right Elbow" , "value" : "RightElbow"},{ "label" : "Right Wrist" , "value" : "RightWrist"},{ "label" : "Hip" , "value" : "Hip"},{ "label" : "Eye Center" , "value" : "EyeCenter"}], "showIf" : "moveType", "showIfValue" : "touchScreenTrigger"}

// @ui {"widget" : "separator"}

// @input float threshold = 0.15 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}
// @ui {"widget" : "separator"}
// @input string[] startTrigger
// @input string[] completeTrigger
// @input bool hasEndTime
// @input float effectLength = 1 {"showIf" : "hasEndTime", "showIfValue" : "true"}

// @ui {"widget" : "separator"}
// @input bool printDebugLog

const CENTER = vec2.zero();

var aspect;

var movementStarted = false;
var startDelayTimer = 0;
var endTimeCounter = 0;
var keepPoseForTime = 0.02;

var isMultiFrameGesture = script.moveType == "gesture" && script.gestureNames.length > 1;
var curFrameIndex = 0;

if (!global.FullBodyTracking) {
    debugPrint("ERROR, [Full Body Tracking Controller] script is not available", true);
    return;
}
if (!global.behaviorSystem) {
    debugPrint("WARNING, Please make sure behavior script exists in order to make custom triggers work", true);
}

var isMatching = getMatchingFunction();

script.createEvent("UpdateEvent").bind(OnUpdate);

function getMatchingFunction() {
    switch (script.moveType) {
        case "gesture":
            if (!script.gestureLibrary || !script.gestureLibrary.getGestureFrames) {
                debugPrint("ERROR, GestureController is not set", true);
                return null;
            }

            var gesture = script.gestureLibrary.getGestureFrames(script.gestureNames);
            if (gesture == null) {
                return null;
            }

            return function(g) {
                return function() {
                    return isMatchingGesture(g);
                };
            }(gesture);
        case "touchScreenTrigger":
            return function(st, j) {
                return function() {
                    if (!j || !st || !j.isTracking()) {
                        return false;
                    } else {
                        var dir = j.getScreenPosition().sub(st.localPointToScreenPoint(CENTER));
                        dir.x *= aspect;
                        return dir.length < script.threshold;
                    }
                };
            }(script.screenTrigger, global.FullBodyTracking[script.jointName]);
        case "distanceCheck":
            return function(j1, j2) {
                return function() {
                    if (!j1 || !j1.isTracking() || !j2 || !j2.isTracking()) {
                        return false;
                    } else {
                        //switch here to other kind of distance
                        var dir = j1.getScreenPosition().sub(j2.getScreenPosition());
                        dir.x *= aspect;
                        return dir.length < script.threshold;
                    }
                };
            }(global.FullBodyTracking[script.jointName1], global.FullBodyTracking[script.jointName2]);
    }
}

function OnUpdate() {
    if (isMatching === null) {
        return;
    }

    if (aspect == undefined) {
        aspect = global.FullBodyTracking.aspect;
    }

    if (script.hasEndTime && movementStarted) {
        if (endTimeCounter > script.effectLength) {
            end();
        } else {
            endTimeCounter += getDeltaTime();
        }
        return;
    }

    if (isMatching()) {
        if (!movementStarted) {
            if (startDelayTimer > keepPoseForTime) {
                start();
            } else {
                startDelayTimer += getDeltaTime();
            }
        }
    } else {
        if (!isMultiFrameGesture && movementStarted && !script.hasEndTime) {
            end();
        }
    }

    if (isMultiFrameGesture && (curFrameIndex > (script.gestureNames.length - 1)) && movementStarted) {
        end();
    }

}

function start() {
    debugPrint("movement started");

    for (var i = 0; i < script.startTrigger.length; i++) {
        global.behaviorSystem.sendCustomTrigger(script.startTrigger[i]);
    }

    movementStarted = true;
    startDelayTimer = 0.0;
    endTimeCounter = 0.0;
}

function end() {
    debugPrint("movement ended");

    for (var i = 0; i < script.completeTrigger.length; i++) {
        global.behaviorSystem.sendCustomTrigger(script.completeTrigger[i]);
    }

    movementStarted = false;
    startDelayTimer = 0.0;
    endTimeCounter = 0.0;
    curFrameIndex = 0;
}

function isMatchingGesture(gesture) {
    if (curFrameIndex < 0 || curFrameIndex > gesture.length) {
        return false;
    }

    var frameMatched = script.gestureLibrary.isMatchingPose(gesture[curFrameIndex], script.threshold);

    if (frameMatched && gesture.length > 1) {
        curFrameIndex = curFrameIndex + 1;
    }

    return frameMatched;
}

function debugPrint(msg, force) {
    if (script.printDebugLog || force) {
        print("[MovementTrigger] " + script.getSceneObject().name + ": " + msg);
    }
}