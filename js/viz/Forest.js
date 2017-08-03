var Forest = function () {

    var globalGeometry = new THREE.Geometry();
    var globalBones = [];
    var globalCount = 0;
    var globalNum = 0;
    var globalMesh;

    var scene, number

    var tweenTarget = new THREE.Vector3();
    var soundVizArray = [0, 0, 0]

    var radius = 400
    var updatedOnce = false;

    function init() {

        //init event listeners
        events.on("update", update);
        events.on("onBeat", onBeat);

        scene = VizHandler.getScene();
    }

    function rebuild(seed) {
        number = {random: new Math.seedrandom(seed)};

        if (globalMesh) {
            scene.remove(globalMesh)
            globalMesh.geometry.dispose()
            globalMesh.material.dispose()
            globalMesh = null;
        }

        if (isMobile.any)
            radius = 200

        //skeletonHelpers = [];

        globalGeometry = new THREE.Geometry();
        globalBones = [];
        globalCount = 0;
        globalNum = 0;

        var material = new THREE.MeshStandardMaterial({
            fog: false,
            skinning: true,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors,
        });

        var color = new THREE.Color().setHSL(number.random(), .3, .6);
        var color2 = new THREE.Color().setHSL(number.random(), 0, .7);

        var max = 200
        if (isMobile.any)
            max = 70;
        for (var i = 0; i < max; i++) {
            var segmentHeight = Math.floor(number.random() * 8) + 8
            var segmentCount = 3//Math.floor(number.random() * 1) + 2
            var height = segmentHeight * segmentCount;
            var halfHeight = height * 0.5;
            var radiusBottom = 5 + (1 + Math.sin(4.5 + i % 10)) * 3

            var sizing = {
                color: color,
                color2: color2,
                segmentHeight: segmentHeight,
                segmentCount: segmentCount,
                height: height,
                halfHeight: halfHeight,
                radiusBottom: radiusBottom,
                i: i
            };

            var geometry = createGeometry(sizing, i % 4);
            globalGeometry.merge(geometry)

            globalCount += segmentCount + 1;
            globalNum += 1;

            createBones(sizing);
        }


        globalMesh = createMesh(globalGeometry, globalBones, material);
        globalMesh.castShadow = true;
        globalMesh.receiveShadow = true;
        globalMesh.frustumCulled = false;
        scene.add(globalMesh);

    }

    function createMesh(geometry, bones, material) {

        var mesh = new THREE.SkinnedMesh(geometry, material);
        var skeleton = new THREE.Skeleton(bones);

        for (var i = 0; i < bones.length; i++) {
            if (bones[i].top)
                mesh.add(bones[ i ]);
        }
        mesh.bind(skeleton);

        //var skeletonHelper = new THREE.SkeletonHelper(mesh);
        //skeletonHelper.material.linewidth = 2;
        //VizHandler.getScene().add(skeletonHelper);
        //skeletonHelpers.push(skeletonHelper)

        return mesh;

    }

    function createGeometry(sizing, geoType) {
        geoType = 0

        var geometry = new THREE.CylinderGeometry(
                0, // radiusTop
                sizing.radiusBottom, // radiusBottom
                sizing.height, // height
                8, // radiusSegments
                sizing.segmentCount, // heightSegments
                true                     // openEnded
                );

        if (geoType == 1)
            geometry = new THREE.TetrahedronGeometry(sizing.radiusBottom, 1)
        if (geoType == 2)
            geometry = new THREE.OctahedronGeometry(sizing.radiusBottom, 1)
        if (geoType == 3)
            geometry = new THREE.BoxGeometry(sizing.radiusBottom, sizing.radiusBottom, sizing.radiusBottom)

        for (var i = 0; i < geometry.vertices.length; i++) {
            var turbulence = Math.random() * 3

            var vertex = geometry.vertices[ i ];
            var y = (vertex.y + sizing.halfHeight);

            var skinIndex = Math.floor(y / sizing.segmentHeight);
            var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

            //vertex.x -= (.5 - Math.random()) * turbulence * (0 + sizing.radiusBottom) / 2
            //vertex.z -= (.5 - Math.random()) * turbulence * (0 + sizing.radiusBottom) / 2
            vertex.x *= 1 + Math.random() * turbulence

            vertex.x += (Math.random() - .5) * turbulence
            vertex.z *= 1 + Math.random() * turbulence

            //console.log(vertex)

            geometry.skinIndices.push(new THREE.Vector4(globalCount + skinIndex, globalCount + skinIndex + 1, 0, 0));
            geometry.skinWeights.push(new THREE.Vector4(1 - skinWeight, skinWeight, 0, 0));

        }

        colorGeometry(geometry, sizing)

        return geometry;

    }

    function colorGeometry(geometry, sizing) {
        var c = new THREE.Color(sizing.color);
        var f;
        var faceIndices = ['a', 'b', 'c'];
        for (var i = 0; i < geometry.faces.length; i++) {
            f = geometry.faces[ i ];
            c = new THREE.Color(sizing.color);
            if (Math.sin(i * .3) > .5)
                c = new THREE.Color(sizing.color2);

            for (var j = 0; j < 3; j++) {
                vertexIndex = f[ faceIndices[ j ] ];
                p = geometry.vertices[ vertexIndex ];
                f.vertexColors[ j ] = c;
            }
        }
    }

    function createBones(sizing) {

        bones = [];

        var prevBone = new THREE.Bone();
        prevBone.top = true;
        prevBone.i = sizing.i;
        bones.push(prevBone);
        globalBones.push(prevBone);
        prevBone.position.y = -sizing.halfHeight;

        for (var i = 0; i < sizing.segmentCount; i++) {

            var bone = new THREE.Bone();
            bone.position.y = sizing.segmentHeight;
            bone.i = sizing.i;
            globalBones.push(bone);
            bones.push(bone);
            prevBone.add(bone);
            prevBone = bone;

        }

        return bones;

    }

    function animate(array, col, noteScales) {
        for (var i = 0; i < Sequencer.channels; i++) {
            if (array[i] != -1 && col % noteScales[i] == 0) {
                soundVizArray[i] = 1
            }
        }
    }

    function update() {
        if (!globalMesh)
            return;

        if (isMobile.any && updatedOnce)
            return;

        var time = Date.now() * 0.001;
        var cursorPosition = Mecha.cursorPosition();

        TweenLite.to(tweenTarget, .3, {x: cursorPosition.x, y: cursorPosition.y, z: cursorPosition.z});

        var positions = []
        var creatures = Mecha.getCreatures();
        positions.push(tweenTarget)
        for (var i = 0; i < creatures.length; i++) {
            positions.push(creatures[i].movement.position)
        }

        var mod
        var addedMod
        var mesh = globalMesh
        var topPosition;
        for (var k = 0; k < mesh.skeleton.bones.length; k++) {
            var i = mesh.skeleton.bones[ k ].i
            var r = Math.sin(Math.PI * 4 * i / 2000)
            if (mesh.skeleton.bones[ k ].top) {
                var radius = 100 + (Math.sin(Math.PI + i) / 2 + .5) * 400;
                mesh.skeleton.bones[ k ].position.x = radius * Math.sin(2 * Math.PI * r);
                mesh.skeleton.bones[ k ].position.y = 0;
                mesh.skeleton.bones[ k ].position.z = radius * Math.cos(2 * Math.PI * r);

                topPosition = mesh.skeleton.bones[ k ].position;

                mod = 0;
                addedMod = 0;
                for (var i = 0; i < positions.length; i++) {
                    var dis = mesh.skeleton.bones[ k ].position.distanceTo(positions[i])
                    mod += 50 - dis
                    if (mod < 0)
                        mod = 0
                    if (mod > 70)
                        mod = 70
                    mod *= .025
                    addedMod += mod
                }
                if (addedMod > .75)
                    addedMod = .75
            } else {

                var t = new THREE.Vector3()
                t.x = addedMod * 10 * Math.sin(-k + 1 + 3 * time + r)
                t.z = addedMod * 10 * Math.cos(-k + 1 + 2 * time + r)
                //var mod = topPosition.distanceTo(scene.position) / 2
                //if (Math.random() < .01)
                //console.log(mod)
                var abs = soundVizArray[i % Sequencer.channels]//Math.abs(mod - (1 - soundVizArray[i % Sequencer.channels]))
                //if (abs < .3) {
                t.x *= 1 + .5 * (abs / .3) * Math.sin(k + time * 4 / 5)// + Math.sin(k) * 3
                t.z *= 1 + .5 * (abs / .3) * Math.cos(k + time * 4 / 5)// + Math.cos(k) * 3
                //}
                TweenLite.to(mesh.skeleton.bones[ k ].position, .1, {x: t.x, z: t.z})
                //if()
            }
        }


        for (var i = 0; i < Sequencer.channels; i++) {
            soundVizArray[i] -= soundVizArray[i] / 25
        }
        //skeletonHelpers[j].update();

        if (isMobile.any)
            updatedOnce = true;
    }

    function onBeat() {
    }

    return {
        init: init,
        animate: animate,
        update: update,
        rebuild: rebuild,
        onBeat: onBeat,
    }

}
();