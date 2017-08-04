const PointShader = require('./ProportionalPointsMaterial')
const Easings = require('./easings')

var tmpV3 = new THREE.Vector3()
function dist(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt(
    (x2 - x1) * (x2 - x1) +
    (y2 - y1) * (y2 - y1) +
    (z2 - z1) * (z2 - z1)
  )
}

class EditableMesh extends THREE.Object3D {
  constructor(geometry) {
    super()
    this.geometry = geometry
    this.sphereMat = new THREE.ShaderMaterial({
      vertexShader: PointShader.vertexShader,
      fragmentShader: PointShader.meshFragmentShader,
      uniforms: {
        cursorPosition: {type: 'v3', value: new THREE.Vector3()},
        cursorSize: {type: 'f', value: 1},
        cursorTransform: {type: 'v3', value: new THREE.Vector3()}
      }
    })
    this.sphereMesh = new THREE.Mesh(geometry, this.sphereMat)
    this.add(this.sphereMesh)
    
    this.pointsMaterial = new THREE.ShaderMaterial({
      fragmentShader: PointShader.pointsFragmentShader,
      vertexShader: PointShader.vertexShader,
      transparent: true,
      uniforms: {
        cursorPosition: {type: 'v3', value: new THREE.Vector3()},
        cursorSize: {type: 'f', value: 1},
        cursorTransform: {type: 'v3', value: new THREE.Vector3()}
      }
    })
    this.points = new THREE.Points(
      geometry,
      this.pointsMaterial
    )
    this.add(this.points)
    this.downPosition = new THREE.Vector3()
    this.currentTransform = new THREE.Vector3()
    this.isDown = false
    this.effectRadius = 1
  }
  
  setCursorPosition(cursorPosition) {
    if (this.isDown) {
      this.currentTransform.subVectors(cursorPosition, this.downPosition)
      this.setUniform('cursorTransform', this.currentTransform)
    } else {
      this.setUniform('cursorPosition', cursorPosition.x, cursorPosition.y, cursorPosition.z)
    }
  }
  
  setTriggerDown(down, cursorPosition) {
    this.isDown = down
    if (!down) {
      this.applyTransformation()
    }
    if (cursorPosition) {
      this.downPosition.copy(cursorPosition)
    } else {
      this.downPosition.set(0, 0, 0)
    }
    if (!this.isDown) {
      this.setUniform('cursorTransform', 0, 0, 0)
    }
  }
  
  setEffectRadius(size) {
    this.effectRadius = size
    this.setUniform('cursorSize', size)
  }
  
  setUniform(name, x, y, z) {
    if (x instanceof THREE.Vector3) {
      this.pointsMaterial.uniforms[name].value.copy(x)
      this.sphereMat.uniforms[name].value.copy(x)
    } else if (y !== undefined) {
      this.pointsMaterial.uniforms[name].value.set(x, y, z)
      this.sphereMat.uniforms[name].value.set(x, y, z)
    } else {
      this.pointsMaterial.uniforms[name].value = x
      this.sphereMat.uniforms[name].value = x
    }
  }
  
  applyTransformation() {
    const positions = this.geometry.attributes.position.array
    for (var i = 0; i < positions.length; i += 3) {
      var d = dist(
        positions[i], positions[i + 1], positions[i + 2],
        this.downPosition.x, this.downPosition.y, this.downPosition.z
      )
      var strength = Math.max(0, 1 - d / this.effectRadius)
      strength = Easings.easeInOutQuad(strength)
      positions[i] += this.currentTransform.x * strength
      positions[i + 1] += this.currentTransform.y * strength
      positions[i + 2] += this.currentTransform.z * strength
    }
    this.geometry.attributes.position.needsUpdate = true
  }

}

module.exports = EditableMesh