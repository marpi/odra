var Shards = function () {
    var groupHolder;
    var multiMaterial

    var drewNewShape = false;
    var scl = 0;
    var full;
    var spd = 0;
    var mod = 0;
    var speed = .035;
    var back = false;
    var main;
    var timeout
    var flotilla = []
    var isMobile = {any: false};
    var plane;
    var rings = []
    var material
    var time = 0
    var number
    function init() {

        //init event listeners
        events.on("update", update);
        events.on("onBeat", onBeat);


        var shininess = 50, specular = 0xffffff, bumpScale = .055, shading = THREE.SmoothShading;
        //var reflectionCube = Assets.getCubeMap(12)
        //reflectionCube.format = THREE.RGBFormat;
        var roughness = .5;
        var metalness = .7;
        //var diffuseColor = new THREE.Color(.1,.1,.1);
        material = new THREE.MeshPhongMaterial({
            fog: false,
            bumpScale: bumpScale,
            color: 0x555555,
            //metalness: metalness,
            //fog: false,
            //roughness: roughness,
            shininess:50,
            shading: THREE.FlatShading,
            //envMap: Assets.getCubeMap(),
            //side: THREE.DoubleSide,
            //map: new THREE.TextureLoader().load("2708diffuse.jpg"),
            //alphaMap: new THREE.TextureLoader().load("textures/op.png"),
            //transparent:true,
            //normalMap: new THREE.TextureLoader().load("2708normal.jpg"),
            //bumpMap: texture,
            //emissive: 0x111111,
            //metalnessMap:texture,
            //lightMap:texture,
            //depthWrite:false,
            //depthTest:false,
            //blendEquation:THREE.MinEquation
        })
    }

    function reload(seed) {

        number = {random: new Math.seedrandom(seed)};

        if (full) {
            VizHandler.getScene().remove(full);
            full.geometry.dispose();
            full = null;
        }

        var geo = new THREE.BoxGeometry(.1, .1, .1, 1, 1, 1)
        var group = new THREE.Object3D();

        var side = 15

        // rocks
        var center = new THREE.Vector3()

        for (var n = 0; n < 200; n++) {
            var geom = geo.clone()

            var mod = .1
            for (var i = 0; i < geom.vertices.length; i++) {
                var v = geom.vertices[i]
                v.x += (number.random() - .5) * mod
                v.y += (number.random() - .5) * mod
                v.z += (number.random() - .5) * mod
            }

            var cube = new THREE.Mesh(geom, material)
            var r = 1000
            while (cube.position.distanceTo(center) < 150 || (cube.position.z > 0 && Math.abs(cube.position.x) < 150)) {
                cube.position.set((number.random() - .5) * r, (number.random() - .5) * r / 5 + 60, (number.random() - .5) * r)
            }

            var scr0 = (0.2 + number.random()) * 200
            var scr1 = (0.2 + number.random()) * 200
            var scr2 = (0.2 + number.random()) * 200
            cube.scale.set(scr0, scr1, scr2)
            if (number.random() < .4)
                cube.scale.multiplyScalar(1 + number.random() * 2)
            group.add(cube)
            cube.castShadow = true;
            cube.receiveShadow = true;

        }


        /*// tiny
         
         for (var _x = -side; _x < side; _x++) {
         for (var _z = -side; _z < side; _z++) {
         var r = 20
         var tpos = new THREE.Vector3()
         tpos.set((_x) * r * 2, 0 * r * 2, (_z) * r * 2)
         //var r = Math.PI * 3 * 2 * noise.simplex3((mesh.position.x + screenID * screenDistanceInSquares) / scale, mesh.position.y / scale, noiseTimeProgress);
         var n = noise.simplex3(_x, _z, 0)
         if (n == 0) {
         for (var j = 0; j < 5; j++) {
         var geom = geo.clone()
         
         var mod = .1
         for (var i = 0; i < geom.vertices.length; i++) {
         var v = geom.vertices[i]
         v.x += (number.random() - .5) * mod
         v.y += (number.random() - .5) * mod
         v.z += (number.random() - .5) * mod
         }
         
         var cube = new THREE.Mesh(geom, material)
         var r = 20 + 40 * number.random()
         cube.position.set((number.random() - .5) * r, Math.abs((number.random() - .5) * r), (number.random() - .5) * r)
         cube.position.add(tpos)
         var scr0 = (.2 + number.random()) * 20
         var scr1 = (.2 + number.random()) * 20
         var scr2 = (.2 + number.random()) * 20
         cube.scale.set(scr0, scr1, scr2)
         group.add(cube)
         cube.castShadow = true;
         cube.receiveShadow = true;
         }
         }
         }
         }*/

        // laarge

        for (var j = 0; j < 30; j++) {
            var r = 2000
            var tpos = new THREE.Vector3()
            while (tpos.distanceTo(group.position) < 650) {
                tpos.set((number.random() - .5) * r, 0, (number.random() - .5) * r)
            }
            tpos.y = (number.random()) * r / 10
            for (var i = 0; i < 1; i++) {
                var geom = geo.clone()

                var mod = .05
                for (var i = 0; i < geom.vertices.length; i++) {
                    var v = geom.vertices[i]
                    v.x += (number.random() - .5) * mod
                    v.y += (number.random() - .5) * mod
                    v.z += (number.random() - .5) * mod
                }

                var cube = new THREE.Mesh(geom, material)
                cube.position.copy(tpos)

                var scr0 = (.5 + number.random()) * 2000
                var scr1 = (.5 + number.random()) * 2000
                var scr2 = (.5 + number.random()) * 2000
                cube.scale.set(scr0, scr1, scr2)
                cube.scale.multiplyScalar(1 + number.random())
                group.add(cube)
                cube.castShadow = true;
                cube.receiveShadow = true;
            }
        }


        var geom = new THREE.Geometry()
        for (var i = 0; i < group.children.length; i++) {
            group.children[i].updateMatrix();
            geom.merge(group.children[i].geometry, group.children[i].matrix);
        }

        geom.computeFaceNormals();
        geom.computeVertexNormals();

        full = new THREE.Mesh(geom, material)
        full.castShadow = true;
        full.receiveShadow = true;
        VizHandler.getScene().add(full)

        VizHandler.getRenderer().shadowMap.needsUpdate = true;
    }

    function update() {
    }

    function onBeat() {
    }

    function generate() {
    }

    return {
        init: init,
        update: update,
        onBeat: onBeat,
        generate: generate,
        reload: reload,
    }

}
();