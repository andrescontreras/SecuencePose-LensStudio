// PoseSequenceController.js
// Version: 1.0.0
// Event: Lens Initialized
// Description: Controls a sequence of poses that must be performed in order with minimum hold time

// @input Component.ScriptComponent gestureLibrary
// @input float minimumHoldTime = 1.0 {"label": "Minimum Hold Time (seconds)"}
// @input bool printDebugLog = true

// @ui {"widget": "separator"}
// @ui {"widget": "label", "label": "Sequence Setup:"}
// @input string[] poseSequence = ["TPOSE", "ARMS_UP", "THIRD_POSE_NO_ARMS", "TPOSE"] {"label": "Pose Sequence"}
// @input float threshold = 0.15 {"widget": "slider", "min": 0.0, "max": 1.0, "step": 0.01}

// @ui {"widget": "separator"}
// @ui {"widget": "label", "label": "Triggers for each pose:"}
// @input string[] startTriggers = ["TPOSE_START", "ARMS_UP_START", "THIRD_POSE_NO_ARMS_START", "TPOSE_2_START"] {"label": "Start Triggers"}
// @input string[] endTriggers = ["TPOSE_END", "ARMS_UP_END", "THIRD_POSE_NO_ARMS_END", "TPOSE_2_END"] {"label": "End Triggers"}
// @input string[] completeTriggers = ["TPOSE_COMPLETE", "ARMS_UP_COMPLETE", "THIRD_POSE_NO_ARMS_COMPLETE", "TPOSE_2_COMPLETE"] {"label": "Complete Triggers"}

// @ui {"widget": "separator"}
// @input string sequenceStartTrigger = "SEQUENCE_START" {"label": "Sequence Start Trigger"}
// @input string sequenceCompleteTrigger = "SEQUENCE_COMPLETE" {"label": "Sequence Complete Trigger"}
// @input string sequenceResetTrigger = "SEQUENCE_RESET" {"label": "Sequence Reset Trigger"}

// Sequence states
const SequenceState = {
    WAITING_FOR_START: 0,
    IN_PROGRESS: 1,
    COMPLETED: 2
};

// Pose states
const PoseState = {
    NOT_DETECTED: 0,
    DETECTED: 1,
    HOLDING: 2,
    COMPLETED: 3
};

var currentSequenceState = SequenceState.WAITING_FOR_START;
var currentPoseIndex = 0;
var currentPoseState = PoseState.NOT_DETECTED;
var poseHoldTimer = 0.0;
var gestures = [];

// Validation
if (!global.FullBodyTracking) {
    debugPrint("ERROR: FullBodyTracking not available", true);
    return;
}

if (!script.gestureLibrary || !script.gestureLibrary.getGestureFrames) {
    debugPrint("ERROR: GestureController is not set", true);
    return;
}

if (!global.behaviorSystem) {
    debugPrint("WARNING: Behavior system not available, triggers won't work", true);
}

// Initialize gestures
function initializeGestures() {
    gestures = [];
    for (var i = 0; i < script.poseSequence.length; i++) {
        var gesture = script.gestureLibrary.getGestureFrames([script.poseSequence[i]]);
        if (gesture && gesture.length > 0) {
            gestures.push(gesture[0]);
            debugPrint("Loaded gesture: " + script.poseSequence[i]);
        } else {
            debugPrint("ERROR: Could not load gesture: " + script.poseSequence[i], true);
            return false;
        }
    }
    return true;
}

// Check if current pose is being held
function isCurrentPoseMatching() {
    if (currentPoseIndex >= gestures.length) {
        return false;
    }
    
    return script.gestureLibrary.isMatchingPose(gestures[currentPoseIndex], script.threshold);
}

// Start the sequence
function startSequence() {
    debugPrint("Starting pose sequence");
    currentSequenceState = SequenceState.IN_PROGRESS;
    currentPoseIndex = 0;
    currentPoseState = PoseState.NOT_DETECTED;
    poseHoldTimer = 0.0;
    
    if (global.behaviorSystem) {
        global.behaviorSystem.sendCustomTrigger(script.sequenceStartTrigger);
    }
}

// Reset the sequence
function resetSequence() {
    debugPrint("Resetting pose sequence");
    currentSequenceState = SequenceState.WAITING_FOR_START;
    currentPoseIndex = 0;
    currentPoseState = PoseState.NOT_DETECTED;
    poseHoldTimer = 0.0;
    
    if (global.behaviorSystem) {
        global.behaviorSystem.sendCustomTrigger(script.sequenceResetTrigger);
    }
}

// Complete current pose and move to next
function completePose() {
    var poseName = script.poseSequence[currentPoseIndex];
    debugPrint("Completed pose: " + poseName + " (held for " + poseHoldTimer.toFixed(2) + "s)");
    
    // Send complete trigger for current pose
    if (global.behaviorSystem && currentPoseIndex < script.completeTriggers.length) {
        global.behaviorSystem.sendCustomTrigger(script.completeTriggers[currentPoseIndex]);
    }
    
    // Send end trigger for current pose
    if (global.behaviorSystem && currentPoseIndex < script.endTriggers.length) {
        global.behaviorSystem.sendCustomTrigger(script.endTriggers[currentPoseIndex]);
    }
    
    currentPoseIndex++;
    
    // Check if sequence is complete
    if (currentPoseIndex >= script.poseSequence.length) {
        completeSequence();
    } else {
        // Move to next pose
        currentPoseState = PoseState.NOT_DETECTED;
        poseHoldTimer = 0.0;
        debugPrint("Next pose: " + script.poseSequence[currentPoseIndex]);
    }
}

// Complete the entire sequence
function completeSequence() {
    debugPrint("Sequence completed!");
    currentSequenceState = SequenceState.COMPLETED;
    
    if (global.behaviorSystem) {
        global.behaviorSystem.sendCustomTrigger(script.sequenceCompleteTrigger);
    }
}

// Update function
function onUpdate() {
    if (currentSequenceState === SequenceState.WAITING_FOR_START || 
        currentSequenceState === SequenceState.COMPLETED) {
        return;
    }
    
    if (!global.FullBodyTracking.isTracking()) {
        // If tracking is lost, reset current pose progress but don't reset entire sequence
        if (currentPoseState === PoseState.HOLDING) {
            debugPrint("Tracking lost, resetting current pose progress");
            currentPoseState = PoseState.NOT_DETECTED;
            poseHoldTimer = 0.0;
            
            // Send end trigger for current pose
            if (global.behaviorSystem && currentPoseIndex < script.endTriggers.length) {
                global.behaviorSystem.sendCustomTrigger(script.endTriggers[currentPoseIndex]);
            }
        }
        return;
    }
    
    var isPoseMatching = isCurrentPoseMatching();
    
    switch (currentPoseState) {
        case PoseState.NOT_DETECTED:
            if (isPoseMatching) {
                debugPrint("Detected pose: " + script.poseSequence[currentPoseIndex]);
                currentPoseState = PoseState.DETECTED;
                poseHoldTimer = 0.0;
                
                // Send start trigger for current pose
                if (global.behaviorSystem && currentPoseIndex < script.startTriggers.length) {
                    global.behaviorSystem.sendCustomTrigger(script.startTriggers[currentPoseIndex]);
                }
            }
            break;
            
        case PoseState.DETECTED:
            if (isPoseMatching) {
                currentPoseState = PoseState.HOLDING;
                poseHoldTimer = 0.0;
                debugPrint("Holding pose: " + script.poseSequence[currentPoseIndex]);
            } else {
                currentPoseState = PoseState.NOT_DETECTED;
                debugPrint("Lost pose: " + script.poseSequence[currentPoseIndex]);
                
                // Send end trigger for current pose
                if (global.behaviorSystem && currentPoseIndex < script.endTriggers.length) {
                    global.behaviorSystem.sendCustomTrigger(script.endTriggers[currentPoseIndex]);
                }
            }
            break;
            
        case PoseState.HOLDING:
            if (isPoseMatching) {
                poseHoldTimer += getDeltaTime();
                
                if (poseHoldTimer >= script.minimumHoldTime) {
                    currentPoseState = PoseState.COMPLETED;
                    completePose();
                }
            } else {
                debugPrint("Lost pose while holding: " + script.poseSequence[currentPoseIndex] + " (held for " + poseHoldTimer.toFixed(2) + "s)");
                currentPoseState = PoseState.NOT_DETECTED;
                poseHoldTimer = 0.0;
                
                // Send end trigger for current pose
                if (global.behaviorSystem && currentPoseIndex < script.endTriggers.length) {
                    global.behaviorSystem.sendCustomTrigger(script.endTriggers[currentPoseIndex]);
                }
            }
            break;
    }
}

// Public API
script.startSequence = startSequence;
script.resetSequence = resetSequence;
script.getCurrentPose = function() {
    return currentPoseIndex < script.poseSequence.length ? script.poseSequence[currentPoseIndex] : null;
};
script.getCurrentPoseProgress = function() {
    return poseHoldTimer / script.minimumHoldTime;
};
script.getSequenceState = function() {
    return currentSequenceState;
};
script.isSequenceComplete = function() {
    return currentSequenceState === SequenceState.COMPLETED;
};

// Debug function
function debugPrint(message, force) {
    if (script.printDebugLog || force) {
        print("[PoseSequenceController] " + message);
    }
}

// Initialize
if (initializeGestures()) {
    script.createEvent("UpdateEvent").bind(onUpdate);
    debugPrint("PoseSequenceController initialized with " + gestures.length + " poses");
    
    // Auto-start sequence when body tracking begins
    if (global.behaviorSystem) {
        global.behaviorSystem.addCustomTriggerResponse("FULL_BODY_TRACKING_STARTED", startSequence);
        global.behaviorSystem.addCustomTriggerResponse("FULL_BODY_TRACKING_LOST", resetSequence);
    }
} else {
    debugPrint("Failed to initialize PoseSequenceController", true);
}
