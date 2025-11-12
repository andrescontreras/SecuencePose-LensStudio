// FinalPose.js
// Version: 1.0.0
// Event: Lens Initialized
// Description: Shows a number when all poses in the sequence are completed

// @input Component.Text numberText
// @input Component.ScriptComponent poseSequenceController
// @input string numberToShow = "5" {"label": "Number to Show"}

var isNumberShown = false;

// Function to show the number
function showNumber() {
    if (!isNumberShown && script.numberText) {
        script.numberText.text = script.numberToShow;
        script.numberText.enabled = true;
        isNumberShown = true;
        print("[FinalPose] Showing number " + script.numberToShow + " - All poses completed!");
    }
}

// Function to hide the number
function hideNumber() {
    if (script.numberText) {
        script.numberText.enabled = false;
        isNumberShown = false;
        print("[FinalPose] Number hidden - Sequence reset");
    }
}

// Check sequence completion on update
function onUpdate() {
    if (!script.poseSequenceController) {
        return;
    }
    
    // Show number when sequence is completed
    if (script.poseSequenceController.isSequenceComplete() && !isNumberShown) {
        showNumber();
    }
    
    // Hide number when sequence is reset or waiting for start
    if (script.poseSequenceController.getSequenceState() === 0 && isNumberShown) { // WAITING_FOR_START = 0
        hideNumber();
    }
}

// Initialize
if (!script.numberText) {
    print("[FinalPose] ERROR: Number Text component not assigned!");
} else {
    script.numberText.enabled = false; // Hide initially
}

if (!script.poseSequenceController) {
    print("[FinalPose] ERROR: Pose Sequence Controller not assigned!");
}

// Set up update event
script.createEvent("UpdateEvent").bind(onUpdate);

print("[FinalPose] Final Pose controller initialized");