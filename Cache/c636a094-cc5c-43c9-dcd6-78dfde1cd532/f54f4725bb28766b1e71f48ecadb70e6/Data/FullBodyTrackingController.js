// -----JS CODE-----
// FullBodyTrackingController.js
// Version 0.0.1
// Provides API to easilly access Full Body Tracking status, 
// world positions of tracking points with ability to specify camera 
// allows to create composite tracking points 
// Sends custom triggers on tracking started and lost

// @ui {"label":"Sends Behavior custom triggers:"}
// @ui {"label":"FULL_BODY_TRACKING_STARTED"}
// @ui {"label":"FULL_BODY_TRACKING_LOST"}
// @ui {"widget" : "separator"}
// @input bool advanced = false
// @ui {"widget":"group_start", "label" : "Object Tracking Components:", "showIf": "advanced"}
// @input Component.ObjectTracking Nose 
// @input Component.ObjectTracking RightEye 
// @input Component.ObjectTracking LeftEye 
// @input Component.ObjectTracking RightEar 
// @input Component.ObjectTracking LeftEar 
// @input Component.ObjectTracking Neck 
// @ui {"widget" : "separator"}
// @input Component.ObjectTracking RightShoulder 
// @input Component.ObjectTracking RightElbow 
// @input Component.ObjectTracking RightWrist 
// @ui {"widget" : "separator"}
// @input Component.ObjectTracking LeftShoulder
// @input Component.ObjectTracking LeftElbow 
// @input Component.ObjectTracking LeftWrist 
// @ui {"widget" : "separator"}
// @input Component.ObjectTracking LeftHip 
// @input Component.ObjectTracking LeftKnee 
// @input Component.ObjectTracking LeftAnkle 
// @ui {"widget" : "separator"}
// @input Component.ObjectTracking RightHip 
// @input Component.ObjectTracking RightKnee
// @input Component.ObjectTracking RightAnkle 
// @ui {"widget" : "separator"}
// @input bool overrideCamera
// @input Component.Camera customCamera {"showIf": "overrideCamera"}
// @input float depth = 200 {"showIf": "overrideCamera"}
// @ui {"widget" : "separator"}
// @input Component.ScriptComponent hintScript
// @input Asset.Texture deviceCameraTexture 
// @ui {"widget":"group_end"}

const onFoundTrigger = "FULL_BODY_TRACKING_STARTED";
const onLostTrigger = "FULL_BODY_TRACKING_LOST";

const MAX_BODY_SIZE = 0.7;
const CENTER = vec2.zero();

const MIN_LOST_FRAMES = 10;

// Full Body Tracking 

// all tracking point names
const FULL_BODY_IDs = ["Nose", "RightEye", "LeftEye", "RightEar", "LeftEar", "Neck", "LeftHip", "LeftKnee", "LeftAnkle", "RightHip", "RightKnee", "RightAnkle", "LeftShoulder", "LeftElbow", "LeftWrist", "RightShoulder", "RightElbow", "RightWrist"];
// subset of points used to determine if full body tracking or not
const MAIN_POINTS_IDs = ["Neck", "LeftHip", "RightHip", "LeftShoulder", "RightShoulder"];

var FullBodyTracking = function() {

    for (var i = 0; i < MAIN_POINTS_IDs.length; i++) {
        var m_id = MAIN_POINTS_IDs[i];
        if (!script[m_id]) {
            debugPrint("ERROR, " + m_id + " object tracking is not set, [" + m_id + "] Tracking Point was not created. Please check inputs under the advanced tab");
            return;
        }
    }

    for (var j = 0; j < FULL_BODY_IDs.length; j++) {
        var f_id = FULL_BODY_IDs[j];
        if (!script[f_id]) {
            debugPrint("WARNING, " + f_id + " object tracking is not set, [" + f_id + "] Tracking Point was not created. Please check inputs under the advanced tab");
        } else {
            this[f_id] = new BodyPoint(f_id, script[f_id]);
        }
    }

    // add complex points
    this["Hip"] = new MedianBodyPoint("Hip", [this.LeftHip, this.RightHip]);

    this.isTracking = function() {
        for (var i = 0; i < MAIN_POINTS_IDs.length; i++) {
            if (!this[MAIN_POINTS_IDs[i]].isTracking()) {
                return false;
            }
        }
        return true;
    };
    //distance between hip and neck in local space
    this.getBodySize = function() {
        return this.Neck.getLocalPosition().distance(this.Hip.getLocalPosition());
    };
};

global.FullBodyTracking = new FullBodyTracking();

var TrackingState = { NONE: 0, TOO_CLOSE: 1, TRACKING: 2 };

var headIsTracking = false;

if (!checkInputs()) {
    return;
}

var stateMachine = new StateMachine();

stateMachine.addState(TrackingState.NONE, onNoneEnter, null, MIN_LOST_FRAMES);
stateMachine.addState(TrackingState.TOO_CLOSE, onTooCloseEnter, null, MIN_LOST_FRAMES);
stateMachine.addState(TrackingState.TRACKING, onTrackingEnter, onTrackingExit, 0);

//events
script.createEvent("TurnOnEvent").bind(function() {
    if (script.deviceCameraTexture) {
        global.FullBodyTracking.aspect = script.deviceCameraTexture.control.getAspect();
    }
});

script.createEvent("UpdateEvent").bind(function() {
    stateMachine.setState(getCurrentState());
});
script.createEvent("FaceFoundEvent").bind(function() {
    headIsTracking = true;
});
script.createEvent("FaceLostEvent").bind(function() {
    headIsTracking = false;
});

function getCurrentState() {
    if (global.FullBodyTracking.isTracking()) {
        return (global.FullBodyTracking.getBodySize() >= MAX_BODY_SIZE) ? TrackingState.TOO_CLOSE : TrackingState.TRACKING;
    }
    if (headIsTracking) {
        return TrackingState.TOO_CLOSE;
    }
    return TrackingState.NONE;
}
//state change callbacks
function onTrackingEnter() {
    if (global.behaviorSystem) {
        global.behaviorSystem.sendCustomTrigger(onFoundTrigger);
    } else {
        debugPrint("WARNING, Please make sure behavior script exists in order to make custom triggers work");
    }
    if (script.hintScript && script.hintScript.hide) {
        script.hintScript.hide();
    } else {
        debugPrint("WARNING, Hint object is not set");
    }
}

function onTrackingExit() {
    if (global.behaviorSystem) {
        global.behaviorSystem.sendCustomTrigger(onLostTrigger);
    } else {
        debugPrint("WARNING, Please make sure behavior script exists in order to make custom triggers work");
    }
}

function onTooCloseEnter() {
    if (script.hintScript && script.hintScript.show) {
        script.hintScript.show(1);
    } else {
        debugPrint("WARNING, Hint object is not set");
    }
}

function onNoneEnter() {
    if (script.hintScript && script.hintScript.show) {
        script.hintScript.show(0);
    } else {
        debugPrint("WARNING, Hint object is not set");
    }
}

//Body Point function

function BodyPoint(id, trackingPoint) {
    this.name = id;
    this.objectTracking = trackingPoint;
    this.screenTransform = trackingPoint.getSceneObject().getFirstComponent("ScreenTransform");
}

BodyPoint.prototype.isTracking = function() {
    return this.objectTracking.isTracking();
};

BodyPoint.prototype.getWorldPosition = function() {
    if (script.overrideCamera && script.customCamera) {
        var screenPos = this.screenTransform.localPointToScreenPoint(CENTER);
        return script.customCamera.screenSpaceToWorldSpace(screenPos, script.depth);
    } else {
        return this.screenTransform.localPointToWorldPoint(CENTER);
    }
};

BodyPoint.prototype.getScreenPosition = function() {
    return this.screenTransform.localPointToScreenPoint(CENTER);
};

BodyPoint.prototype.getLocalPosition = function() {
    return this.screenTransform.anchors.getCenter();
};

//Median Body Point function

function MedianBodyPoint(id, bodyPoints) {
    for (var i = 0; i < bodyPoints.length; i++) {
        if (bodyPoints[i] === undefined) {
            return null;
        }
    }
    this.id = id;
    this.bodyPoints = bodyPoints;
}

MedianBodyPoint.prototype.isTracking = function() {
    for (var i = 0; i < this.bodyPoints.length; i++) {
        if (!this.bodyPoints[i].isTracking()) {
            return false;
        }
    }
    return true;
};

MedianBodyPoint.prototype.getWorldPosition = function() {
    var middlePoint = vec3.zero();
    for (var i = 0; i < this.bodyPoints.length; i++) {
        middlePoint = middlePoint.add(this.bodyPoints[i].getWorldPosition());
    }
    return middlePoint.uniformScale(1.0 / this.bodyPoints.length);
};

MedianBodyPoint.prototype.getScreenPosition = function() {
    var middlePoint = vec2.zero();
    for (var i = 0; i < this.bodyPoints.length; i++) {
        middlePoint = middlePoint.add(this.bodyPoints[i].getScreenPosition());
    }
    return middlePoint.uniformScale(1.0 / this.bodyPoints.length);
};

MedianBodyPoint.prototype.getLocalPosition = function() {
    var middlePoint = vec2.zero();
    for (var i = 0; i < this.bodyPoints.length; i++) {
        middlePoint = middlePoint.add(this.bodyPoints[i].screenTransform.anchors.getCenter());
    }
    return middlePoint.uniformScale(1.0 / this.bodyPoints.length);
};


function StateMachine() {
    this.states = {};
    this.currentState = undefined;
    this.nextState = undefined;
    this.framesLeft = 0;

    this.addState = function(stateName, onStateEnter, onStateExit, minFrames) {
        this.states[stateName] = {
            onEnter: onStateEnter,
            onExit: onStateExit,
            minFrames: minFrames
        };
    };
    this.setState = function(stateName) {
        if (stateName == this.nextState) {
            this.framesLeft = this.framesLeft > 0 ? this.framesLeft - 1 : 0;
        } else {
            this.nextState = stateName;
            this.framesLeft = this.states[this.nextState].minFrames;
        }
        if (this.currentState != stateName && this.framesLeft == 0) {
            if (this.currentState != undefined && this.states[this.currentState].onExit) {
                this.states[this.currentState].onExit();
            }
            this.currentState = stateName;
            if (this.states[this.currentState].onEnter) {
                this.states[this.currentState].onEnter();
            }
            return;
        }
        
    };
    this.getState = function() {
        return this.currentState;
    };
}

//helper functions
function debugPrint(message) {
    print("[FullBodyTrackingController], " + message);
}

function checkInputs() {
    if (!script.hintScript) {
        debugPrint("WARNING, Hint Script is not set");
    }
    if (!script.deviceCameraTexture) {
        debugPrint("WARNING, Device Camera Texture is not set, camera aspect will be ignored");
    }
    if (!global.FullBodyTracking || !global.FullBodyTracking.isTracking) {
        debugPrint("ERROR, Please make all essential tracking points (" + MAIN_POINTS_IDs + ") are set under the advanced tab");
        return false;
    }
    return true;
}