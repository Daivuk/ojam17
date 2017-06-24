var cameraPos = new Vector2();
var cameraZoom = 0;
var cameraMatrix = new Matrix();
var invCameraMatrix = new Matrix();
var targetCameraPos = new Vector2();
var targetCameraZoom = 0;

var focussables = [];

var MAX_ZOOM = 3;
var CAMERA_TRACK_SPEED = 2;

function camera_init()
{
    cameraPos = new Vector2(MAP_CENTER);
    cameraZoom = 2;
    cameraMatrix = new Matrix();
    invCameraMatrix = new Matrix();
    targetCameraPos = new Vector2(cameraPos);
    targetCameraZoom = cameraZoom;
}

function camera_update(dt)
{
    // Focus the camera in a way that everything fits in the screen + ~2 tiles around
    if (focussables.length)
    {
        var min = new Vector2(MAP_SIZE * TILE_SIZE);
        var max = new Vector2(0);
        for (var i = 0; i < focussables.length; ++i)
        {
            var entity = focussables[i];
            min = Vector2.min(entity.position, min);
            max = Vector2.max(entity.position, max);
        }
        min.x -= TILE_SIZE * 2;
        min.y -= TILE_SIZE * 2;
        max.x += TILE_SIZE * 2;
        max.y += TILE_SIZE * 2;
        targetCameraPos = min.add(max).div(2);
    }

    // Determine the zoom based on that rect
    var zoomH = resolution.x / (max.x - min.x);
    var zoomV = resolution.y / (max.y - min.y);
    targetCameraZoom = Math.min(zoomH, zoomV);
    targetCameraZoom = Math.min(MAX_ZOOM, targetCameraZoom);

    // Animate the camera toward target
    cameraPos = targetCameraPos.sub(cameraPos).mul(.3 + dt * CAMERA_TRACK_SPEED).add(cameraPos);
    cameraZoom = (targetCameraZoom - cameraZoom) * (.3+ dt * CAMERA_TRACK_SPEED) + cameraZoom;

    // Build our matrices
    cameraMatrix = new Matrix();
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(-cameraPos.x, -cameraPos.y, 0)));
    cameraMatrix = cameraMatrix.mul(Matrix.createScale(cameraZoom));
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(resolution.x / 2, resolution.y / 2)));

    // Avoid glitches in the sprites
    cameraMatrix._41 = Math.round(cameraMatrix._41);
    cameraMatrix._42 = Math.round(cameraMatrix._42);
    invCameraMatrix = cameraMatrix.invert();
}
