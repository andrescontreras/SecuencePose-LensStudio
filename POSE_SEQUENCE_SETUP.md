# Pose Sequence Setup Guide

This guide explains how to set up the new pose sequence system that requires users to perform T-Pose first, then Arms Up, with each pose held for at least 1 second.

## New Files Added

1. **PoseSequenceController.js** - Main sequence logic controller
2. **PoseSequenceUI.js** - Visual feedback for sequence progress  
3. **SequenceEffectsController.js** - Handles different effects for each pose

## Setup Instructions

### 1. Add PoseSequenceController to Scene

1. Create a new SceneObject called "Pose Sequence Controller"
2. Add the **PoseSequenceController.js** script component
3. Configure the script inputs:
   - **gestureLibrary**: Reference to your existing GestureController script
   - **minimumHoldTime**: 1.0 (seconds to hold each pose)
   - **poseSequence**: ∏(already set by default)
   - **threshold**: 0.15 (pose detection sensitivity)

### 2. Add PoseSequenceUI for Visual Feedback (Optional but Recommended)

#### Step 2.1: Create UI Elements in Lens Studio

**A. Create Instruction Text:**
1. In the Objects Panel, right-click and select **Create New > Screen Image**
2. Rename it to "Instruction Text Container"
3. Right-click on it and select **Create New > Text**
4. Rename the Text component to "Instruction Text"
5. In the Inspector:
   - Set Text to "Get ready to follow the pose sequence!"
   - Choose a readable font and size (e.g., Arial, size 24)
   - Set color to white or bright color for visibility
   - Set Text Alignment to Center
6. Position the ScreenTransform:
   - Set Anchor: Left: -1, Right: 1, Top: 0.8, Bottom: 0.6
   - This places it at the top of the screen

**B. Create Timer Countdown Text:**
1. Right-click "Instruction Text Container" and select **Create New > Text**
2. Rename it to "Timer Text"
3. In the Inspector:
   - Set Text to "1.0s"
   - Choose a bold font and larger size (e.g., Arial Bold, size 32)
   - Set color to yellow or bright color
   - Set Text Alignment to Center
4. Position below instruction text:
   - Set Anchor: Left: -0.2, Right: 0.2, Top: 0.5, Bottom: 0.3

**C. Create Progress Bar Container:**
1. Right-click in Objects Panel and select **Create New > Screen Image**
2. Rename it to "Progress Bar Container"
3. In the Inspector:
   - Set the Image component's material to a dark/transparent background
   - Or disable the Image component if you don't want a background
4. Position at bottom of screen:
   - Set Anchor: Left: -0.8, Right: 0.8, Top: -0.7, Bottom: -0.8

**D. Create Progress Bar:**
1. Right-click "Progress Bar Container" and select **Create New > Screen Image**
2. Rename it to "Progress Bar"
3. In the Inspector:
   - Set the Image component's material color to bright green or yellow
   - Set Stretch Mode to "Stretch"
4. Position to fill container:
   - Set Anchor: Left: 0, Right: 0, Top: 0, Bottom: 0
   - Set Offset: Left: 0, Right: 0, Top: 0, Bottom: 0
5. **Important**: The script will control the scale of this object to show progress

#### Step 2.2: Create PoseSequenceUI Controller

1. Create a new SceneObject called "Pose Sequence UI Controller"
2. Add the **PoseSequenceUI.js** script component
#### Step 2.3: Configure PoseSequenceUI Script

3. Configure the script inputs:
   - **poseSequenceController**: Drag the "Pose Sequence Controller" object here
   - **instructionText**: Drag the "Instruction Text" component here
   - **progressText**: Drag the "Timer Text" component here  
   - **progressBar**: Drag the "Progress Bar" Image component here
   - **progressBarContainer**: Drag the "Progress Bar Container" object here
   - **poseInstructions**: Set to ["Hold T-Pose", "Raise Your Arms Up"]
   - **waitingInstruction**: "Get ready to follow the pose sequence!"
   - **completedInstruction**: "Sequence Complete! Great job!"
   - **showProgressBar**: Enable (checked)
   - **showTimer**: Enable (checked)
   - **progressColor**: Yellow (RGB: 1, 1, 0, 1)
   - **completedColor**: Green (RGB: 0, 1, 0, 1)

#### Step 2.4: UI Hierarchy Structure
Your Objects Panel should look like this:
```
📁 Camera
📁 Lighting  
📁 [Other existing objects]
📁 Instruction Text Container
   📄 Instruction Text (Text Component)
   📄 Timer Text (Text Component)
📁 Progress Bar Container  
   📄 Progress Bar (Screen Image)
📁 Pose Sequence UI Controller (with PoseSequenceUI.js script)
📁 Pose Sequence Controller (with PoseSequenceController.js script)
```

#### Step 2.5: Testing the UI
1. Play the lens in preview
2. You should see:
   - "Get ready to follow the pose sequence!" text at top
   - Progress bar container at bottom (initially hidden)
   - When body tracking starts, instruction changes to "Hold T-Pose"
   - Progress bar appears and fills as you hold the pose
   - Timer counts down from 1.0s to 0.0s
   - UI updates when moving to next pose

### 3. Add SequenceEffectsController for Different Effects per Pose

1. Create a new SceneObject called "Sequence Effects Controller"
2. Add the **SequenceEffectsController.js** script component
3. Configure different effects for each pose:

   **T-Pose Effects:**
   - Assign your existing lightning objects/tweens/textures to T-Pose sections
   
   **Arms Up Effects:**
   - Create new effects or reuse existing ones for Arms Up pose
   
   **Sequence Complete Effects:**
   - Special celebration effects when entire sequence is completed

### 4. Update Existing Scripts

The new system is designed to work alongside your existing scripts:

- **FullBodyTrackingController.js** - No changes needed
- **GestureController.js** - No changes needed (ARMS_UP pose already defined)
- **MovementTrigger.js** - Can be disabled or used for other purposes
- **MovementTriggerResponse.js** - Can be replaced by SequenceEffectsController

### 5. Triggers Generated

The new system generates these custom triggers:

**Sequence Level:**
- `SEQUENCE_START` - When sequence begins
- `SEQUENCE_COMPLETE` - When entire sequence is completed
- `SEQUENCE_RESET` - When sequence is reset

**Per Pose:**
- `TPOSE_START` - When T-Pose is first detected
- `TPOSE_END` - When T-Pose is lost
- `TPOSE_COMPLETE` - When T-Pose is held for minimum time
- `ARMS_UP_START` - When Arms Up is first detected  
- `ARMS_UP_END` - When Arms Up is lost
- `ARMS_UP_COMPLETE` - When Arms Up is held for minimum time

## How It Works

1. **Automatic Start**: Sequence starts automatically when full body tracking begins
2. **T-Pose First**: User must perform and hold T-Pose for 1 second
3. **Progress to Arms Up**: After T-Pose is completed, user must perform Arms Up
4. **Hold Timer**: Each pose must be held for the minimum time (1 second by default)
5. **Visual Feedback**: UI shows current instruction and progress
6. **Effects**: Different visual effects can trigger for each pose
7. **Completion**: Special effects trigger when entire sequence is complete
8. **Auto Reset**: Sequence resets if body tracking is lost

## Customization Options

- **Change Poses**: Modify `poseSequence` array in PoseSequenceController
- **Adjust Timing**: Change `minimumHoldTime` value
- **Add More Poses**: Extend the system by adding new poses to GestureController
- **Custom Effects**: Configure different effects for each pose in SequenceEffectsController
- **UI Styling**: Customize progress bar colors and text in PoseSequenceUI

## Testing

1. Enable the lens in Lens Studio
2. Ensure full body is visible in camera
3. Perform T-Pose and hold for 1+ seconds
4. Perform Arms Up pose and hold for 1+ seconds
5. Observe effects and UI feedback

The system provides robust error handling and will reset gracefully if tracking is lost or poses are not held long enough.
