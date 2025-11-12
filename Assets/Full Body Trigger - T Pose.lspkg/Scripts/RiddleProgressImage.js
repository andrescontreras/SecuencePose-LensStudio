// RiddleProgressImage.js
// Version: 1.0.0
// Event: Lens Initialized
// Description: Shows riddle images at the bottom based on pose completion progress

// @input Component.ScriptComponent poseSequenceController
// @input Component.Image riddleImage

// @ui {"widget": "separator"}
// @ui {"widget": "label", "label": "Riddle Images"}
// @input Asset.Texture riddle1Texture
// @input Asset.Texture riddle1fTexture
// @input Asset.Texture riddle2Texture
// @input Asset.Texture riddle2fTexture
// @input Asset.Texture riddle3Texture
// @input Asset.Texture riddle3fTexture

// @ui {"widget": "separator"}
// @ui {"widget": "label", "label": "Display Settings"}
// @input float completionDisplayTime = 2.0 {"label": "Completion Display Time (seconds)"}

var isInitialized = false;
var currentRiddleState = "riddle1"; // Current riddle state
var completionTimer = 0.0; // Timer for showing completion images
var isShowingCompletion = false; // Flag to track if we're showing a completion image
var completedPoses = 0; // Track number of completed poses

// Validation
if (!script.poseSequenceController) {
    debugPrint("ERROR: PoseSequenceController not set", true);
    return;
}

if (!script.riddleImage) {
    debugPrint("ERROR: Riddle Image component not set", true);
    return;
}

function updateRiddleImage() {
    if (!isInitialized) return;
    
    var textureToUse = null;
    
    // Determine which texture to show based on current state
    switch (currentRiddleState) {
        case "riddle1":
            textureToUse = script.riddle1Texture;
            debugPrint("Showing Riddle 1");
            break;
        case "riddle1f":
            textureToUse = script.riddle1fTexture;
            debugPrint("Showing Riddle 1 Complete");
            break;
        case "riddle2":
            textureToUse = script.riddle2Texture;
            debugPrint("Showing Riddle 2");
            break;
        case "riddle2f":
            textureToUse = script.riddle2fTexture;
            debugPrint("Showing Riddle 2 Complete");
            break;
        case "riddle3":
            textureToUse = script.riddle3Texture;
            debugPrint("Showing Riddle 3");
            break;
        case "riddle3f":
            textureToUse = script.riddle3fTexture;
            debugPrint("Showing Riddle 3 Complete");
            break;
        default:
            textureToUse = script.riddle1Texture;
            break;
    }
    
    // Update the image texture
    if (textureToUse && script.riddleImage.mainMaterial) {
        script.riddleImage.mainMaterial.mainPass.baseTex = textureToUse;
    }
}

function showCompletionImage(poseNumber) {
    debugPrint("Showing completion for pose " + poseNumber);
    isShowingCompletion = true;
    completionTimer = 0.0;
    
    switch (poseNumber) {
        case 1:
            currentRiddleState = "riddle1f";
            break;
        case 2:
            currentRiddleState = "riddle2f";
            break;
        case 3:
            currentRiddleState = "riddle3f";
            break;
    }
    
    updateRiddleImage();
}

function transitionToNextRiddle(poseNumber) {
    debugPrint("Transitioning to next riddle after pose " + poseNumber);
    
    switch (poseNumber) {
        case 1:
            currentRiddleState = "riddle2";
            break;
        case 2:
            currentRiddleState = "riddle3";
            break;
        case 3:
            // Stay on riddle3f - don't transition away from final completion image
            debugPrint("Final pose completed - keeping Riddle3f on screen");
            return; // Exit early, don't call updateRiddleImage
    }
    
    updateRiddleImage();
}

// Update function to handle completion timer
function onUpdate() {
    if (!isInitialized || !isShowingCompletion) return;
    
    completionTimer += getDeltaTime();
    
    if (completionTimer >= script.completionDisplayTime) {
        debugPrint("Completion display time finished");
        
        // Special case: if we're showing riddle3f (final completion), don't transition
        if (currentRiddleState === "riddle3f") {
            debugPrint("Final completion image - keeping on screen permanently");
            isShowingCompletion = false; // Stop the timer but keep the image
            return;
        }
        
        debugPrint("Transitioning to next riddle");
        isShowingCompletion = false;
        completionTimer = 0.0;
        
        // Transition to next riddle based on completed poses
        transitionToNextRiddle(completedPoses);
    }
}

// Trigger responses
function onSequenceStart() {
    debugPrint("Sequence started - showing riddle 1");
    currentRiddleState = "riddle1";
    completedPoses = 0;
    isShowingCompletion = false;
    completionTimer = 0.0;
    updateRiddleImage();
}

function onSequenceComplete() {
    debugPrint("Sequence completed");
    // Keep showing the final completion image
}

function onSequenceReset() {
    debugPrint("Sequence reset");
    currentRiddleState = "riddle1";
    completedPoses = 0;
    isShowingCompletion = false;
    completionTimer = 0.0;
    updateRiddleImage();
}

function onTposeComplete() {
    debugPrint("T-Pose completed");
    completedPoses = 1;
    showCompletionImage(1);
}

function onArmsUpComplete() {
    debugPrint("Arms Up completed");
    completedPoses = 2;
    showCompletionImage(2);
}

function onThirdPoseComplete() {
    debugPrint("Third Pose completed");
    completedPoses = 3;
    showCompletionImage(3);
}

// Initialize
function initialize() {
    if (global.behaviorSystem) {
        // Register for sequence events
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_START", onSequenceStart);
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_COMPLETE", onSequenceComplete);
        global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_RESET", onSequenceReset);
        
        // Register for individual pose completion events
        global.behaviorSystem.addCustomTriggerResponse("TPOSE_COMPLETE", onTposeComplete);
        global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_COMPLETE", onArmsUpComplete);
        global.behaviorSystem.addCustomTriggerResponse("THIRD_POSE_NO_ARMS_COMPLETE", onThirdPoseComplete);
    }
    
    isInitialized = true;
    
    // Set initial image
    currentRiddleState = "riddle1";
    updateRiddleImage();
    
    debugPrint("RiddleProgressImage initialized");
}

// Create update event for handling completion timer
script.createEvent("UpdateEvent").bind(onUpdate);

// Debug function
function debugPrint(message, force) {
    print("[RiddleProgressImage] " + message);
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