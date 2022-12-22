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
  exeBtn.text = "Execute";

  mainWin.onResize = function () {
    mainWin.layout.resize();
  }

  mainWin.layout.layout();

  /**
   * ポジションを設定する関数 ポジションにキーフレームがあればsetValueAtTimeを使って現在の時間にキーフレームを追加する
   * @param {*} layer レイヤー
   * @param {*} XYarray 配列[x, y, z]
   */
  function setPosition(layer, XYZarray) {
    try {
      var comp = app.project.activeItem;
      var x = XYZarray[0]
      var y = XYZarray[1]
      var z = XYZarray[2]
      var position = layer.property('ADBE Transform Group').property('ADBE Position')
      if (!position.dimensionsSeparated) {
        // 次元分割されていない場合
        var numKey = position.numKeys
        if (numKey == 0) {
          position.setValue([x, y, z])
        } else {
          position.setValueAtTime(comp.time, [x, y, z])
        }
      } else {
        // 次元分割されている場合
        var positionX = layer.property('ADBE Transform Group').property('ADBE Position_0')
        var positionY = layer.property('ADBE Transform Group').property('ADBE Position_1')
        var positionZ = layer.property('ADBE Transform Group').property('ADBE Position_2')
        var numKeyX = positionX.numKeys
        var numKeyY = positionY.numKeys
        var numKeyZ = positionZ.numKeys
        if (numKeyX + numKeyY + numKeyZ == 0) {
          layer.property("ADBE Transform Group").property("ADBE Position_0").setValue(x)
          layer.property("ADBE Transform Group").property("ADBE Position_1").setValue(y)
          if (layer.threeDLayer) {
            layer.property("ADBE Transform Group").property("ADBE Position_2").setValue(z)
          }
        } else {
          layer.property("ADBE Transform Group").property("ADBE Position_0").setValueAtTime(comp.time, x)
          layer.property("ADBE Transform Group").property("ADBE Position_1").setValueAtTime(comp.time, y)
          if (layer.threeDLayer) {
            layer.property("ADBE Transform Group").property("ADBE Position_2").setValueAtTime(comp.time, z)
          }
        }
      }
    } catch (e) {
      alert(e.message + e.line)
    }
  }

  exeBtn.onClick = function () {
    app.beginUndoGroup("grid text");
    try {
      var comp = app.project.activeItem;
      var selectedLayers = comp.selectedLayers;
      for (var i = 0; i < selectedLayers.length; i++) {
        var selectedLayer = selectedLayers[i];
        var position = selectedLayer.property('ADBE Transform Group').property('ADBE Position')
        var x = (i % parseInt(columnNum.text)) * parseInt(spaceNum.text)
        var y = Math.floor(i / parseInt(columnNum.text)) * parseInt(spaceNum.text)
        // zは変更しないのでポジションの値をそのまま渡す
        setPosition(selectedLayer, [x, y, position.value[2]])
      }
    } catch (e) {
      alert(e.message + e.line)
    }
    app.endUndoGroup();
  }
}
main(this)