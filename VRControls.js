module.exports = function(editableMesh, cursor) {
  const ViveController = require('three-vive-controller')(THREE)
  var controller = new ViveController(0, renderer.vr)
  scene.add(controller)

  controller.on(controller.PadDragged, (dx, dy) => {
    cursor.setScale(cursor.scale.x * (1 + (dy)))
  })
  window.controller = controller

  controller.on(controller.TriggerClicked, () => {
    editableMesh.setTriggerDown(true, controller.position)
  })

  controller.on(controller.TriggerUnclicked, () => {
    editableMesh.setTriggerDown(false)
  })

  beforeRender(() => {
    if (controller.connected) {
      cursor.position.copy(controller.position)
    }
    editableMesh.setCursorPosition(cursor.position)
  })

}
