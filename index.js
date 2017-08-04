window.THREE = require('three')
const PointShader = require('./ProportionalPointsMaterial')
const Easings = require('./easings')
const WEBVR = require('./WEBVR')
const ViveController = require('three-vive-controller')(THREE)
WEBVR.checkAvailability().catch( function( message ) {
	document.body.appendChild( WEBVR.getMessageContainer( message ) );
} );

window.Easings = Easings
window.scene = new THREE.Scene()
window.renderer = new THREE.WebGLRenderer({antialias: true})

renderer.vr.enabled = true

var controller = new ViveController(0, renderer.vr)
scene.add(controller)

document.body.appendChild(renderer.domElement)
console.log(renderer)
document.body.style.margin = 0
renderer.setSize(window.innerWidth, window.innerHeight)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000)
camera.position.z = 10
camera.position.x = 10
camera.lookAt(new THREE.Vector3())
const sphereGeo = new THREE.IcosahedronBufferGeometry(0.5,5)
const sphereMat = new THREE.ShaderMaterial({
  vertexShader: PointShader.vertexShader,
  fragmentShader: PointShader.meshFragmentShader,
  uniforms: {
    cursorPosition: {type: 'v3', value: new THREE.Vector3()},
    cursorSize: {type: 'f', value: 1},
    cursorTransform: {type: 'v3', value: new THREE.Vector3()}
  }
})
const sphere = new THREE.Mesh(sphereGeo, sphereMat)
scene.add(sphere)

const pointsMaterial = new THREE.ShaderMaterial({
  fragmentShader: PointShader.pointsFragmentShader,
  vertexShader: PointShader.vertexShader,
  transparent: true,
  uniforms: {
    cursorPosition: {type: 'v3', value: new THREE.Vector3()},
    cursorSize: {type: 'f', value: 1},
    cursorTransform: {type: 'v3', value: new THREE.Vector3()}
  }
})
const points = new THREE.Points(
  sphereGeo,
  pointsMaterial
)
scene.add(points)
scene.add(new THREE.AmbientLight(0x3f3f3f))
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(50, 50, 50)
scene.add(light)

const cursor = new THREE.Mesh(
  new THREE.SphereBufferGeometry(1, 16, 16),
  new THREE.MeshPhongMaterial({
    transparent: true,
    color: 'white',
    opacity: 0.5
  })
)

function setCursorScale(s) {
  cursor.scale.set(s, s, s)
  setUniform("cursorSize", cursor.scale.x)
}
cursor.scale.set(0.2, 0.2, 0.2)
scene.add(cursor)

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(100, 100, 2, 2),
  new THREE.MeshBasicMaterial()
)

function setUniform(name, x, y, z) {
  if (x instanceof THREE.Vector3) {
    pointsMaterial.uniforms[name].value.copy(x)
    sphereMat.uniforms[name].value.copy(x)
  } else if (y !== undefined) {
    pointsMaterial.uniforms[name].value.set(x, y, z)
    sphereMat.uniforms[name].value.set(x, y, z)
  } else {
    pointsMaterial.uniforms[name].value = x
    sphereMat.uniforms[name].value = x
  }

}

controller.on(controller.PadDragged, (dx, dy) => {
  console.log(dy)
  setCursorScale(cursor.scale.x * (1 + (dy)))
})

window.addEventListener('wheel', function(e) {
  e.preventDefault()
  setCursorScale(cursor.scale.x * (1 + (e.deltaY / 100)))
})


const downVec = new THREE.Vector3()
var isDown = false;
const currentTransform = new THREE.Vector3()
window.addEventListener('mousemove', function(event) {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObject( plane );
  if (intersects.length > 0) {
    cursor.position.copy(intersects[0].point)
  }
  updateCursor()
})

function updateCursor() {
  if (isDown) {
    currentTransform.subVectors(cursor.position, downVec)
    setUniform('cursorTransform', currentTransform)
  } else {
    setUniform('cursorPosition', cursor.position.x, cursor.position.y, cursor.position.z)
  }
}

controller.on(controller.TriggerClicked, () => {
  isDown = true
  downVec.copy(controller.position)
})

controller.on(controller.TriggerUnclicked, () => {
  applyTransformation()

  isDown = false
  downVec.set(0, 0, 0)
  setUniform('cursorTransform', 0, 0, 0)
})

window.addEventListener('mousedown', function(e) {
  isDown = true
  downVec.copy(cursor.position)
})

window.addEventListener('mouseup', function() {
  applyTransformation()

  isDown = false
  downVec.set(0, 0, 0)
  setUniform('cursorTransform', 0, 0, 0)
})

var tmpV3 = new THREE.Vector3()
function dist(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt(
    (x2 - x1) * (x2 - x1) +
    (y2 - y1) * (y2 - y1) +
    (z2 - z1) * (z2 - z1)
  )
}
scene.add(new THREE.AxisHelper)
function applyTransformation() {
  const positions = sphereGeo.attributes.position.array
  for (var i = 0; i < positions.length; i += 3) {
    var d = dist(
      positions[i], positions[i + 1], positions[i + 2],
      downVec.x, downVec.y, downVec.z
    )
    var strength = Math.max(0, 1 - d / cursor.scale.x)
    strength = Easings.easeInOutQuad(strength)
    positions[i] += currentTransform.x * strength
    positions[i + 1] += currentTransform.y * strength
    positions[i + 2] += currentTransform.z * strength
  }
  sphereGeo.attributes.position.needsUpdate = true
}

function render() {
  cursor.position.copy(controller.position)
  updateCursor()
  renderer.render(scene, camera)
}
renderer.animate( render );

WEBVR.getVRDisplay( function ( display ) {
					renderer.vr.setDevice( display );
					document.body.appendChild( WEBVR.getButton( display, renderer.domElement ) );
				} );
