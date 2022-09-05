function main(thisObj) {
  // mainWin
  // ======
  var mainWin = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptname, undefined, { resizeable: true });
  mainWin.alignChildren = ["center", "top"];
  mainWin.spacing = 5;

  // INTERVAL
  // ========
  var interval = mainWin.add("group", undefined, { name: "interval" });
  interval.orientation = "row";
  interval.alignChildren = ["left", "center"];
  interval.spacing = 10;
  interval.margins = 0;

  var colText = interval.add("statictext", undefined, undefined, { name: "colText" });
  colText.text = "column";

  var columnNum = interval.add('edittext {properties: {name: "columnNum"}}');
  columnNum.preferredSize.width = 36;
  columnNum.text = '4'

  // SPACE
  // =====
  var space = mainWin.add("group", undefined, { name: "space" });
  space.orientation = "row";
  space.alignChildren = ["left", "center"];
  space.spacing = 10;
  space.margins = 0;

  var spaceText = space.add("statictext", undefined, undefined, { name: "spaceText" });
  spaceText.text = "space";

  var spaceNum = space.add('edittext {properties: {name: "spaceNum"}}');
  spaceNum.preferredSize.width = 36;
  spaceNum.text = '100'

  // mainWin
  // ======
  var exeBtn = mainWin.add("button", undefined, undefined, { name: "exeBtn" });
  exeBtn.text = "Excute";

  mainWin.onResize = function () {
    mainWin.layout.resize();
  }

  mainWin.layout.layout();

  exeBtn.onClick = function () {
    app.beginUndoGroup("grid text");
    try {
      var comp = app.project.activeItem;
      var selectedLayers = comp.selectedLayers;
      for (var i = 0; i < selectedLayers.length; i++) {
        var selectedLayer = selectedLayers[i];
        var position = selectedLayer.property('ADBE Transform Group').property('ADBE Position')
        var numKey = position.numKeys
        var x = (i % parseInt(columnNum.text)) * parseInt(spaceNum.text)
        var y = Math.floor(i / parseInt(columnNum.text)) * parseInt(spaceNum.text)
        if (!position.dimensionsSeparated) {
          // 次元分割されていない場合
          if (numKey == 0) {
            position.setValue([x, y, position.value[2]])
          } else {
            position.setValueAtTime(comp.time, [x, y, position.value[2]])
          }
        } else {
          // 次元分割されている場合
          if (numKey == 0) {
            selectedLayer.property("ADBE Transform Group").property("ADBE Position_0").setValue(x)
            selectedLayer.property("ADBE Transform Group").property("ADBE Position_1").setValue(y)
            if (selectedLayer.threeDLayer) {
              selectedLayer.property("ADBE Transform Group").property("ADBE Position_2").setValue(selectedLayer.property("ADBE Transform Group").property("ADBE Position_2").value)
            }
          } else {
            selectedLayer.property("ADBE Transform Group").property("ADBE Position_0").setValueAtTime(comp.time, x)
            selectedLayer.property("ADBE Transform Group").property("ADBE Position_1").setValueAtTime(comp.time, y)
            if (selectedLayer.threeDLayer) {
              selectedLayer.property("ADBE Transform Group").property("ADBE Position_2").setValueAtTime(comp.time, selectedLayer.property("ADBE Transform Group").property("ADBE Position_2").valueAtTime(comp.time, true))
            }
          }
        }
      }
    } catch (e) {
      alert(e)
    }
    app.endUndoGroup();
  }
}
main(this)