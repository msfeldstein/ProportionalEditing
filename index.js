window.USEVR = true
require('./boilerplate')
const EditableMesh = require('./EditableMesh')

const sphereGeo = new THREE.IcosahedronBufferGeometry(0.5,7)
const sphere = new EditableMesh(sphereGeo)
scene.add(sphere)
sphere.position.set(-.2, .44, 1.1)
scene.add(new THREE.AmbientLight(0x3f3f3f))
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(50, 50, 50)
scene.add(light)

const cursor = require('./Cursor')(sphere)
require('./MouseControls')(sphere, cursor)
require('./VRControls')(sphere, cursor)


beforeRender(() => {
  sphere.setCursorPosition(cursor.position)
})
