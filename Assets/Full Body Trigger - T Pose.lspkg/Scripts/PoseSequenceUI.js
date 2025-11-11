// PoseSequenceUI.js
// Version: 1.0.0
// Event: Lens Initialized
// Description: Provides visual feedback for pose sequence progress

// @input Component.ScriptComponent poseSequenceController
// @input Component.Text instructionText
// @input Component.Text progressText
// @input Component.Image progressBar
// @input SceneObject progressBarContainer

// @ui {"widget": "separator"}
// @input string[] poseInstructions = ["Hold T-Pose", "Raise Your Arms Up"]
// @input string waitingInstruction = "Get ready to follow the pose sequence!"
// @input string completedInstruction = "Sequence Complete! Great job!"

// @ui {"widget": "separator"}
// @input bool showProgressBar = true
// @input bool showTimer = true
// @input vec4 progressColor = {1, 1, 0, 1} {"widget": "color"}
// @input vec4 completedColor = {0, 1, 0, 1} {"widget": "color"}

var isInitialized = false;
var currentDisplayedPose = -1;

// Validation
if (!script.poseSequenceController) {
    debugPrint("ERROR: PoseSequenceController not set", true);
    return;
}

function updateUI() {
    if (!isInitialized) return;
    
    var sequenceState = script.poseSequenceController.getSequenceState();
    var currentPose = script.poseSequenceController.getCurrentPose();
    var progress = script.poseSequenceController.getCurrentPoseProgress();
    
    // Update instruction text
    if (script.instructionText) {
        var instruction = "";
        
        if (sequenceState === 0) { // WAITING_FOR_START
            instruction = script.waitingInstruction;
        } else if (sequenceState === 2) { // COMPLETED
            instruction = script.completedInstruction;
        } else if (sequenceState === 1) { // IN_PROGRESS
            var poseIndex = getCurrentPoseIndex();
            if (poseIndex >= 0 && poseIndex < script.poseInstructions.length) {
                instruction = script.poseInstructions[poseIndex];
            } else {
                instruction = "Hold the pose: " + currentPose;
            }
        }
        
        script.instructionText.text = instruction;
    }
    
    // Update progress text
    if (script.progressText && script.showTimer) {
        if (sequenceState === 1 && progress > 0) {
            var timeLeft = script.poseSequenceController.minimumHoldTime - (progress * script.poseSequenceController.minimumHoldTime);
            script.progressText.text = timeLeft.toFixed(1) + "s";
        } else {
            script.progressText.text = "";
        }
    }
    
    // Update progress bar
    if (script.progressBar && script.showProgressBar) {
        if (sequenceState === 1) {
            // Show progress bar
            if (script.progressBarContainer) {
                script.progressBarContainer.enabled = true;
            }
            
            // Update progress bar fill
            var material = script.progressBar.mainMaterial;
            if (material) {
                var clampedProgress = Math.min(Math.max(progress, 0), 1);
                
                // Update progress bar scale or UV
                var transform = script.progressBar.getSceneObject().getTransform();
                var currentScale = transform.getLocalScale();
                currentScale.x = clampedProgress;
                transform.setLocalScale(currentScale);
                
                // Update color based on progress
                var color = progress >= 1.0 ? script.completedColor : script.progressColor;
                if (material.mainPass && material.mainPass.baseColor !== undefined) {
                    material.mainPass.baseColor = color;
                }
            }
        } else {
            // Hide progress bar
            if (script.progressBarContainer) {
                script.progressBarContainer.enabled = false;
            }
        }
    }
}

function getCurrentPoseIndex() {
    var currentPose = script.poseSequenceController.getCurrentPose();
    if (!currentPose) return -1;
    
    // Get the pose sequence from the controller
    var poseSequence = ["TPOSE", "ARMS_UP"]; // Default sequence
    
    for (var i = 0; i < poseSequence.length; i++) {
        if (poseSequence[i] === currentPose) {
            return i;
        }
    }
    return -1;
}

// Trigger responses
function onSequenceStart() {
    debugPrint("Sequence started");
    updateUI();
}

function onSequenceComplete() {
    debugPrint("Sequence completed");
    updateUI();
    
    // Hide progress bar after completion
    if (script.progressBarContainer) {
        script.progressBarContainer.enabled = false;
    }
}

function onSequenceReset() {
    debugPrint("Sequence reset");
    updateUI();
}

function onPoseStart() {
    debugPrint("Pose started");
    updateUI();
}

function onPoseEnd() {
    debugPrint("Pose ended");
    updateUI();
}

function onPoseComplete() {
    debugPrint("Pose completed");
    updateUI();
}

// Initialize
function initialize() {
    if (global.behaviorSystem) {
        // Register for sequence events
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_START", onSequenceStart);
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_COMPLETE", onSequenceComplete);
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_RESET", onSequenceReset);
        
        // Register for pose events
        global.behaviorSystem.addCustomTriggerResponse("TPOSE_START", onPoseStart);
        global.behaviorSystem.addCustomTriggerResponse("TPOSE_END", onPoseEnd);
        global.behaviorSystem.addCustomTriggerResponse("TPOSE_COMPLETE", onPoseComplete);
        
        global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_START", onPoseStart);
        global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_END", onPoseEnd);
        global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_COMPLETE", onPoseComplete);
    }
    
    // Hide progress bar initially
    if (script.progressBarContainer) {
        script.progressBarContainer.enabled = false;
    }
    
    isInitialized = true;
    updateUI();
    
    debugPrint("PoseSequenceUI initialized");
}

// Update event
script.createEvent("UpdateEvent").bind(updateUI);

// Debug function
function debugPrint(message, force) {
    print("[PoseSequenceUI] " + message);
}

// Initialize when behavior system is ready
var initializationCheckEvent;

function checkBehaviorSystem() {
    if (global.behaviorSystem) {
        initialize();
        if (initializationCheckEvent) {
            initializationCheckEvent.enabled = false;
        }
    }
}

// Use UpdateEvent to check for behavior system initialization
initializationCheckEvent = script.createEvent("UpdateEvent");
initializationCheckEvent.bind(checkBehaviorSystem);

// Also try to initialize immediately
checkBehaviorSystem();
