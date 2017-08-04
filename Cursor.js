module.exports = function(editableMesh) {
  const cursor = new THREE.Mesh(
    new THREE.SphereBufferGeometry(1, 16, 16),
    new THREE.MeshPhongMaterial({
      transparent: true,
      color: 'white',
      opacity: 0.5,
      depthWrite: false
    })
  )

  cursor.setScale = function(s) {
    cursor.scale.set(s, s, s)
    editableMesh.setEffectRadius(s)
  }
  cursor.setScale(0.2)
  scene.add(cursor)
  
  return cursor
}