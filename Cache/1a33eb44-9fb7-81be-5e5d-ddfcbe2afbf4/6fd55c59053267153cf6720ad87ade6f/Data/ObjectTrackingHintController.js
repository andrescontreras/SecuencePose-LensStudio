// -----JS CODE-----
// ObjectTrackingHintController.js
// Version: 0.0.3
// Event: Lens Initialized
// Description: Controls an object tracking logo and text that appears when camera is not seeing cat, dog, hand, body.
// Allows to create additional hint texture and text 

// @input Asset.Texture hintLogo
// @input int hint = 0 {"widget": "combobox", "values":[{"label": "Cat", "value": 0}, {"label": "Dog", "value": 1}, {"label": "Cat or Dog", "value": 2}, {"label": "Body", "value": 3},{"label": "Hand", "value": 4}, {"label": "Custom", "value": 5}]}
// @input string customText {"showIf": "hint", "showIfValue": 5}
// @input bool useMagnifying
// @ui {"widget":"separator"}
// @input bool addSecondaryHint {"label" : "Secondary Hint"}
// @input Asset.Texture secondaryHintLogo  {"showIf": "addSecondaryHint", "label" : "Hint Logo"}
// @input string secondaryText {"showIf": "addSecondaryHint", "label" : "Hint"}
// @input bool useMagnifying1 {"showIf": "addSecondaryHint", "label" : "Use Magnifying"}
// @ui {"widget":"separator"}
// @input bool advanced = false
// @input Component.Text hintText {"showIf":"advanced"}
// @input SceneObject hintRenderZone {"showIf":"advanced"}
// @input SceneObject hintLogoImage {"showIf":"advanced"}
// @input SceneObject magnifyingGlassPivot {"showIf":"advanced"}
// @input SceneObject magnifying {"showIf":"advanced"}

var hints = ["LOOK FOR CAT", "LOOK FOR DOG", "LOOK FOR CAT OR DOG", "LOOK FOR BODY", "LOOK FOR HAND", script.customText];
var hidden = false;

if (script.magnifyingGlassPivot) {
    var rotationSpeed = .025;
    var mgTransform = script.magnifyingGlassPivot.getTransform();
    var additionalRotation = quat.angleAxis(rotationSpeed, vec3.forward());
} else {
    debugPrint("WARNING, magnifyingGlassPivot is not set");
}
if (!script.hintRenderZone) {
    debugPrint("ERROR, hintRenderZone is not set");
}

function initialize() {
    setHintIndex(0);

    script.show = show;
    script.hide = hide;
}

function onUpdate() {
    if (global.scene.isRecording()) {
        hide();
        return;
    }
    if (script.magnifyingGlassPivot) {
        rotateMagnifyingGlass();
    }
}

function show(idx) {
    
    if (idx !== undefined) {
        setHintIndex(idx);
    }
    if (!hidden) {
        return;
    }
    hidden = false;
    if (script.hintRenderZone) {
        script.hintRenderZone.enabled = true;
    }
    if (script.magnifying) {
        global.tweenManager.startTween(script.magnifying, "transitionin");
    }
    if (script.hintLogoImage) {
        global.tweenManager.startTween(script.hintLogoImage, "transitionin");
    }
}

function hide() {
    if (hidden) {
        return;
    }

    hidden = true;
    if (script.magnifying) {
        global.tweenManager.stopTween(script.magnifying, "transitionin");
        global.tweenManager.resetObject(script.magnifying, "transitionin");
    }
    if (script.hintLogoImage) {
        global.tweenManager.stopTween(script.hintLogoImage, "transitionin");
        global.tweenManager.resetObject(script.hintLogoImage, "transitionin");
    }
    if (script.hintRenderZone) {
        script.hintRenderZone.enabled = false;
    }

}

function rotateMagnifyingGlass() {
    var currentRot = mgTransform.getLocalRotation();
    mgTransform.setLocalRotation(currentRot.multiply(additionalRotation));
}

function setHintIndex(idx) {
    switch (idx) {
        case (0):
            setHintParameters(script.hintLogo, hints[script.hint], script.useMagnifying);
            break;
        case (1):
            setHintParameters(script.secondaryHintLogo, script.secondaryText, script.useMagnifying1);
            break;
    }
}

function setHintParameters(texture, text, showMagnifying) {
    if (script.hintLogoImage) {
        script.hintLogoImage.getComponent("Component.Image").mainPass.baseTex = texture;
    }
    if (script.hintText) {
        script.hintText.text = text;
    }
    if (script.magnifying) {
        script.magnifying.getComponent("Component.Image").enabled = showMagnifying;
    }
}

function debugPrint(message) {
    print("[ObjectTrackingHintController], " + message);
}

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

initialize();