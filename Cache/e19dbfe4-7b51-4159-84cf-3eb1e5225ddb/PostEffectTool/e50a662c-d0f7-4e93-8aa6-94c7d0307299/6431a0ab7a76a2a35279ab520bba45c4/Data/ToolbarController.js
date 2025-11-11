//@input Asset.Texture deviceCameraTexture
//@input Component.ScreenTransform bottomMidSection

var provider = script.deviceCameraTexture.control;
var pixelSize = 45;
var screenWidth = 800;

var viewportUpdateEvent = script.createEvent("ViewportUpdateEvent");
viewportUpdateEvent.bind(function(eventData){
    pixelSize = 24 * eventData.viewportData.screenScale;
    screenWidth = 427 * eventData.viewportData.screenScale;
})

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(update);

init();

function init(){
    
    if (script.bottomMidSection){
        bottomMidSectionRight = script.bottomMidSection.anchors.right;
    }
}

function update() {
    
    if (script.bottomMidSection){
        script.bottomMidSection.anchors.bottom = -1;
        script.bottomMidSection.anchors.top = -1 + pixelSize * 2 / provider.getHeight();
        script.bottomMidSection.anchors.left = 0 - bottomMidSectionRight * screenWidth / provider.getWidth();
        script.bottomMidSection.anchors.right = 0 + bottomMidSectionRight * screenWidth / provider.getWidth();
    }
}