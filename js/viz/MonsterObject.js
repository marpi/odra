var MonsterObject = function () {

    var globalGeometry = new THREE.Geometry();
    var globalBones = [];
    var globalCount = 0;
    var globalNum = 0;
    var globalMesh;

    var number

    var tweenTarget = new THREE.Vector3();
    var soundVizArray = []

    function init() {

        //init event listeners
        events.on("update", update);
        events.on("onBeat", onBeat);
    }

    function rebuild(seed) {
        number = {random: new Math.seedrandom(seed)};

        if (globalMesh) {
            globalMesh.geometry.dispose()
            globalMesh.material.dispose()
            globalMesh = null;
        }

        //skeletonHelpers = [];

        for (var i = 0; i < Sequencer.channels; i++) {
            soundVizArray[i] = 1
        }

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

        var color = new THREE.Color().setHSL(number.random(), .7, .5);
        var color2 = new THREE.Color().setHSL(number.random(), 0, .7);

        for (var i = 0; i < 5; i++) {
            var segmentHeight = Math.floor(number.random() * 20) + 15
            var segmentCount = Math.floor(number.random() * 6) + 6
            var height = segmentHeight * segmentCount;
            var halfHeight = height * 0.5;
            var radiusBottom = 5 + Math.random() * 20
            var radiusTop = 5 + Math.random() * 15

            var sizing = {
                color: color,
                color2: color2,
                segmentHeight: segmentHeight,
                segmentCount: segmentCount,
                height: height,
                halfHeight: halfHeight,
                radiusBottom: radiusBottom,
                radiusTop: radiusTop,
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


        return globalMesh;

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
        //skeletonHelpers.push(skeletonHelper)

        return mesh;

    }

    function createGeometry(sizing, geoType) {
        geoType = 0

        var geometry = new THREE.CylinderGeometry(
                sizing.radiusTop, // radiusTop
                sizing.radiusBottom, // radiusBottom
                sizing.height, // height
                8, // radiusSegments
                sizing.segmentCount, // heightSegments
                false                     // openEnded
                );

        if (geoType == 1)
            geometry = new THREE.TetrahedronGeometry(sizing.radiusBottom, 1)
        if (geoType == 2)
            geometry = new THREE.OctahedronGeometry(sizing.radiusBottom, 1)
        if (geoType == 3)
            geometry = new THREE.BoxGeometry(sizing.radiusBottom, sizing.radiusBottom, sizing.radiusBottom)

        //geometry = getGeometry()

        for (var i = 0; i < geometry.vertices.length; i++) {
            var turbulence = Math.random() * 3

            var vertex = geometry.vertices[ i ];
            var y = (vertex.y + sizing.halfHeight);

            var skinIndex = Math.floor(y / sizing.segmentHeight);
            var skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

            //vertex.x -= (.5 - Math.random()) * turbulence * (0 + sizing.radiusBottom) / 2
            //vertex.z -= (.5 - Math.random()) * turbulence * (0 + sizing.radiusBottom) / 2
            if (skinIndex==sizing.segmentCount) {
                vertex.x = vertex.z = 0
            } else {
                vertex.x *= 1 + Math.random() * turbulence
                vertex.z *= 1 + Math.random() * turbulence
            }

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
        prevBone.sizing = sizing
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

    function animate(array) {
        for (var i = 0; i < Sequencer.channels; i++) {
            if (array[i] != -1) {
                soundVizArray[i] = 1
            }
        }
    }

    function update() {


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