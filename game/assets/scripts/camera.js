var cameraPos = new Vector2();
var cameraZoom = 2;
var cameraMatrix = new Matrix();
var invCameraMatrix = new Matrix();
var targetCameraPos = new Vector2();

function camera_init()
{
    cameraPos = new Vector2(MAP_CENTER);
    cameraZoom = 2;
    cameraMatrix = new Matrix();
    invCameraMatrix = new Matrix();
    targetCameraPos = new Vector2(cameraPos);
}

function camera_update(dt)
{
    cameraMatrix = new Matrix();
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(-cameraPos.x, -cameraPos.y, 0)));
    cameraMatrix = cameraMatrix.mul(Matrix.createScale(cameraZoom));
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(resolution.x / 2, resolution.y / 2)));
    invCameraMatrix = cameraMatrix.invert();
}
