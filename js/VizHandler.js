var VizHandler = function () {

    var camera, scene, renderer, controls, fullscreen = false;
    var mobile;
    var directionalLight;
    var lights = [];

    var usePointLights = false;
    var useDirectionalLights = !usePointLights;

    var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

    var postEnabled = !isMobile.any;
    var vizParams = {intensity: 0, lightHue: 0, lightMod: 0, tint: 0}
    var timeAddon = 0;

    var sunrise = {y: 1};
    var mod = 0;
    var cone;
    var number

    var target = {offset: 70, multiplier: 0}

    var baseFBO, shiftFBO, tiltShiftFBO, shiftShader, tiltShiftShader, finalShader, orthoScene, orthoCamera, orthoQuad;

    function init() {

        var id = parseInt(window.location.hash.substr(1))
        if (!id)
            id = 1

        events.on("update", update);
        // var container = document.getElementById('viz')
        //document.body.appendChild(container);

        container = document.createElement('div');
        document.body.appendChild(container);
        //RENDERER

        renderer = new THREE.WebGLRenderer({antialias: true});
        //if (isMobile.any)
        //    renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0)
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        //renderer.sortObjects = false;
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        //3D SCENE
        //camera = new THREE.PerspectiveCamera( 70, 800 / 600, 50, 30000 );
        camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.z = 140;
        camera.position.y = 105;
        //scene.add(camera);

        //controls = new THREE.TrackballControls(camera);
        controls = new THREE.OrbitControls(camera);
        controls.target.set(0, 0, 0);
        controls.update();
        controls.enabled = false;
        controls.autoRotate = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        //controls.enableRotate = false
        controls.enableDamping = true;
        controls.dampingFactor = .2;
        controls.rotateSpeed = .15;
        controls.autoRotateSpeed = .05;
        //controls.minDistance = 3;
        //controls.maxDistance = 3;
        controls.minPolarAngle = Math.PI / 2 - 1
        controls.maxPolarAngle = Math.PI;
        //controls.maxPolarAngle = Math.PI / 2 - 0.2;
        //Assets.init();
        scene.fog = new THREE.Fog(0, 000, 1500);

        var lightsNum = 2
        var lightness = .95
        if (isMobile.any) {
            lightsNum = 1
            lightness = 2
        }

        if (useDirectionalLights) {
            for (var i = 0; i < lightsNum; i++) {
                var c = new THREE.Color()
                //c.setHSL(i / 10, 1, .7)
                directionalLight = new THREE.DirectionalLight(c, lightness);
                directionalLight.position.x = .6 * (-i)
                directionalLight.position.z = .3
                directionalLight.position.y = .3

                directionalLight.castShadow = true;
                //directionalLight.shadowDarkness = .1
                var roz = 170
                if (isMobile.any)
                    roz = 100;
                directionalLight.shadow.camera.near = -roz * 2
                directionalLight.shadow.camera.far = roz * 20
                directionalLight.shadow.camera.left = -roz * 2
                directionalLight.shadow.camera.right = roz * 2
                directionalLight.shadow.camera.top = roz * 2
                directionalLight.shadow.camera.bottom = -roz * 2
                directionalLight.shadow.mapSize.width = 1024;
                directionalLight.shadow.mapSize.height = 1024;
                directionalLight.shadow.bias = -0.0002
                scene.add(directionalLight);
                lights.push(directionalLight)

                //var helper=new THREE.CameraHelper( directionalLight.shadow.camera )
                //scene.add(helper)
            }

        }
        if (usePointLights) {
            var geom = new THREE.BoxGeometry(1, 1, 1)
            for (var i = 0; i < 2; i++) {
                var c = new THREE.Color()
                var light = new THREE.PointLight(c, 1, 7000);
                light.castShadow = true;
                light.shadow.bias = 0.1;
                light.shadow.mapSize.width = 1024;
                light.shadow.mapSize.height = 1024;
                //scene.add(light);

                var sphere = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({color: c}))
                sphere.add(light)
                scene.add(sphere)

                lights.push(sphere)
            }
        }
        //scene.add(new THREE.CameraHelper(directionalLight.shadow.camera))

        //scene.add(new THREE.AmbientLight(0x333126));

        //var hemiLight = new THREE.HemisphereLight(0, 0xffffff, .3);
        //hemiLight.color.setHSL(0.6, 1, 0.6);
        //hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        //scene.add(hemiLight);

        //var helper = new THREE.CameraHelper(directionalLight.shadow.camera);
        //scene.add(helper);

        activeViz = [Shards, Mecha, SequencerVisual, Forest, Monster]//,//Shards, Titles,  Mecha, SequencerVisual, Forest

        activeVizCount = activeViz.length;
        for (var j = 0; j < activeVizCount; j++) {
            activeViz[j].init();
        }


        //window.addEventListener('deviceorientation', setOrientationControls, true);

        if (postEnabled)
            initPostprocessing()

        UI.init()

        var darkness = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({transparent: true, opacity: 1, side: THREE.DoubleSide, color: 0}))
        //darkness.rotation.x = -Math.PI / 2 - .1
        darkness.position.y = 100
        darkness.position.z = 100
        scene.add(darkness)
        TweenLite.to(darkness.material, 3, {delay: .3, opacity: 0, onComplete: function () {
                scene.remove(darkness)
            }})
        TweenLite.to(document.getElementById('intro__center'), .7, {delay: 1, css: {opacity: 1}})
        TweenLite.to(document.getElementById('intro__bottom'), .7, {delay: 1+.5, css: {opacity: 1}})

    }

    function show(name) {
        number = {random: new Math.seedrandom(name)};
        mod = number.random()

        if (cone)
            return;
        cone = new THREE.Mesh(new THREE.ConeGeometry(20, 80, 3 + Math.floor(number.random() * 5), 5, true), new THREE.MeshBasicMaterial({transparent: true, opacity: 1, side: THREE.DoubleSide, color: 0}))
        cone.rotation.x = -Math.PI / 2 - .1
        cone.position.y = 100
        cone.position.z = 80
        scene.add(cone)
    }

    function initPostprocessing() {
        /*// Setup render pass
         var renderPass = new THREE.RenderPass(scene, camera);
         effectComposer = new THREE.EffectComposer(renderer);
         
         // Setup depth pass
         depthMaterial = new THREE.MeshDepthMaterial();
         depthMaterial.depthPacking = THREE.RGBADepthPacking;
         depthMaterial.side = THREE.DoubleSide
         depthMaterial.blending = THREE.NoBlending;
         depthMaterial.skinning = true
         
         var pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false};
         depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
         
         // Setup Anti Aliasing pass
         //msaaRenderPass = new THREE.ManualMSAARenderPass(scene, camera);
         //msaaRenderPass.unbiased = false;
         //msaaRenderPass.sampleLevel = 2;
         
         // Setup Ambient Occlusion pass
         ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
         ssaoPass.renderToScreen = true;
         ssaoPass.uniforms[ 'tDepth' ].value = depthRenderTarget.texture;
         ssaoPass.uniforms[ 'size' ].value.set(window.innerWidth, window.innerHeight);
         ssaoPass.uniforms[ 'cameraNear' ].value = camera.near;
         ssaoPass.uniforms[ 'cameraFar' ].value = camera.far;
         ssaoPass.uniforms[ 'onlyAO' ].value = false;
         ssaoPass.uniforms[ 'aoClamp' ].value = 1.0;
         ssaoPass.uniforms[ 'lumInfluence' ].value = 0.7;
         
         effectComposer.addPass(renderPass);
         // effectComposer.addPass(msaaRenderPass);
         effectComposer.addPass(ssaoPass);*/

        baseFBO = createRenderTarget();
        shiftFBO = createRenderTarget();
        tiltShiftFBO = createRenderTarget();

        shiftShader = new THREE.RawShaderMaterial({
            uniforms: {
                inputTexture: {type: 't', value: baseFBO.texture},
                pixelRatio: {type: 'f', value: window.devicePixelRatio},
                resolution: {type: 'v2', value: resolution},
            },
            vertexShader: document.getElementById('ortho-vs').textContent,
            fragmentShader: document.getElementById('shift-fs').textContent,
        });

        tiltShiftShader = new THREE.RawShaderMaterial({
            uniforms: {
                inputTexture: {type: 't', value: shiftFBO.texture},
                resolution: {type: 'v2', value: new THREE.Vector2()},
                blur: {type: 'f', value: 1},
            },
            vertexShader: document.getElementById('ortho-vs').textContent,
            fragmentShader: document.getElementById('tilt-shift-fs').textContent,
        });

        finalShader = new THREE.RawShaderMaterial({
            uniforms: {
                inputTexture: {type: 't', value: tiltShiftFBO.texture},
                resolution: {type: 'v2', value: resolution},
                pixelRatio: {type: 'f', value: window.devicePixelRatio},
                boost: {type: 'f', value: 1.3},
                reduction: {type: 'f', value: .9},
                amount: {type: 'f', value: .05},
                time: {type: 'f', value: 0}
            },
            vertexShader: document.getElementById('ortho-vs').textContent,
            fragmentShader: document.getElementById('final-fs').textContent,
        });

        orthoScene = new THREE.Scene();
        orthoCamera = new THREE.OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, .00001, 1000);
        orthoQuad = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), finalShader);
        orthoScene.add(orthoQuad);
    }
    function createRenderTarget() {

        return new THREE.WebGLRenderTarget(1, 1, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            depthBuffer: true
        });

    }

    function setOrientationControls(e) {
        if (!e.alpha) {
            return;
        }

        controls.enabled = false
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();
        window.removeEventListener('deviceorientation', setOrientationControls, true);
        if (renderer.domElement) {
            renderer.domElement.addEventListener('click', function () {

                if (this.requestFullscreen) {
                    this.requestFullscreen();
                } else if (this.msRequestFullscreen) {
                    this.msRequestFullscreen();
                } else if (this.mozRequestFullScreen) {
                    this.mozRequestFullScreen();
                } else if (this.webkitRequestFullscreen) {
                    this.webkitRequestFullscreen();
                }
                fullscreen = true;
            });
            mobile = true;
        }
    }

    function animateCamera(up) {
        if (up) {
            //TweenLite.to(targetAddon, .5 * 60, {y: 600, useFrames: true})
            //TweenLite.to(camera.position, .5 * 60, {x: 0, z: 760, y: 250, useFrames: true})
            TweenLite.to(lights[0], .45, {delay: .4, intensity: 0})
            if (lights[1])
                TweenLite.to(lights[1], .45, {delay: .4, intensity: 0})
            TweenLite.to(sunrise, .9, {y: 0, intensity: 0})
        } else {
            //TweenLite.to(targetAddon, .5 * 60, {y: 0, useFrames: true})
            //TweenLite.to(camera.position, .5 * 60, {x: 0, z: 760, y: 250, useFrames: true})
            TweenLite.to(lights[0], 1 * 60, {intensity: 1, useFrames: true})
            if (lights[1])
                TweenLite.to(lights[1], 1 * 60, {intensity: 1, useFrames: true})
            TweenLite.to(sunrise, .85 * 60, {y: 1, useFrames: true})
        }
    }

    function zoomOut() {
        //console.log(camera)
        TweenLite.to(document.getElementById('intro__bottom'), .7, {delay: .5, css: {opacity: 0}, onComplete: function () {
                document.getElementById('intro').innerHTML = ""
            }})
        TweenLite.to(document.getElementById('intro__center'), .7, {delay: 0, css: {opacity: 0}})
        var time = 4
        TweenLite.to(camera.position, time, {delay: 1, z: 760, y: 250, ease: Expo.easeInOut})
        TweenLite.to(cone.material, time, {delay: 1, opacity: 0, ease: Expo.easeInOut});
        TweenLite.to(cone.scale, time, {delay: 1, x: 20, y: 20, z: 20, ease: Expo.easeInOut, onComplete: function () {
                scene.remove(cone)
                controls.enabled = true
            }})
        TweenLite.to(camera, time, {delay: 1, near: 430, ease: Expo.easeInOut, onUpdate: function () {
                camera.updateProjectionMatrix()
            }})
        TweenLite.to(target, time, {delay: 1, offset: 0, ease: Expo.easeInOut, multiplier: 1})
        TweenLite.to(controls, time, {delay: 1, maxPolarAngle: Math.PI / 2 - 0.2, ease: Expo.easeInOut})
    }

    function update() {


        //camera.position.z = 560 * (.6 + .40 * Math.sin(time * 2.7));
        //camera.position.y = 480 * (.7 + .30 * Math.sin(time * 4.5));

        //controls.target.y = -80 * (.7 + .30 * Math.sin(time * 4.5));

        var time = Date.now() * 0.0001
        controls.autoRotateSpeed = Math.sin(time) / 20 * target.multiplier;
        controls.target.set(Math.sin(time) * 10 * target.multiplier, Math.sin(time * 2.12) * 10 * target.multiplier + 20 + target.offset, Math.sin(time * 1.245 + 2) * 10 * target.multiplier)
        camera.lookAt(controls.target)
        controls.update();

        /*if (Math.random() < vizParams.intensity * .15) {
         timeAddon = Math.random()
         TweenLite.to(vizParams, 0, {lightMod: Math.random()})
         TweenLite.to(vizParams, 1, {lightMod: 0})
         }*/

        var s = .9 * (1 - vizParams.intensity) + .1 * vizParams.tint
        var l = .8 - .05 * vizParams.tint
        l *= 1 - vizParams.intensity * vizParams.lightMod;

        lights[0].color.setHSL(vizParams.lightHue, s, l)
        if (lights[1])
            lights[1].color.setHSL(vizParams.lightHue - .1, s, l)

        if (postEnabled) {
            tiltShiftShader.uniforms.blur.value = 1 + vizParams.tint;
            finalShader.uniforms.amount.value = 0.05 + vizParams.intensity * .05
            finalShader.uniforms.boost.value = 1.3 + vizParams.intensity * .6
            finalShader.uniforms.reduction.value = 1.3 + vizParams.intensity * 1
        }


        var time = Date.now() * 0.0001// + timeAddon * Math.PI * 2;
        var pos = camera.position.clone().normalize()
        pos.x = 0
        //pos.z/=2
        for (var i = 0; i < lights.length; i++) {
            var light = lights[i]
            light.position.copy(pos)
            light.position.x += -.2 + .4 * i
            light.position.y = sunrise.y * (Math.sin(mod * 10 + time + Math.PI * i / 2) * .3 + .3)
            //if(pos.z<0){
            //    light.position.y+=pos.z
            //if(light.position.y>0)light.position.y=0
            //}
            /*light.position.set(
             Math.sin(time * 10 + Math.PI * 2 * i / 3) * .3,
             sunrise.y * (Math.sin(time * 10 * 2 + Math.PI * 2 * i / 3) * .3 + .3),
             Math.cos(time * 10 + Math.PI * 2 * i / 3) * 0 + 1
             )*/
        }

        if (!postEnabled) {
            renderer.render(scene, camera);

            /*scene.overrideMaterial = depthMaterial;
             renderer.render(scene, camera, depthRenderTarget, true);
             scene.overrideMaterial = null;
             effectComposer.render();*/
        } else {
            renderer.render(scene, camera, baseFBO);
            orthoQuad.material = shiftShader;
            renderer.render(orthoScene, orthoCamera, shiftFBO);
            orthoQuad.material = tiltShiftShader;
            renderer.render(orthoScene, orthoCamera, tiltShiftFBO);
            finalShader.uniforms.time.value = 0.00001 * performance.now();
            orthoQuad.material = finalShader;
            renderer.render(orthoScene, orthoCamera);
        }
        /*if (useDirectionalLights) {
         
         var roz = camera.position.distanceTo(scene.position) * .15;
         directionalLight.shadow.camera.near = -roz * 2
         directionalLight.shadow.camera.far = roz * 2
         directionalLight.shadow.camera.left = -roz
         directionalLight.shadow.camera.right = roz
         directionalLight.shadow.camera.top = roz
         directionalLight.shadow.camera.bottom = -roz
         directionalLight.shadow.camera.updateProjectionMatrix()
         }*/

        /*var screenNum=3;
         var width=window.innerWidth
         var height=window.innerHeight
         for (var i = 0; i < screenNum; i++) {
         renderer.setViewport(i * width / screenNum, 0, width / screenNum + 1, height);
         
         //camera.position.set(cameraPosition.x + cameraDiff.x, cameraPosition.y + cameraDiff.y, cameraPosition.z + cameraDiff.z)
         
         renderer.render(scene, camera);
         
         }*/

        //renderer.render(scene, camera);
    }


    function onResize() {

        /*camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         
         renderer.setSize(window.innerWidth, window.innerHeight);*/

        var w = window.innerWidth;
        var h = window.innerHeight;

        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        if (postEnabled) {
            var dPR = window.devicePixelRatio;
            resolution.set(w * dPR, h * dPR);

            baseFBO.setSize(w * dPR, h * dPR);
            shiftFBO.setSize(w * dPR, h * dPR);
            tiltShiftFBO.setSize(w * dPR, h * dPR);

            orthoQuad.scale.set(w, h, 1);

            orthoCamera.left = -w / 2;
            orthoCamera.right = w / 2;
            orthoCamera.top = h / 2;
            orthoCamera.bottom = -h / 2;
            orthoCamera.updateProjectionMatrix();
        }
    }

    return {
        init: init,
        update: update,
        getCamera: function () {
            return camera;
        },
        getScene: function () {
            return scene;
        },
        getLight: function () {
            return directionalLight;
        },
        getRenderer: function () {
            return renderer;
        },
        getCubeCameras: function () {
            return [cubeCameraRead, cubeCameraWrite]
        },
        getControls: function () {
            return controls;
        },
        onResize: onResize,
        isFullscreen: function () {
            return fullscreen;
        },
        isMobile: function () {
            return mobile;
        },
        setLightColors: function (r) {
            TweenLite.to(vizParams, 0, {lightHue: r})
        },
        setIntensity: function (r) {
            TweenLite.to(vizParams, 0, {intensity: r})
        },
        setColors: function (r) {
            TweenLite.to(vizParams, 0, {tint: r})
        },
        animateCamera: animateCamera,
        show: show,
        zoomOut: zoomOut,
    };
}();