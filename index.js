window.THREE = require('three')
const PointShader = require('./ProportionalPointsMaterial')

window.scene = new THREE.Scene()
window.renderer = new THREE.WebGLRenderer({antialias: true})
document.body.appendChild(renderer.domElement)
console.log(renderer)
document.body.style.margin = 0
renderer.setSize(window.innerWidth, window.innerHeight)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
camera.position.z = 10
camera.position.x = 10
camera.lookAt(new THREE.Vector3())
const sphereGeo = new THREE.IcosahedronBufferGeometry(3,5)
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
scene.add(cursor)

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(100, 100, 2, 2),
  new THREE.MeshBasicMaterial()
)

function setUniform(name, value) {
  pointsMaterial.uniforms[name].value = value
  sphereMat.uniforms[name].value = value
}

window.addEventListener('wheel', function(e) {
  e.preventDefault()
  cursor.scale.multiplyScalar(1 + e.deltaY / 100)
  setUniform("cursorSize", cursor.scale.x)
  
})


const downVec = new THREE.Vector3()
var isDown = false;
window.addEventListener('mousemove', function(event) {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );
  var intersects = raycaster.intersectObject( plane );
  if (intersects.length > 0) {
    cursor.position.copy(intersects[0].point)
  }
  
  if (isDown) {
    pointsMaterial.uniforms.cursorTransform.value.subVectors(cursor.position, downVec)
    sphereMat.uniforms.cursorTransform.value.subVectors(cursor.position, downVec)
  } else {
    pointsMaterial.uniforms.cursorPosition.value.copy(cursor.position)
    sphereMat.uniforms.cursorPosition.value.copy(cursor.position)
  }
})


window.addEventListener('mousedown', function(e) {
  isDown = true
  downVec.copy(cursor.position)
})

window.addEventListener('mouseup', function() {
  isDown = false
  downVec.set(0, 0, 0)
  pointsMaterial.uniforms.cursorTransform.value.set(0, 0, 0)
  sphereMat.uniforms.cursorTransform.value.set(0, 0, 0)
})



function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()