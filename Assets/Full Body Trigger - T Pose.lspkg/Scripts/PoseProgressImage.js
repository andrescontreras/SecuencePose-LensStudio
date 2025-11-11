// PoseProgressImage.js
// Version: 1.0.0
// Event: Lens Initialized
// Description: Changes image based on pose completion progress

// @input Component.ScriptComponent poseSequenceController
// @input Component.Image progressImage

// @ui {"widget": "separator"}
// @ui {"widget": "label", "label": "Progress Images"}
// @input Asset.Texture noPoseCompleteTexture
// @input Asset.Texture pose1CompleteTexture
// @input Asset.Texture pose2CompleteTexture
// @input Asset.Texture pose3CompleteTexture

var isInitialized = false;
var currentCompletedPoses = -1;
var completedPosesList = []; // Track which poses have been completed

// Validation
if (!script.poseSequenceController) {
    debugPrint("ERROR: PoseSequenceController not set", true);
    return;
}

if (!script.progressImage) {
    debugPrint("ERROR: Progress Image component not set", true);
    return;
}

function updateProgressImage() {
    if (!isInitialized) return;
    
    var sequenceState = script.poseSequenceController.getSequenceState();
    var completedPoses = getCompletedPosesCount();
    
    // Only update if the number of completed poses has changed
    if (completedPoses === currentCompletedPoses) return;
    
    currentCompletedPoses = completedPoses;
    
    var textureToUse = null;
    
    switch (completedPoses) {
        case 0:
            textureToUse = script.noPoseCompleteTexture;
            debugPrint("Switching to NoPoseComplete image");
            break;
        case 1:
            textureToUse = script.pose1CompleteTexture;
            debugPrint("Switching to Pose1Complete image");
            break;
        case 2:
            textureToUse = script.pose2CompleteTexture;
            debugPrint("Switching to Pose2Complete image");
            break;
        case 3:
            textureToUse = script.pose3CompleteTexture;
            debugPrint("Switching to Pose3Complete image");
            break;
        default:
            textureToUse = script.noPoseCompleteTexture;
            break;
    }
    
    // Update the image texture
    if (textureToUse && script.progressImage.mainMaterial) {
        script.progressImage.mainMaterial.mainPass.baseTex = textureToUse;
    }
}

function getCompletedPosesCount() {
    var sequenceState = script.poseSequenceController.getSequenceState();
    
    if (sequenceState === 0) { // WAITING_FOR_START
        return 0;
    } else if (sequenceState === 2) { // COMPLETED
        return 3; // All poses completed
    } else if (sequenceState === 1) { // IN_PROGRESS
        // Return the number of poses that have been completed so far
        return completedPosesList.length;
    }
    
    return 0;
}

function getCurrentPoseIndex() {
    var currentPose = script.poseSequenceController.getCurrentPose();
    if (!currentPose) return 0;
    
    // Get the pose sequence from the controller (adjust based on your actual sequence)
    var poseSequence = ["TPOSE", "ARMS_UP", "THIRD_POSE"]; // Update this to match your actual poses
    
    for (var i = 0; i < poseSequence.length; i++) {
        if (poseSequence[i] === currentPose) {
            return i;
        }
    }
    return 0;
}

// Trigger responses
function onPoseComplete() {
    var currentPose = script.poseSequenceController.getCurrentPose();
    debugPrint("Pose completed: " + currentPose + " - updating progress image");
    
    // Add the completed pose to our tracking list if not already there
    if (currentPose && completedPosesList.indexOf(currentPose) === -1) {
        completedPosesList.push(currentPose);
        debugPrint("Added " + currentPose + " to completed list. Total completed: " + completedPosesList.length);
    }
    
    updateProgressImage();
}

function onSequenceStart() {
    debugPrint("Sequence started - resetting to no poses complete");
    completedPosesList = []; // Reset completed poses list
    updateProgressImage();
}

function onSequenceComplete() {
    debugPrint("Sequence completed - showing final image");
    updateProgressImage();
}

function onSequenceReset() {
    debugPrint("Sequence reset");
    completedPosesList = []; // Reset completed poses list
    currentCompletedPoses = -1; // Force update
    updateProgressImage();
}

// Initialize
function initialize() {
    if (global.behaviorSystem) {
        // Register for sequence events
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_START", onSequenceStart);
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_COMPLETE", onSequenceComplete);
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_RESET", onSequenceReset);
        
        // Register for pose completion events
        global.behaviorSystem.addCustomTriggerResponse("TPOSE_COMPLETE", onPoseComplete);
        global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_COMPLETE", onPoseComplete);
        // Add more pose complete events as needed for your third pose
        global.behaviorSystem.addCustomTriggerResponse("THIRD_POSE_NO_ARMS_COMPLETE", onPoseComplete);
        
    }
    
    isInitialized = true;
    
    // Set initial image
    currentCompletedPoses = -1; // Force initial update
    updateProgressImage();
    
    debugPrint("PoseProgressImage initialized");
}

// Update event (optional - mainly for debugging)
script.createEvent("UpdateEvent").bind(updateProgressImage);

// Debug function
function debugPrint(message, force) {
    print("[PoseProgressImage] " + message);
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