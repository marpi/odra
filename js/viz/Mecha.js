var Mecha = function () {
    var scene;

    var targetPosition = new THREE.Vector3()
    var finalTargetPosition = new THREE.Vector3()
    var mouseControl = false, finalControl = false;
    var meshes = []

    var numCreaturesSqrt = 1;
    var numCreatures = numCreaturesSqrt * numCreaturesSqrt;
    var creatures = [];

    var material, material2;

    var cursors = {};
    var max = 20, maxGems = 20;
    var times = [];
    var mods = []
    var cylGeo = new THREE.CylinderGeometry(10, 5, .5, 32)

    var smokeMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc, shading: THREE.FlatShading})
    var smokePiece = new THREE.OctahedronBufferGeometry(5, 1)
    var crackMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc, shading: THREE.FlatShading})
    var crackPiece = new THREE.TetrahedronBufferGeometry(5, 0)
    var gemMaterial = new THREE.MeshPhongMaterial({color: 0xcccccc, shading: THREE.FlatShading})
    var gemPiece = new THREE.TetrahedronBufferGeometry(5, 0)
    var rayMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, shading: THREE.FlatShading})
    var rayPiece = new THREE.BoxBufferGeometry(2, 20, 2)

    var mouseMoved = false;
    var mouseEvent = {}
    var preMouse = new THREE.Vector2();

    var foodGems = []

    function init() {

        if (isMobile.any) {
            max = 3, maxGems = 5
        }

        //init event listeners
        events.on("update", update);
        scene = VizHandler.getScene()

        initBones();

        plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshPhongMaterial({
            shading: THREE.FlatShading,
            //color: 0x333333,
            //shininess:30,
            //emissive: 0x333333,
            //specular: 0x333333
        }));
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true;
        scene.add(plane);

        document.addEventListener("mousemove", onDocumentMouseMove, false);
        document.addEventListener("touchmove", onDocumentTouchMove, false);
        document.addEventListener("mousedown", onDocumentMouseDown, false);
        document.addEventListener("touchstart", onDocumentTouchStart, false);
    }

    function onDocumentTouchMove() {
        if (!mouseEvent.mouse)
            return;
        //console.log(preMouse.distanceTo(mouseEvent.mouse))
        if (preMouse.distanceTo(mouseEvent.mouse) > 0.03) {
            mouseMoved = true
        }
    }

    function onDocumentMouseMove() {
        if (!mouseEvent.mouse)
            return;
        //console.log(preMouse.distanceTo(mouseEvent.mouse))
        if (preMouse.distanceTo(mouseEvent.mouse) > 0.03) {
            mouseMoved = true
        }
    }

    function onDocumentTouchStart() {
        if (!mouseEvent.mouse)
            return;
        preMouse.copy(mouseEvent.mouse)
        mouseMoved = false
    }
    function onDocumentMouseDown() {
        if (!mouseEvent.mouse)
            return;
        preMouse.copy(mouseEvent.mouse)
        mouseMoved = false
    }

    function lookAround() {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseEvent.mouse, VizHandler.getCamera());
        var intersects = raycaster.intersectObject(plane, true);
        if (intersects[ 0 ]) {
            var p = intersects[ 0 ].point
            targetPosition = p;
            mouseControl = true
            TweenLite.killDelayedCallsTo(regainControl)
            TweenLite.delayedCall(1, regainControl)
        }
    }

    function onRelease() {
        //console.log(mouseMoved)
        if (mouseMoved || !mouseEvent.mouse)
            return;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseEvent.mouse, VizHandler.getCamera());
        var intersects = raycaster.intersectObject(plane, true);
        if (intersects[ 0 ]) {

            //if (mouseEvent.click) {
            //var id = Math.floor(Math.random() * 10000);
            //spawn(p.x, p.y, p.z, id);
            //sendClick(p.x, p.y, p.z, id);

            var p = intersects[ 0 ].point
            addGem(p)
            //}
        }
    }

    function addGem(p) {
        var minDist = 10000
        for (var g = 0; g < foodGems.length; g++) {
            var dist = p.distanceTo(foodGems[g].position)
            if (dist < minDist) {
                minDist = dist
            }
        }
        if (minDist < 16) {
            return;
        }
        var gem = new THREE.Mesh(gemPiece, gemMaterial)
        gem.position.x = p.x
        gem.position.y = -5
        gem.position.z = p.z
        TweenLite.to(gem.position, 1, {y: 15, ease: Back.easeOut});
        TweenLite.from(gem.rotation, .6, {x: Math.random() * 6 - 3, y: Math.random() * 6 - 3, z: Math.random() * 6 - 3});
        gem.castShadow = true;
        gem.receiveShadow = true;

        scene.add(gem)
        foodGems.push(gem)

        if (foodGems.length > maxGems) {
            var last = foodGems[0];
            removeGem(last)
        }
    }

    function removeGem(last) {
        foodGems = foodGems.filter(function (item) {
            return item !== last
        })
        TweenLite.to(last.scale, .5, {x: 0, y: 0, z: 0, onComplete: removeFromStage, onCompleteParams: [last]});
    }

    function findFromRay(mouse, click) {
        mouseEvent.mouse = mouse
        mouseEvent.click = click

        if (!click)
            lookAround()
    }

    function regainControl() {
        mouseControl = false;
    }

    function getCursor(name) {
        //console.log(name)
        if (cursors[name]) {
            cursors[name].time = 0;
            return cursors[name]
        }

        console.log('make new cursor', name)

        var cursor;
        cursor = new THREE.Mesh(cylGeo, new THREE.MeshPhongMaterial({
            specular: 0,
            shading: THREE.FlatShading,
            color: 0xFFFFFF,
            transparent: false,
            opacity: .8,
            emissive: 0
        }));
        cursor.scale.y = .3 + 3 * Math.random()
        TweenLite.from(cursor.scale, 1, {x: 0.001, z: 0.001})
        cursor.time = 0;
        cursor.position.y = -2
        cursor.receiveShadow = true;
        scene.add(cursor);

        cursors[name] = cursor;
        return cursors[name]
    }

    function removeCursor(cursor, c) {
        //console.log('trying', cursors)

        var cursor = cursors[c]
        if (cursor) {
            delete cursors[c];
            TweenLite.to(cursor.scale, 1, {x: 0.001, z: 0.001, onComplete: removeFromStage, onCompleteParams: [cursor]})
        }
        //console.log('removed', cursors)
    }
    function removeFromStage(cursor) {
        scene.remove(cursor)
    }

    function receiveClick(x, y, z, id, name, color) {
        if (!scene)
            return;

        var cursor = getCursor(name);

        if (id != -1) {
            spawn(cursor.position.x, 0, cursor.position.z, id, name);
        } else {
            cursor.material.color.setHex(color);
            TweenLite.to(cursor.position, .3, {x: -x, y: -y * 0, z: -z});
            /*targetPosition = new THREE.Vector3(x, y, z)
             TweenMax.killDelayedCallsTo(regainControl)
             TweenMax.delayedCall(meshes[0][0].movement.center.distanceTo(targetPosition) * .15, regainControl)*/
        }
    }

    function setColor(name, c) {
        if (!scene)
            return;

        var cursor = getCursor(name);
        if (cursor) {
            /*lights[0].color.setHex(c)
             lights[1].color.setHex(c)
             lights[2].color.setHex(c)*/
            cursor.material.color.setHex(c);
        }
    }

    function initBones() {
        Generator.init();
        clearSpace()
    }

    function clearSpace() {
        for (var i = 0; i < meshes.length; i++) {
            scene.remove(meshes[i])
        }

        creatures = []
        meshes = []

        numCreatures = creatures.length;
        numCreaturesSqrt = Math.sqrt(numCreatures)

    }

    function spawn(x, y, z, id, creatorsName) {
        if (!scene)
            return;
        var meshesAddition = []

        // CONFIG

        var creature = Generator.create(id, new THREE.Vector3(x, y, z))
        //explode(creature.movement.position)
        creature.creatorsName = creatorsName;

        for (var j = 0; j < creature.meshes.length; j++) {
            scene.add(creature.meshes[j]);

            /*skeletonHelper = new THREE.SkeletonHelper(creature.meshes[j]);
             skeletonHelper.material.linewidth = 2;
             scene.add(skeletonHelper);*/

            meshesAddition.push(creature.meshes[j])
        }

        var mod = new THREE.Vector3(0, -30, 0)
        TweenLite.to(mod, 1, {y: 0})

        creatures.push(creature)
        meshes.push(meshesAddition)
        mods.push(mod)
        times.push(0)

        if (creatures.length > max) {
            var creature = creatures[0]

            for (var j = 0; j < creature.meshes.length; j++) {
                scene.remove(creature.meshes[j]);
            }

            //explode(creature.movement.position)

            creatures.shift();
            meshes.shift();
            mods.shift();
            times.shift();
        }


        numCreatures = creatures.length;
        numCreaturesSqrt = Math.sqrt(numCreatures)

        update()
    }

    function update() {
        //if(Math.random()<.995)return
        //skeletonHelper.update()

        for (var c in cursors) {
            var cursor = cursors[c]
            cursor.time += .01
            //console.log(cursor.time)
            if (cursor.time > 1)
                removeCursor(cursor, c)
        }

        for (var i = 0; i < foodGems.length; i++) {
            foodGems[i].rotation.x += .03
            foodGems[i].rotation.y += .03
        }

        var creature;
        for (var i = 0; i < numCreatures; i++) {
            times[i] += .0007;

            creature = creatures[i];
            /*mouseControl = false;
             if (cursors[creature.creatorsName]) {
             mouseControl = true
             targetPosition.copy(cursors[creature.creatorsName].position)
             targetPosition.x += Math.sin(i) * 50;
             targetPosition.z += Math.sin(10 * i) * 50;
             } else {
             for (var c in cursors) {
             var cursor = cursors[c]
             if (cursor) {
             if (creature.movement.position.distanceTo(cursor.position) < 60) {
             //console.log(c)
             targetPosition.copy(creature.movement.position)
             targetPosition.sub(cursor.position)
             targetPosition.multiplyScalar(2)
             targetPosition.add(creature.movement.position)
             mouseControl = true
             }
             //console.log(cursor.time)
             }
             }
             }*/

            finalTargetPosition.copy(targetPosition)
            finalTargetPosition.x += Math.sin(i) * 50 * i / numCreatures
            finalTargetPosition.z += Math.cos(i) * 50 * i / numCreatures
            finalControl = mouseControl
            if (foodGems.length > 0) {
                var minDist = 10000
                var bestChoice
                for (var g = 0; g < foodGems.length; g++) {
                    var dist = creature.movement.position.distanceTo(foodGems[g].position)
                    if (dist < minDist) {
                        minDist = dist
                        bestChoice = foodGems[g];
                    }
                }
                if (minDist < 100) {
                    finalTargetPosition.copy(bestChoice.position)
                    finalControl = true;
                }
                if (minDist < 5) {
                    ray(bestChoice.position);
                    removeGem(bestChoice)
                    AudioHandler.playGem()
                }
            }

            var time = times[i];
            var des = new THREE.Vector3(
                    Math.sin(1.1 * creature.random * 6 + 1 * time + i) * 300,
                    -0 * 15 + 7.5 + mods[i].y,
                    Math.sin(1.9 * creature.random * 6 + 1 * time) * 300 + 150
                    )
            //var mod = new THREE.Vector3(40 * (.5 - numCreaturesSqrt / 2 + i % numCreaturesSqrt), 0, 40 * (.5 - numCreaturesSqrt / 2 + Math.floor(i / numCreaturesSqrt)));
            var mod = new THREE.Vector3();
            //des.y += mod.y;

            Generator.updateCreature(creature, des, mod, finalControl, meshes[i], finalTargetPosition)
        }
    }

    function hit(position) {
        var creature;
        for (var i = numCreatures - 1; i >= 0; i--) {
            creature = creatures[i];
            if (creature.movement.position.distanceTo(position) < 40) {
                explode(creature.movement.position)

                for (var j = 0; j < creature.meshes.length; j++) {
                    scene.remove(creature.meshes[j]);
                }

                creatures.splice(i, 1);
                meshes.splice(i, 1);
                mods.splice(i, 1);
                times.splice(i, 1);
                numCreatures--

                var roz = 300
                var id = Math.random()
                Mecha.spawn((Math.random() - .5) * roz, 0, (Math.random() - .5) * roz, id)
            }
        }
    }

    function animate(array, col, noteScales) {
        for (var i = 0; i < mods.length; i++) {
            var n = mods.length % i
            if (array[n] == -1 && col % noteScales[n] == 0) {
                TweenLite.to(mods[i], .05, {y: -7});
            } else {
                TweenLite.to(mods[i], 1, {y: 0});
            }
        }
    }

    function explode(position, scale) {
        if (!scale)
            scale = 1
        for (var k = 0; k < 5; k++) {
            var c = new THREE.Mesh(smokePiece, smokeMaterial)
            c.castShadow = true;
            c.receiveShadow = true;
            c.position.copy(position)
            c.position.x += (Math.random() * 10 - 5) * scale
            c.position.y += (Math.random() * 5) * scale
            c.position.z += (Math.random() * 10 - 5) * scale
            c.scale.set(scale, scale, scale)
            scene.add(c)
            var d = Math.random() * 20 * scale
            var a = Math.random() * Math.PI * 2
            var tpos = new THREE.Vector3(Math.sin(a) * d, 0, Math.cos(a) * d)
            tpos.add(c.position)
            var d = Math.random() * .5
            TweenLite.to(c.rotation, 1 + d, {delay: 0, x: 5 * (Math.random() - .5), y: 5 * (Math.random() - .5), z: 5 * (Math.random() - .5)})
            TweenLite.to(c.position, 1 + d, {delay: 0, x: tpos.x, z: tpos.z, onComplete: removeFromStage, onCompleteParams: [c]})
            TweenLite.to(c.position, 1 + d, {delay: 0, y: (Math.random() * 20 + 5) * scale})
            var s = (1 + Math.random()) * scale
            TweenLite.to(c.scale, .7 + d * .7, {delay: 0, x: s, y: s, z: s})
            TweenLite.to(c.scale, .3 + d * .3, {delay: 0 + .7 + d * .7, x: 0.0001, y: 0.0001, z: 0.0001})
        }
    }

    function ray(position, scale) {
        if (!scale)
            scale = 1
        for (var k = 0; k < 1; k++) {
            var c = new THREE.Mesh(rayPiece, rayMaterial)
            c.position.copy(position)
            c.scale.set(scale, scale, scale)
            scene.add(c)
            var tpos = new THREE.Vector3(0, 300, 0)
            tpos.add(c.position)
            TweenLite.to(c.position, 1, {delay: 0, x: tpos.x, y: tpos.y, z: tpos.z, onComplete: removeFromStage, onCompleteParams: [c]})
            var s = (1 + Math.random()) * scale
            TweenLite.to(c.scale, .7, {delay: 0, x: s, y: s, z: s})
            TweenLite.to(c.scale, .3, {delay: 0 + .7, x: 0.0001, y: 0.0001, z: 0.0001})
        }
    }

    function setColors(r, r2) {
        crackMaterial.color = new THREE.Color().setHSL(r, .7, .5);
        smokeMaterial.color = new THREE.Color().setHSL(r2, 0, .7);
        gemMaterial.color = new THREE.Color().setHSL(r, .7, .5);
    }

    function crack(position, scale) {
        if (isMobile.any)
            return;
        if (!scale)
            scale = 1
        var c
        for (var k = 0; k < 5; k++) {
            if (Math.random() < .5) {
                c = new THREE.Mesh(crackPiece, crackMaterial)
            } else {
                c = new THREE.Mesh(crackPiece, smokeMaterial)
            }
            c.castShadow = true;
            c.receiveShadow = true;
            c.userData.ySpeed = 1 + Math.random() * 1.5;
            c.position.copy(position)
            c.position.x += (Math.random() * 10 - 5) * scale
            c.position.y += (Math.random() * 5) * scale
            c.position.z += (Math.random() * 10 - 5) * scale
            c.scale.set(scale * (.5 + Math.random()), scale * (.5 + Math.random()), scale * (.5 + Math.random()))
            scene.add(c)
            var d = Math.random() * 60 * scale
            var a = Math.random() * Math.PI * 2
            var tpos = new THREE.Vector3(Math.sin(a) * d, 0, Math.cos(a) * d)
            tpos.add(c.position)
            var d = Math.random() * .5
            TweenLite.to(c.rotation, 1 + d, {delay: 0, x: 15 * (Math.random() - .5), y: 15 * (Math.random() - .5), z: 15 * (Math.random() - .5)})
            TweenLite.to(c.position, 1 + d, {delay: 0, x: tpos.x, z: tpos.z, onUpdate: bounce, onUpdateParams: [c], onComplete: removeFromStage, onCompleteParams: [c]})
            var s = (1 + Math.random()) * scale
            TweenLite.to(c.scale, .7 + d * .7, {delay: 0, x: s, y: s, z: s})
            TweenLite.to(c.scale, .3 + d * .3, {delay: 0 + .7 + d * .7, x: 0.0001, y: 0.0001, z: 0.0001})
        }
    }
    function bounce(c) {
        c.position.y += c.userData.ySpeed
        if (c.userData.ySpeed < 0 && c.position.y < 1 * c.scale.y)
            c.userData.ySpeed = -c.userData.ySpeed * .5
        c.userData.ySpeed -= .1
    }

    return {
        init: init,
        update: update,
        receiveClick: receiveClick,
        setColor: setColor,
        setColors: setColors,
        hit: hit,
        spawn: spawn,
        explode: explode,
        crack: crack,
        animate: animate,
        max: max,
        cursors: function () {
            return cursors;
        },
        cursorPosition: function () {
            return targetPosition;
        },
        getCreatures: function () {
            return creatures
        },
        findFromRay: findFromRay,
        onRelease: onRelease,
    }

}
();