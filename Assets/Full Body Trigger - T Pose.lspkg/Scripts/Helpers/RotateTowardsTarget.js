//@input SceneObject target

if (!script.target) {
    debugPrint("ERROR, Target sceneObject is not set on " + script.getSceneObject().name + " sceneObject");
} else {
    var curTransform = script.getSceneObject().getTransform();
    var targetTransform = script.target.getTransform();
    script.createEvent("UpdateEvent").bind(OnUpdate);
}

function OnUpdate() {
    var position = curTransform.getWorldPosition();
    var targetPosition = targetTransform.getWorldPosition();

    var xdiff = targetPosition.x - position.x;
    var ydiff = targetPosition.y - position.y;
    var angle = Math.atan2(xdiff, -ydiff);
    var newrot = quat.fromEulerAngles(0, 0, angle);

    curTransform.setWorldRotation(newrot);
}

function debugPrint(msg) {
    print("[RotateTowardsTarget], " + msg);
}