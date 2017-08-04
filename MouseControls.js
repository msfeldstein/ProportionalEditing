module.exports = function(editableMesh, cursor) {
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100, 2, 2),
    new THREE.MeshBasicMaterial()
  )

  window.addEventListener('wheel', function(e) {
    e.preventDefault()
    cursor.setScale(cursor.scale.x * (1 + (e.deltaY / 100)))
  })

  window.addEventListener('mousemove', function(event) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObject( plane );
    if (intersects.length > 0) {
      cursor.position.copy(intersects[0].point)
    }
  })
  
  window.addEventListener('mousedown', function(e) {
    editableMesh.setTriggerDown(true, cursor.position)
  })

  window.addEventListener('mouseup', function() {
    editableMesh.setTriggerDown(false)
  })
}