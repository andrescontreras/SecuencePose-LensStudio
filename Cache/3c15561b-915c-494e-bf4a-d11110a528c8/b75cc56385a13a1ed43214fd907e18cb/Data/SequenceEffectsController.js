// SequenceEffectsController.js
// Version: 1.0.0
// Event: Lens Initialized
// Description: Handles visual effects for pose sequences with different effects per pose

//@input string[] poseNames = ["TPOSE", "ARMS_UP"] {"label": "Pose Names"}

// T-Pose Effects
//@ui {"widget": "group_start", "label": "T-Pose Effects"}
//@input SceneObject[] tposeObjects {"label": "T-Pose Objects"}
//@input SceneObject[] tposeTweens {"label": "T-Pose Tweens"}
//@input Asset.Texture[] tposeAnimatedTextures {"label": "T-Pose Animated Textures"}
//@input Component.ScriptComponent[] tposeParticleBursts {"label": "T-Pose Particle Bursts"}
//@ui {"widget": "group_end"}

// Arms Up Effects
//@ui {"widget": "group_start", "label": "Arms Up Effects"}
//@input SceneObject[] armsUpObjects {"label": "Arms Up Objects"}
//@input SceneObject[] armsUpTweens {"label": "Arms Up Tweens"}
//@input Asset.Texture[] armsUpAnimatedTextures {"label": "Arms Up Animated Textures"}
//@input Component.ScriptComponent[] armsUpParticleBursts {"label": "Arms Up Particle Bursts"}
//@ui {"widget": "group_end"}

// Sequence Complete Effects
//@ui {"widget": "group_start", "label": "Sequence Complete Effects"}
//@input SceneObject[] sequenceCompleteObjects {"label": "Sequence Complete Objects"}
//@input SceneObject[] sequenceCompleteTweens {"label": "Sequence Complete Tweens"}
//@input Asset.Texture[] sequenceCompleteTextures {"label": "Sequence Complete Textures"}
//@input Component.ScriptComponent[] sequenceCompleteParticles {"label": "Sequence Complete Particles"}
//@input float sequenceCompleteEffectDuration = 3.0 {"label": "Effect Duration (seconds)"}
//@ui {"widget": "group_end"}

//@ui {"widget": "separator"}
//@input bool advanced = false
//@input string fadeInTween = "FADEIN" {"showIf":"advanced","showIfValue":"true"}
//@input string fadeOutTween = "FADEOUT" {"showIf":"advanced","showIfValue":"true"}

// Store effect configurations
var effectConfigs = {};

function initializeEffects() {
    // T-Pose effects
    effectConfigs["TPOSE"] = {
        objects: script.tposeObjects,
        tweens: script.tposeTweens,
        textures: script.tposeAnimatedTextures,
        particles: script.tposeParticleBursts
    };
    
    // Arms Up effects
    effectConfigs["ARMS_UP"] = {
        objects: script.armsUpObjects,
        tweens: script.armsUpTweens,
        textures: script.armsUpAnimatedTextures,
        particles: script.armsUpParticleBursts
    };
    
    // Initialize all objects as disabled
    disableAllObjects();
}

function disableAllObjects() {
    for (var poseName in effectConfigs) {
        var config = effectConfigs[poseName];
        disableObjects(config.objects);
    }
    disableObjects(script.sequenceCompleteObjects);
}

function disableObjects(objects) {
    if (!objects) return;
    for (var i = 0; i < objects.length; i++) {
        if (objects[i]) {
            objects[i].enabled = false;
        }
    }
}

function enableObjects(objects) {
    if (!objects) return;
    for (var i = 0; i < objects.length; i++) {
        if (objects[i]) {
            objects[i].enabled = true;
        }
    }
}

function startTweens(tweens, tweenName) {
    if (!tweens || !global.tweenManager) return;
    for (var i = 0; i < tweens.length; i++) {
        if (tweens[i]) {
            global.tweenManager.startTween(tweens[i], tweenName || script.fadeInTween);
        }
    }
}

function stopTweens(tweens, tweenName, callback) {
    if (!tweens || !global.tweenManager) {
        if (callback) callback();
        return;
    }
    
    var pendingTweens = 0;
    var completedTweens = 0;
    
    for (var i = 0; i < tweens.length; i++) {
        if (tweens[i]) {
            pendingTweens++;
        }
    }
    
    if (pendingTweens === 0) {
        if (callback) callback();
        return;
    }
    
    for (var j = 0; j < tweens.length; j++) {
        if (tweens[j]) {
            global.tweenManager.startTween(tweens[j], tweenName || script.fadeOutTween, function() {
                completedTweens++;
                if (completedTweens >= pendingTweens && callback) {
                    callback();
                }
            });
        }
    }
}

function playTextures(textures) {
    if (!textures) return;
    for (var i = 0; i < textures.length; i++) {
        if (textures[i] && textures[i].control) {
            textures[i].control.play(-1, 0);
        }
    }
}

function stopTextures(textures) {
    if (!textures) return;
    for (var i = 0; i < textures.length; i++) {
        if (textures[i] && textures[i].control) {
            textures[i].control.stop();
        }
    }
}

function startParticles(particles) {
    if (!particles) return;
    for (var i = 0; i < particles.length; i++) {
        if (particles[i] && particles[i].startParticles) {
            particles[i].startParticles();
        }
    }
}

function stopParticles(particles) {
    if (!particles) return;
    for (var i = 0; i < particles.length; i++) {
        if (particles[i] && particles[i].stopParticles) {
            particles[i].stopParticles();
        }
    }
}

// Trigger response functions
function onPoseStart(poseName) {
    debugPrint("Starting effects for pose: " + poseName);
    
    var config = effectConfigs[poseName];
    if (!config) {
        debugPrint("No effects configured for pose: " + poseName);
        return;
    }
    
    enableObjects(config.objects);
    startTweens(config.tweens);
    playTextures(config.textures);
    startParticles(config.particles);
}

function onPoseEnd(poseName) {
    debugPrint("Ending effects for pose: " + poseName);
    
    var config = effectConfigs[poseName];
    if (!config) return;
    
    if (config.tweens && config.tweens.length > 0) {
        stopTweens(config.tweens, script.fadeOutTween, function() {
            disableObjects(config.objects);
            stopTextures(config.textures);
            stopParticles(config.particles);
        });
    } else {
        disableObjects(config.objects);
        stopTextures(config.textures);
        stopParticles(config.particles);
    }
}

function onPoseComplete(poseName) {
    debugPrint("Pose completed: " + poseName);
    // Keep current effects running until pose ends
}

function onSequenceComplete() {
    debugPrint("Sequence completed! Starting completion effects");
    
    // Disable all pose-specific effects first
    for (var poseName in effectConfigs) {
        onPoseEnd(poseName);
    }
    
    // Start sequence complete effects
    enableObjects(script.sequenceCompleteObjects);
    startTweens(script.sequenceCompleteTweens);
    playTextures(script.sequenceCompleteTextures);
    startParticles(script.sequenceCompleteParticles);
    
    // Auto-stop sequence complete effects after duration
    script.createEvent("DelayedCallbackEvent").bind(function() {
        debugPrint("Stopping sequence complete effects");
        
        if (script.sequenceCompleteTweens && script.sequenceCompleteTweens.length > 0) {
            stopTweens(script.sequenceCompleteTweens, script.fadeOutTween, function() {
                disableObjects(script.sequenceCompleteObjects);
                stopTextures(script.sequenceCompleteTextures);
                stopParticles(script.sequenceCompleteParticles);
            });
        } else {
            disableObjects(script.sequenceCompleteObjects);
            stopTextures(script.sequenceCompleteTextures);
            stopParticles(script.sequenceCompleteParticles);
        }
    }).getEventExecutor().setLength(script.sequenceCompleteEffectDuration);
}

function onSequenceReset() {
    debugPrint("Sequence reset, stopping all effects");
    
    // Stop all effects
    for (var poseName in effectConfigs) {
        onPoseEnd(poseName);
    }
    
    // Stop sequence complete effects
    disableObjects(script.sequenceCompleteObjects);
    stopTextures(script.sequenceCompleteTextures);
    stopParticles(script.sequenceCompleteParticles);
}

// Register trigger responses
function registerTriggers() {
    if (!global.behaviorSystem) {
        debugPrint("ERROR: Behavior system not available");
        return;
    }
    
    // Register pose-specific triggers
    global.behaviorSystem.addCustomTriggerResponse("TPOSE_START", function() { onPoseStart("TPOSE"); });
    global.behaviorSystem.addCustomTriggerResponse("TPOSE_END", function() { onPoseEnd("TPOSE"); });
    global.behaviorSystem.addCustomTriggerResponse("TPOSE_COMPLETE", function() { onPoseComplete("TPOSE"); });
    
    global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_START", function() { onPoseStart("ARMS_UP"); });
    global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_END", function() { onPoseEnd("ARMS_UP"); });
    global.behaviorSystem.addCustomTriggerResponse("ARMS_UP_COMPLETE", function() { onPoseComplete("ARMS_UP"); });
    
    // Register sequence triggers
    global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_COMPLETE", onSequenceComplete);
    global.behaviorSystem.addCustomTriggerResponse("SEQUENCE_RESET", onSequenceReset);
    
    debugPrint("Trigger responses registered");
}

function debugPrint(message) {
    print("[SequenceEffectsController] " + message);
}

// Initialize
initializeEffects();

// Wait for behavior system to be ready
script.createEvent("LensInitializedEvent").bind(function() {
    var checkAndRegister = function() {
        if (global.behaviorSystem) {
            registerTriggers();
        } else {
            // Try again next frame
            script.createEvent("UpdateEvent").bind(function() {
                if (global.behaviorSystem) {
                    registerTriggers();
                }
            });
        }
    };
    checkAndRegister();
});

debugPrint("SequenceEffectsController initialized");
