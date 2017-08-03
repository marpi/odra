var SequencerVisual = function () {

    var cubes
    var cubesSimple = []
    var cubesLooping = []
    var cubesSoundLength = []
    var time = 0
    var pointer1
    var selected;
    var raycaster = new THREE.Raycaster();
    var offset = new THREE.Vector3()
    var dPad, dPadBG, speedBar, speedBG, start, stop, dpadDis = 20
    var scene, camera

    var boxGeo1 = new THREE.BoxGeometry(10, 10, 1)
    var auto, autoText
    var progressBarWidth = 6

    var mat = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, fog: false, shading: THREE.FlatShading, vertexColors: THREE.VertexColors})
    var matGem = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, fog: false, shading: THREE.FlatShading, vertexColors: THREE.VertexColors})
    var colorMat = new THREE.MeshPhongMaterial({fog: false, shading: THREE.FlatShading})
    var invisibleMat = new THREE.MeshBasicMaterial({visible: false})

    var countdown = {value: 0}
    var progressBar, progressBG

    var number;
    var initialAngle;
    var auto = true;
    var animationOverride = false;
    var autoButton

    function init() {

        //init event listeners
        events.on("update", update);
        events.on("onBeat", onBeat);

        scene = VizHandler.getScene()
        camera = VizHandler.getCamera()

        document.addEventListener("touchmove", onDocumentTouchMove, false);
        document.addEventListener("touchstart", onDocumentTouchStart, false);
        document.addEventListener("touchend", onDocumentTouchEnd, false);

        if (!isMobile.any) {
            document.addEventListener("mousemove", onDocumentMouseMove, false);
            document.addEventListener("mousedown", onDocumentMouseDown, false);
            document.addEventListener("mouseup", onDocumentMouseUp, false);
        }

        prebuildMeshes()
    }

    function prebuildMeshes() {
        number = {random: new Math.seedrandom()};
        //var color = new THREE.Color().setHSL(number.random(), 0, 0);
        //var color2 = new THREE.Color().setHSL(number.random(), 0, .7);

        var scale = 1
        //var textGeo = Text.word("auto", scale)

        /*autoText = new THREE.Mesh(textGeo, colorMat)
         autoText.userData.auto = true;
         autoText.position.x = 0 - 5
         autoText.position.z = 100
         autoText.position.y = 35
         autoText.castShadow = true;
         autoText.receiveShadow = true;
         //textGeo.merge(textGeoBG)
         scene.add(autoText)*/


        progressBG = new THREE.Mesh(boxGeo1, mat)
        progressBG.castShadow = true;
        progressBG.receiveShadow = true;
        //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
        progressBG.position.x = 10
        progressBG.position.z = 100
        progressBG.position.y = 35
        progressBG.userData.progressBar = true
        progressBG.scale.x = progressBarWidth;
        progressBG.scale.y = .25;
        progressBG.scale.z = 1;

        progressBar = new THREE.Mesh(boxGeo1, mat)
        progressBar.castShadow = true;
        progressBar.receiveShadow = true;
        //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
        progressBar.position.x = progressBG.position.x
        progressBar.position.z = progressBG.position.z + 1
        progressBar.position.y = progressBG.position.y
        progressBar.userData.progressBar = true
        progressBar.scale.copy(progressBG.scale)
        progressBar.rotation.x = Math.PI

        scene.add(progressBar)
        scene.add(progressBG)

        progressBar.scale.x = 0.001
        progressBar.position.x = -progressBarWidth * 10 / 2 - 5

    }

    function build(id) {
        number = {random: new Math.seedrandom(id)};

        for (var i = 0; i < cubesSimple.length; i++) {
            scene.remove(cubesSimple[i])
        }
        scene.remove(pointer1)

        var color = new THREE.Color().setHSL(number.random(), .7, .5);
        var color2 = new THREE.Color().setHSL(number.random(), 0, .7);

        initialAngle = number.random() * Math.PI

        //var geos = []
        /*var boxGeo2 = new THREE.BoxGeometry(20, 10, 1)
         var boxGeo4 = new THREE.BoxGeometry(40, 10, 1)
         geos[1] = boxGeo1
         geos[2] = boxGeo2
         geos[4] = boxGeo4*/

        colorGeometry(boxGeo1, {color: color, color2: color2})

        cubes = []
        cubesSimple = []
        cubesLooping = []
        cubesSoundLength = []

        for (var _x = 0; _x < Sequencer.steps; _x++) {
            cubes[_x] = []
        }

        pointer1 = new THREE.Mesh(boxGeo1.clone(), mat)
        pointer1.castShadow = true;
        pointer1.receiveShadow = true;
        pointer1.position.z = 70
        pointer1.scale.y = .4;
        pointer1.scale.z = 20
        pointer1.rotation.x = Math.PI;
        pointer1.position.y = 60 + 10 * (Sequencer.channels / 2) + 10 / 2 + 5 / 2

        var pointer2 = new THREE.Mesh(boxGeo1.clone(), mat)
        pointer2.position.y = (10 * Sequencer.channels + 10 / 2 + 5 / 2) / pointer1.scale.y
        pointer2.updateMatrix();
        pointer1.geometry.merge(pointer2.geometry, pointer2.matrix);

        var pointerBG = new THREE.Mesh(boxGeo1.clone(), mat)
        pointerBG.position.y = (10 * Sequencer.channels / 2 + 10 / 2) / pointer1.scale.y
        pointerBG.position.z += .4
        pointerBG.scale.z = .2
        pointerBG.scale.y = Sequencer.channels * 2 + 4
        pointerBG.updateMatrix();
        pointer1.geometry.merge(pointerBG.geometry, pointerBG.matrix);

        pointer1.position.x = 10000

        scene.add(pointer1)

        dPadBG = new THREE.Mesh(boxGeo1, mat)
        dPadBG.castShadow = true;
        dPadBG.receiveShadow = true;
        //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
        dPadBG.position.x = 8 * 10 + 2 * 10
        dPadBG.position.z = 70
        dPadBG.position.y = 60 + 5
        dPadBG.userData.dPad = true;
        dPadBG.scale.x = 5;
        dPadBG.scale.y = 5;
        dPadBG.scale.z = 2;
        cubesSimple.push(dPadBG)
        scene.add(dPadBG)

        var pyramid = new THREE.CylinderGeometry(0, 6.95, 10, 4)
        colorGeometry(pyramid, {color: color, color2: color})
        dPad = new THREE.Mesh(pyramid, mat)
        dPad.castShadow = true;
        dPad.receiveShadow = true;
        //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
        dPad.position.x = 8 * 10 + 2 * 10// - 10
        dPad.position.z = 76
        dPad.position.y = 60 + 5// - 10
        dPad.userData.dPad = true;
        //dPad.scale.z = 10;
        dPad.rotation.x = Math.PI / 2
        dPad.rotation.y = Math.PI / 4
        cubesSimple.push(dPad)
        scene.add(dPad)

        speedBG = new THREE.Mesh(boxGeo1, mat)
        speedBG.castShadow = true;
        speedBG.receiveShadow = true;
        //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
        speedBG.position.x = 8 * 10 + 2 * 10
        speedBG.position.z = 70
        speedBG.position.y = 35
        speedBG.userData.speedBar = true
        speedBG.scale.x = 5;
        speedBG.scale.y = .5;
        speedBG.scale.z = 1;
        cubesSimple.push(speedBG)
        scene.add(speedBG)

        speedBar = new THREE.Mesh(boxGeo1, mat)
        speedBar.castShadow = true;
        speedBar.receiveShadow = true;
        //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
        speedBar.position.x = 8 * 10 + 2 * 10
        speedBar.position.z = 71
        speedBar.position.y = 35
        speedBar.userData.speedBar = true
        speedBar.scale.x = 1;
        speedBar.scale.y = .5;
        speedBar.scale.z = 1;
        speedBar.rotation.x = Math.PI

        cubesSimple.push(speedBar)
        scene.add(speedBar);

        var pyramid = new THREE.CylinderGeometry(0, 5.95, 8, 4)
        colorGeometry(pyramid, {color: color, color2: color2})
        start = new THREE.Mesh(pyramid, mat)
        start.castShadow = true;
        start.receiveShadow = true;
        start.position.x = -40 + 5
        start.position.z = 100
        start.position.y = 30 + 5
        start.userData.start = true;
        start.rotation.x = Math.PI / 4 + Math.PI * 1.5
        //start.rotation.y = Math.PI / 4
        start.rotation.z = -Math.PI / 2
        cubesSimple.push(start)
        scene.add(start)

        stop = new THREE.Mesh(boxGeo1, invisibleMat)
        stop.position.x = -40 + 10 + 4
        stop.position.z = 100
        stop.position.y = 30 + 5
        stop.userData.stop = true
        stop.scale.z = 1;
        stop.scale.x = 1;
        stop.scale.y = .8;
        stop.rotation.x = 0//Math.PI * .25 + Math.PI
        stop.userData.minis = []
        cubesSimple.push(stop)
        scene.add(stop)

        for (var j = 0; j < 2; j++) {
            var mini = new THREE.Mesh(boxGeo1, mat)
            mini.position.x = -2 + 4 * (j % 2)
            mini.castShadow = true;
            mini.receiveShadow = true;
            mini.scale.z = 4;
            mini.scale.x = .25;
            mini.scale.y = .8;
            stop.userData.minis[j] = mini
            mini.rotation.x = Math.PI
            stop.add(mini)
        }

        for (var i = 0; i < Sequencer.channels; i++) {
            var soundLengthButton = new THREE.Mesh(boxGeo1, invisibleMat)
            soundLengthButton.position.x = -10 * Sequencer.steps / 2 - 10 - 5
            soundLengthButton.position.z = 80
            soundLengthButton.position.y = 80 - 10 * i + 10 / 2
            soundLengthButton.userData.soundLength = true
            soundLengthButton.userData.soundLengthID = i
            soundLengthButton.scale.z = 1;
            soundLengthButton.scale.x = 1;
            soundLengthButton.scale.y = .8;
            soundLengthButton.rotation.x = 0//Math.PI * .25 + Math.PI
            soundLengthButton.userData.minis = []

            for (var j = 0; j < 4; j++) {
                var mini = new THREE.Mesh(boxGeo1, mat)
                //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
                mini.castShadow = true;
                mini.receiveShadow = true;
                mini.position.x = -2.5 + 5 * (j % 2)
                mini.position.z = 1
                mini.position.y = 2.5 - 5 * Math.floor(j / 2)
                mini.scale.z = 2;
                mini.scale.x = .4;
                mini.scale.y = .4;
                soundLengthButton.userData.minis[j] = mini
                mini.rotation.x = Math.PI
                soundLengthButton.add(mini)
            }

            cubesSimple.push(soundLengthButton)
            cubesSoundLength.push(soundLengthButton)
            scene.add(soundLengthButton)
        }

        /*for (var i = 0; i < 4; i++) {
         var loopButton = new THREE.Mesh(boxGeo1, mat)
         loopButton.castShadow = true;
         loopButton.receiveShadow = true;
         //dPadBG.position.y = 60 - 10 * (Sequencer.channels / 2) + 5 / 2
         loopButton.position.x = 10 * (4 * i - 6.5)
         loopButton.position.z = 90
         loopButton.position.y = 100
         loopButton.userData.looping = true
         loopButton.userData.loopingID = i
         loopButton.scale.z = 2;
         loopButton.scale.x = 2;
         loopButton.scale.y = .7;
         loopButton.rotation.x = 0
         cubesSimple.push(loopButton)
         cubesLooping.push(loopButton)
         scene.add(loopButton)
         }*/

        var geom = new THREE.TetrahedronGeometry(5, 1)
        var mod = 5
        for (var i = 0; i < geom.vertices.length; i++) {
            var v = geom.vertices[i]
            v.x += (number.random() - .5) * mod
            v.y += (number.random() - .5) * mod
            v.z += (number.random() - .5) * mod
        }
        colorGeometry(geom, {color: color, color2: color2})

        autoButton = new THREE.Mesh(geom, matGem)
        autoButton.userData.auto = true;
        autoButton.castShadow = true;
        //autoButton.receiveShadow = true;
        autoButton.position.x = 0
        autoButton.position.z = 80
        autoButton.position.y = 100
        autoButton.scale.x = 1
        autoButton.scale.y = 1
        autoButton.scale.z = 1
        autoButton.rotation.x = Math.PI
        cubesSimple.push(autoButton)
        scene.add(autoButton)

        TweenLite.to(progressBar.scale, 0, {x: 0.001});
        TweenLite.to(progressBar.position, 0, {x: -progressBarWidth * 10 / 2 + progressBG.position.x});
        //progressBar.scale.x = 0.001
        //progressBar.position.x = -progressBarWidth * 10 / 2 + progressBG.position.x

        //cubesSimple.push(progressBG)
        scene.add(progressBG)

        var time = (1 + number.random() * 2) * 60
        var outTime = 16
        TweenLite.killDelayedCallsTo(AudioHandler.switchTo)
        TweenLite.killDelayedCallsTo(AudioHandler.playNext)
        countdown.delay = TweenLite.to(countdown, time - outTime, {value: countdown.value + 1, onComplete: AudioHandler.playNext, onCompleteParams: [outTime]})
        countdown.tween1 = TweenLite.to(progressBar.scale, time, {x: progressBarWidth, ease: Linear.easeNone})
        countdown.tween2 = TweenLite.to(progressBar.position, time, {x: progressBG.position.x, ease: Linear.easeNone})

        dPad.position.x = dPadBG.position.x
        dPad.position.y = dPadBG.position.y

        for (var _y = 0; _y < Sequencer.channels; _y++) {
            rebuild(_y)
        }
    }

    function addCube(_x, _y) {
        var everyNNotes = Sequencer.noteScales()[_y]

        var extra = 0
        if (everyNNotes != 1)
            extra = everyNNotes / 2 - .5

        var full = new THREE.Mesh(boxGeo1, mat)
        full.position.x = 10 * (_x - Sequencer.steps / 2) + extra * 10
        full.position.y = 10 * (-_y + Sequencer.channels / 2) + 60
        full.position.z = 70
        full.scale.x = everyNNotes;
        full.scale.y = .8
        full.castShadow = true;
        full.receiveShadow = true;

        full.userData.x = _x
        full.userData.y = _y
        full.userData.scale = everyNNotes
        full.userData.dPad = false;

        if (_x % everyNNotes == 0)
            scene.add(full)

        cubes[_x][_y] = full;
        cubesSimple.push(full);
    }

    function rebuild(_y) {
        var scales = Sequencer.noteScales()
        var orgScales = Sequencer.soundLengths

        for (var _x = 0; _x < Sequencer.steps; _x++) {
            var oldCube = cubes[_x][_y]
            if (oldCube) {
                scene.remove(oldCube)
                cubesSimple = cubesSimple.filter(function (item) {
                    return item !== oldCube
                })
            }

            addCube(_x, _y)

            for (var s = 1; s < orgScales.length; s++) {
                if (orgScales[s] < scales[_y]) {
                    if (cubesSoundLength[_y].userData.minis[s - 1].position.x > 0) {
                        TweenLite.to(cubesSoundLength[_y].userData.minis[s - 1].rotation, .5, {delay: Math.random() / 3, y: Math.PI})
                    } else {
                        TweenLite.to(cubesSoundLength[_y].userData.minis[s - 1].rotation, .5, {delay: Math.random() / 3, y: -Math.PI})
                    }
                } else {
                    TweenLite.to(cubesSoundLength[_y].userData.minis[s - 1].rotation, .5, {delay: Math.random() / 3, y: 0})
                }
            }
        }
    }

    function colorGeometry(geometry, sizing) {
        var c = new THREE.Color(sizing.color);
        var f;
        var faceIndices = ['a', 'b', 'c'];
        for (var i = 0; i < geometry.faces.length; i++) {
            f = geometry.faces[ i ];
            c = new THREE.Color(sizing.color);
            if (f.normal.z > 0)
                c = new THREE.Color(sizing.color2);

            for (var j = 0; j < 3; j++) {
                vertexIndex = f[ faceIndices[ j ] ];
                p = geometry.vertices[ vertexIndex ];
                if (f.vertexColors[ j ]) {
                    f.vertexColors[ j ].copy(c)
                } else {
                    f.vertexColors[ j ] = c;
                }
            }
        }
        geometry.colorsNeedUpdate = true;
    }

    function onDocumentTouchMove(event) {
        if (event.touches.length === 1) {
            var mouse = new THREE.Vector2();
            mouse.x = (event.touches[ 0 ].pageX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
            findFromRay(mouse)
        }
    }

    function onDocumentMouseMove(event) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        findFromRay(mouse)
    }

    function onDocumentTouchStart(event) {
        if (event.touches.length === 1) {
            var mouse = new THREE.Vector2();
            mouse.x = (event.touches[ 0 ].pageX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
            findFromRay(mouse, true)
        }
    }

    function onDocumentMouseDown(event) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        findFromRay(mouse, true)
    }

    function onDocumentTouchEnd(event) {
        VizHandler.getControls().enableRotate = true;
        document.body.style.cursor = "auto";
        selected = null
        Mecha.onRelease()
    }

    function onDocumentMouseUp(event) {
        VizHandler.getControls().enableRotate = true;
        document.body.style.cursor = "auto";
        selected = null
        Mecha.onRelease()
    }

    function findFromRay(mouse, click) {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, VizHandler.getCamera());
        var intersects = raycaster.intersectObjects(cubesSimple);
        if (intersects[ 0 ]) {
            var o = intersects[ 0 ].object
            if (o.userData.dPad || o.userData.speedBar) {
                document.body.style.cursor = "-webkit-grab";
                //console.log(document.body.style.cursor)
            } else if (o.userData.disabled != true) {
                document.body.style.cursor = "pointer";
                //console.log(document.body.style.cursor)
            }
            if (selected || click) {

                if (o.userData.dPad) {
                    document.body.style.cursor = "-webkit-grabbing";
                    //console.log(document.body.style.cursor)
                    selected = o
                    //offset.copy(intersects[ 0 ].point).sub(selected.position);
                    VizHandler.getControls().enableRotate = false;

                    var pos = intersects[ 0 ].point//.sub(offset)
                    var center = new THREE.Vector3(8 * 10 + 2 * 10, 65, 0)
                    if (pos.x < center.x - dpadDis)
                        pos.x = center.x - dpadDis
                    if (pos.x > center.x + dpadDis)
                        pos.x = center.x + dpadDis
                    if (pos.y < center.y - dpadDis)
                        pos.y = center.y - dpadDis
                    if (pos.y > center.y + dpadDis)
                        pos.y = center.y + dpadDis
                    TweenLite.to(dPad.position, .1, {x: pos.x, y: pos.y, onUpdate: updateDPad})
                } else if (o.userData.looping) {
                    AudioHandler.triggerLooping(o.userData.loopingID)
                } else if (o.userData.soundLength) {
                    Sequencer.toggleSoundLength(o.userData.soundLengthID)
                } else if (o.userData.progressBar) {
                    /*if (!AudioHandler.isFadingOff()) {
                     var pos = intersects[ 0 ].point
                     pos.sub(progressBG.position)
                     var pro = (progressBarWidth * 10 / 2 + pos.x) / progressBarWidth / 10
                     countdown.delay.progress(pro);
                     countdown.tween1.progress(pro);
                     countdown.tween2.progress(pro);
                     }*/
                } else if (o.userData.speedBar) {
                    document.body.style.cursor = "-webkit-grabbing";
                    selected = o
                    VizHandler.getControls().enableRotate = false;
                    var pos = intersects[ 0 ].point
                    pos.sub(speedBG.position)
                    var pro = (40 / 2 + pos.x) / 40
                    if (pro < 0)
                        pro = 0
                    if (pro > 1)
                        pro = 1
                    AudioHandler.setBPM(pro)
                } else if (o.userData.start) {
                    AudioHandler.startPlayback()
                } else if (o.userData.stop) {
                    AudioHandler.stopPlayback()
                } else if (o.userData.auto) {
                    if (!AudioHandler.isPlaying())
                        return;
                    Sequencer.toggleAuto()
                } else {
                    Sequencer.toggle(o.userData.x, o.userData.y)
                }
            }
        } else {
            Mecha.findFromRay(mouse, click)
            document.body.style.cursor = "auto";
            //console.log(document.body.style.cursor)
        }
    }

    function updateDPad() {
        var percent1 = Math.max(0, (dPad.position.x - dPadBG.position.x)) / dpadDis
        var percent2 = Math.max(0, (dPad.position.y - dPadBG.position.y)) / dpadDis
        var percent3 = Math.max(0, -(dPad.position.x - dPadBG.position.x)) / dpadDis
        var percent4 = Math.max(0, -(dPad.position.y - dPadBG.position.y)) / dpadDis

        AudioHandler.pad(percent1, percent2, percent3, percent4)
    }

    function setBPM(pro) {
        speedBar.position.x = -20 + 40 * pro + speedBG.position.x
    }

    function copy(sequencer, column) {
        if (!cubes)
            return;

        if (selected != dPad && auto) {
            var perc = progressBar.scale.x / progressBarWidth
            var pos = dPad.position
            pos.x += Math.sin(initialAngle + 2 * perc * Math.PI * 2) * .3 * perc * perc
            pos.y += Math.cos(initialAngle + 2 * perc * Math.PI * 2) * .3 * perc * perc
            var center = new THREE.Vector3(8 * 10 + 2 * 10, 65, 0)
            if (pos.x < center.x - dpadDis)
                pos.x = center.x - dpadDis
            if (pos.x > center.x + dpadDis)
                pos.x = center.x + dpadDis
            if (pos.y < center.y - dpadDis)
                pos.y = center.y - dpadDis
            if (pos.y > center.y + dpadDis)
                pos.y = center.y + dpadDis
            //TweenLite.to(dPad.position, number.random() * 4, {onUpdate: updateDPad, x: dPadBG.position.x + perc * (number.random() * dpadDis * 2 - dpadDis), y: dPadBG.position.y + perc * (number.random() * dpadDis * 2 - dpadDis)})
            updateDPad()
        }

        var scales = Sequencer.noteScales()
        pointer1.position.x = 10 * (column - Sequencer.steps / 2)
        //console.log(sequencer.join('.'))
        for (var x = 0; x < Sequencer.steps; x++) {
            for (var y = 0; y < Sequencer.channels; y++) {
                var modx = x
                var scale = scales[y]
                if (scale != 1 && column % scale != 0) {
                    modx = Math.floor(column / scale) * scale
                }

                var cm = cubes[modx][y]
                var c = cubes[modx][y]

                if (x == column) {
                    if (sequencer[modx][y] != -1) {
                        TweenLite.to(cm.scale, .1, {z: 10}) // current, enabled
                        TweenLite.to(cm.position, .1, {z: 80})
                    } else {
                        TweenLite.to(cm.scale, .1, {z: 5}) // current, disabled
                        TweenLite.to(cm.position, .1, {z: 70})
                    }
                } else if (sequencer[modx][y] != -1) {
                    if (column % scale == 0) {
                        TweenLite.to(cm.scale, .3, {z: 5}) // all enabled
                        TweenLite.to(cm.position, .3, {z: 70})
                    }
                } else {
                    if (column % scale == 0) {
                        TweenLite.to(cm.scale, .3, {z: 1.7}) // all disabled
                        TweenLite.to(cm.position, .3, {z: 70})
                    }
                }

                if (sequencer[x][y] != -1) {
                    TweenLite.to(cubes[x][y].rotation, .8, {delay: .2, x: Math.PI}) // all enabled
                } else {
                    TweenLite.to(cubes[x][y].rotation, .8, {delay: .2, x: 0}) // all disabled
                }

            }
        }
    }

    function setLooping(looping) {
        for (var i = 0; i < cubesLooping.length; i++) {
            if (looping.start == i * 4 && looping.enabled) {
                TweenLite.to(cubesLooping[i].rotation, .5, {x: Math.PI * 1})
            } else {
                TweenLite.to(cubesLooping[i].rotation, .5, {x: Math.PI * 0})

            }
        }

        var scales = Sequencer.noteScales()
        for (var x = 0; x < Sequencer.steps; x++) {
            for (var y = 0; y < Sequencer.channels; y++) {
                var modx = x
                var scale = scales[y]
                if (scale != 1 && x % scale != 0) {
                    modx = Math.floor(x / scale) * scale
                }

                var c = cubes[modx][y]
                if (looping.enabled == false) {
                    TweenLite.to(c.scale, .5, {y: .8})
                } else {
                    if (modx >= looping.start && modx < looping.end)
                        TweenLite.to(c.scale, .5, {y: .8})
                    else {
                        TweenLite.to(c.scale, .5, {y: .2})
                    }
                }

            }
        }
    }

    function onBeat() {
    }

    function update() {
        time += .01
        for (var x = 0; x < Sequencer.steps; x++) {
            for (var y = 0; y < Sequencer.channels; y++) {
                cubes[x][y].rotation.y = noise.simplex3(x / 5, y / 5, time) / cubes[x][y].userData.scale
            }
        }
        for (var i = 0; i < cubesLooping.length; i++) {
            cubesLooping[i].rotation.y = noise.simplex3(i, 6, time) / 4
        }
        var rot = .01
        if (auto || animationOverride) {
            autoButton.rotation.x += rot
            autoButton.rotation.y += rot
            if (autoButton.rotation.x > Math.PI)
                autoButton.rotation.x -= Math.PI * 2
            if (autoButton.rotation.y > Math.PI)
                autoButton.rotation.y -= Math.PI * 2
        }
    }

    function toggleAuto(enabled, override) {
        auto = enabled;
        animationOverride = override
        if (!enabled) {
            //TweenLite.to(auto.rotation, .5, {x: 0})
            countdown.delay.pause()
            countdown.tween1.pause()
            countdown.tween2.pause()
            TweenLite.to(progressBar.scale, .5, {y: 0.00000001, onComplete: hide, onCompleteParams: [progressBar]})
            TweenLite.to(start.scale, .5, {x: 0.00000001, onComplete: hide, onCompleteParams: [start]})
            TweenLite.to(stop.scale, .5, {y: 0.00000001, onComplete: hide, onCompleteParams: [stop]})
            TweenLite.to(progressBG.scale, .5, {y: 0.00000001, onComplete: hide, onCompleteParams: [progressBG]})
            //TweenLite.to(start.position, .5, {x: 15})
            //TweenLite.to(stop.position, .5, {x: 15})
        } else {
            //TweenLite.to(auto.rotation, .5, {x: Math.PI})
            if (AudioHandler.isPlaying()) {
                countdown.delay.play()
                countdown.tween1.play()
                countdown.tween2.play()
            }
            progressBar.visible = progressBG.visible = true;
            TweenLite.to(progressBar.scale, .5, {y: .25})
            start.visible = stop.visible = true;
            TweenLite.to(start.scale, .5, {x: 1})
            TweenLite.to(stop.scale, .5, {y: 1})
            TweenLite.to(progressBG.scale, 1, {x: progressBarWidth, y: .25, z: 1})
            //TweenLite.to(autoButton.rotation, .5, {x: 0, y: 0, z: 0})
            //TweenLite.to(start.position, .5, {x: -40})
            //TweenLite.to(stop.position, .5, {x: -40 + 10})
        }
    }
    function togglePlaying(playing) {
        if (playing) {
            TweenLite.to(start.rotation, .5, {x: Math.PI / 4 + Math.PI * 1.5})
            TweenLite.to(stop.rotation, .5, {x: 0})
            start.userData.disabled = true
            stop.userData.disabled = false

            if (AudioHandler.isPlaying()) {
                countdown.delay.play()
                countdown.tween1.play()
                countdown.tween2.play()
            }
        } else {
            TweenLite.to(start.rotation, .5, {x: Math.PI / 4 + Math.PI * 0.5})
            TweenLite.to(stop.rotation, .5, {x: Math.PI})
            start.userData.disabled = false
            stop.userData.disabled = true

            countdown.delay.pause()
            countdown.tween1.pause()
            countdown.tween2.pause()
        }

    }
    function hide(item) {
        item.visible = false
    }

    return {
        init: init,
        onBeat: onBeat,
        update: update,
        copy: copy,
        build: build,
        rebuild: rebuild,
        setLooping: setLooping,
        toggleAuto: toggleAuto,
        togglePlaying: togglePlaying,
        setBPM: setBPM,
    }

}
();