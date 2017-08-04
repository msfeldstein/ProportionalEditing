window.THREE = require('three')
window.WEBVR = require('./WEBVR')

window.scene = new THREE.Scene()
window.renderer = new THREE.WebGLRenderer({antialias: true})
renderer.vr.enabled = true

document.body.appendChild(renderer.domElement)
document.body.style.margin = 0
renderer.setSize(window.innerWidth, window.innerHeight)

window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
camera.position.z = 5
camera.position.x = 5
camera.lookAt(new THREE.Vector3())

const beforeRenderCallbacks = []
window.beforeRender = function(cb) {
  beforeRenderCallbacks.push(cb)
}
function render() {
  beforeRenderCallbacks.forEach((f) => f())
  renderer.render(scene, camera)
}
renderer.animate( render );

if (USEVR) {
  WEBVR.getVRDisplay( function ( display ) {
    renderer.vr.setDevice( display );
    document.body.appendChild( WEBVR.getButton( display, renderer.domElement ) );
  } );  
}