var Monster = function () {

    var scene
    var soundVizArray = []
    var bpm = 0

    var grid = {x: 1, z: 1}
    var center = {x: 0, z: 0}

    var meshes = []

    function init() {

        //init event listeners
        events.on("update", update);

        scene = VizHandler.getScene();

        for (var _x = 0; _x < grid.x; _x++) {
            meshes[_x] = []
            for (var _z = 0; _z < grid.z; _z++) {
                meshes[_x][_z] = null
            }
        }
        for (var i = 0; i < Sequencer.channels; i++) {
            soundVizArray[i] = 1
        }
    }

    function animate(array, col, noteScales) {
        for (var i = 0; i < Sequencer.channels; i++) {
            if (array[i] != -1 && col % noteScales[i] == 0) {
                soundVizArray[i] = 1
            }
        }
    }

    function rebuild(seed) {
        for (var _x = 0; _x < grid.x; _x++) {
            for (var _z = 0; _z < grid.z; _z++) {
                if (meshes[_x][_z]) {
                    scene.remove(meshes[_x][_z])
                    meshes[_x][_z].geometry.dispose()
                    meshes[_x][_z] = null
                }

                var n = Math.random()
                if (_x == center.x && _z == center.z)
                    n = seed

                var mesh = MonsterObject.rebuild(n)
                if (grid.x != 1 && grid.z != 1)
                    mesh.position.set(_x * 700 - 700, 0, _z * 700 - 700)
                scene.add(mesh)
                meshes[_x][_z] = mesh;
            }
        }
    }

    function update() {
        for (var _x = 0; _x < grid.x; _x++) {
            for (var _z = 0; _z < grid.z; _z++) {

                var time = Date.now() * 0.0002;

                var mod
                var addedMod
                var mesh = meshes[_x][_z]
                var topBone;
                var roi
                for (var k = 0; k < mesh.skeleton.bones.length; k++) {
                    var i = mesh.skeleton.bones[ k ].i
                    var r = Math.sin(Math.PI * 4 * i / 2000)

                    roi = i
                    if (Math.sin(roi) > 0.5)
                        roi += Math.PI

                    if (mesh.skeleton.bones[ k ].top) {
                        var radius = (Math.sin(Math.PI + k) / 2 + .5) * 20;
                        mesh.skeleton.bones[ k ].position.x = radius * Math.sin(2 * Math.PI * i * .3);
                        mesh.skeleton.bones[ k ].position.y = 0;
                        mesh.skeleton.bones[ k ].position.z = radius * Math.cos(2 * Math.PI * i * .3);

                        topBone = mesh.skeleton.bones[ k ];

                        if (_x == center.x && _z == center.z && soundVizArray[i % Sequencer.channels] == 1) {
                            var pos = topBone.position.clone()
                            var dis = topBone.sizing.height
                            pos.x += Math.sin(roi - Math.PI / 2) * dis * .58
                            pos.z += Math.cos(roi - Math.PI / 2) * dis * .58
                            Mecha.crack(pos, (topBone.sizing.radiusTop) * .1 + .6)
                            Mecha.hit(pos)
                        }
                    } else {
                        var s = 1 * Math.PI * soundVizArray[i % Sequencer.channels] / (topBone.sizing.segmentCount - 1)
                        var s2 = .04 * Math.PI * (Math.sin(time * (10 + 20 * bpm) + 5 * k) / 2 + .5) * soundVizArray[i % Sequencer.channels]
                        //TweenLite.to(mesh.skeleton.bones[ k ].position, .3, {x: t.x, z: t.z})
                        TweenLite.to(mesh.skeleton.bones[ k ].rotation, .15, {x: Math.sin(roi) * s, z: Math.cos(roi) * s})
                        TweenLite.to(mesh.skeleton.bones[ k ].scale, .15, {x: .92 + s2, z: .92 + s2})
                    }
                }
            }
        }


        for (var i = 0; i < Sequencer.channels; i++) {
            soundVizArray[i] -= (soundVizArray[i] - .5) / 55
        }
    }

    function setBPM(pro) {
        bpm = pro;
    }

    return {
        init: init,
        update: update,
        animate: animate,
        rebuild: rebuild,
        setBPM: setBPM,
    }

}
();