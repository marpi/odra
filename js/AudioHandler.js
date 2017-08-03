// krih // pink and fast and dreamy, cool
// ciup // orange and boring
// aela // orange, slow but with buildup, cool
// fraja // fast and crazy
// xessou // red, a bit crazy, buildup, cool
// oghogai // blue and bassy
// aidack // yellow, buildup, interesting rhytm


var AudioHandler = function () {

    var number;

    var loop;
    var baseVolume = -30.0
    var guiID = 0, gui;
    var majorOrder, minorOrder1, minorOrder2, minorOrder3, minorOrder4, minorOrder5
    var allIntruments = []
    var dist, convolver, feedbackDelay, reverb, pingPong;

    var debug = false;
    var happy = false;

    var fadingOff = false;
    var currentTrack;

    var looping = {}
    var playing = false;
    var firstTime = true;

    function init() {
        playlist()

        window.onpopstate = function (event) {
            var str = document.location.toString()
            var n = str.lastIndexOf('/');
            var result = str.substring(n + 1);
            switchTo(result)
        }
    }

    function playlist() {
        if (debug) {
            if (gui)
                gui.destroy()
            gui = new dat.GUI({
                autoPlace: true,
                width: 400,
            });
            gui.close();
        }

        var name = deeplinkName;
        if (!name)
            name = RandomName(3, 5, Math).toLowerCase()

        play(name)
    }

    function playNext(outTime) {
        var titles = UI.getTitles()
        var i = titles.indexOf(currentTrack)
        if (i < titles.length - 1 && i >= 0) {
            switchTo(titles[i + 1], outTime)
        } else {
            switchTo(null, outTime)
        }
    }

    function switchTo(id, outTime) {
        if (!id)
            id = RandomName(3, 5, Math).toLowerCase()
        if (!outTime)
            outTime = 2.5
        if (fadingOff)
            return;
        fadingOff = true;
        Sequencer.fadeOff(outTime - 2)

        TweenLite.killDelayedCallsTo(play)
        TweenLite.killDelayedCallsTo(playlist)
        TweenLite.killDelayedCallsTo(VizHandler.animateCamera)
        TweenLite.delayedCall(outTime - 1, VizHandler.animateCamera, [true])
        TweenLite.delayedCall(outTime - 2, UI.fade, [true])
        TweenLite.delayedCall(outTime - 1, tweenVolume, [-60, 1])
        TweenLite.delayedCall(outTime, VizHandler.animateCamera, [false])
        TweenLite.delayedCall(outTime + 1, UI.fade, [false])
        TweenLite.delayedCall(outTime, play, [id])
        
        closefunction();
        ga('send', 'pageview', id);
    }

    function tweenVolume(target, time) {
        Tone.Master.volume.rampTo(target, time)
    }

    function play(track) {
        currentTrack = track;
        //console.log("track:", track)

        //history.pushState({urlPath: '/' + track}, "", '/' + track)
        document.title = "Odra: " + track.charAt(0).toUpperCase() + track.slice(1)

        number = {random: new Math.seedrandom(track)};

        Mecha.setColors(number.random(), number.random())

        for (var i = 0; i < 15; i++) {
            var roz = 300
            var id = number.random()
            Mecha.spawn((number.random() - .5) * roz, 0, (number.random() - .5) * roz + 200, id)
        }

        VizHandler.setLightColors(number.random())
        Forest.rebuild(track)
        Monster.rebuild(track)
        Shards.reload(track)

        VizHandler.show(track)
        UI.show(track)

        Sequencer.initSequencer(track)
        SequencerVisual.build(track)

        playing = false;
        fadingOff = false;

        if (isMobile.any) {
            Tone.context.latencyHint = 5;
        } else {
            Tone.context.latencyHint = 'playback';
        }

        if (firstTime) {
            var e = document.getElementsByTagName("canvas")[0]
            StartAudioContext(Tone.context, e)
            SequencerVisual.toggleAuto(false, true)
            e.addEventListener('click', function () {
                if (!firstTime)
                    return;
                SequencerVisual.toggleAuto(true)
                TweenLite.delayedCall(1, nextStep)
                VizHandler.zoomOut()
                TweenLite.delayedCall(3, UI.fade, [false])
                firstTime = false

            });
        } else {
            nextStep()
        }

    }

    function nextStep() {

        music()


    }

    function music() {
        number.random()
        number.random()

        Tone.Transport.stop();
        if (loop)
            loop.stop()
        for (var i = 0; i < allIntruments.length; i++) {
            allIntruments[i].dispose()
        }
        allIntruments = []

        //var spaceWave = "impulse-responses/binaural/s1_r1_b.wav" // nice, all combinations
        //var spaceWave = "impulse-responses/bin_dfeq/s2_r3_bd.wav" // nice, all combinations
        //var spaceWave = "impulse-responses/bright-hall.wav" // hmm
        //var spaceWave = "impulse-responses/crackle.wav" // space explosions, awesome with distortions
        var spaceWave = "impulse-responses/diffusor2.wav" // melodic, run at 30%
        //var spaceWave = "impulse-responses/diffusor4.wav" // cool, run at 30%
        //var spaceWave = "impulse-responses/matrix-reverb1.wav" // cool
        //var spaceWave = "impulse-responses/filter-rhythm3.wav" // woah bass
        //var spaceWave = "impulse-responses/filter-rhythm2.wav" // space 
        //var spaceWave = "impulse-responses/filter-rhythm4.wav" // super thick

        convolver = new Tone.Convolver(spaceWave)
        convolver.wet.value = .3;

        //var convolverKick = new Tone.Convolver("impulse-responses/filter-rhythm4.wav")
        //convolverKick.wet.value = .1;

        //var convolverHat = new Tone.Convolver("impulse-responses/house-impulses/living-magnetic.wav")
        //convolverHat.wet.value = .7;

        //var convolverTest = new Tone.Convolver("impulse-responses/diffusor3.wav")
        //convolverTest.wet.value = .5;

        reverb = new Tone.JCReverb(.3)
        reverb.roomSize.value = .3
        reverb.wet.value = 1

        feedbackDelay = new Tone.FeedbackDelay("12n", 0.5)
        feedbackDelay.wet.value = 0;

        dist = new Tone.Distortion(20)
        dist.wet.value = 0//1;


        // KICK

        /*var kickEnvelope = new Tone.AmplitudeEnvelope({
         "attack": 0.01,
         "decay": 0.2,
         "sustain": 0,
         "release": 1
         })
         
         var lowPass = new Tone.Filter({
         "frequency": 10000,
         })
         
         var kick = new Tone.Oscillator("D2").start();//C2,D2,E2
         connectEffectsChain("kick", [kick, kickEnvelope, lowPass, reverb, convolverKick]);
         
         // HATS
         
         var lowPass = new Tone.Filter({
         "frequency": 14000,
         })
         
         var openHiHat = new Tone.NoiseSynth({
         "volume": -35,
         "filter": {
         "Q": 1
         },
         "envelope": {
         "attack": 0.01,
         "decay": 0.1
         },
         "filterEnvelope": {
         "attack": 0.01,
         "decay": 0.03,
         "baseFrequency": 100,
         "octaves": -5.5,
         "exponent": 5,
         }
         })
         
         connectEffectsChain("openHiHat", [openHiHat, lowPass, reverb, convolverHat]);
         
         var closedHiHat = new Tone.NoiseSynth({
         "volume": -45,
         "filter": {
         "Q": 1
         },
         "envelope": {
         "attack": 0.1,
         "decay": 0.3
         },
         "filterEnvelope": {
         "attack": 0.01,
         "decay": 0.03,
         "baseFrequency": 4000,
         "octaves": -5.5,
         "exponent": 1,
         }
         })
         
         connectEffectsChain("closedHiHat", [closedHiHat, lowPass, reverb, convolverHat]);*/

        //
        var osc = "triangle"//Sequencer.randomFromArray(["square", "sawtooth"]);
        var synthTest = new Tone.Synth();
        synthTest.set({
            "volume": baseVolume + 13.0,
            //"portamento": 0.02,
            "frequency": 165,
            "harmonicity": 2.5,
            "vibratoAmount": 0.2,
            "vibratoRate": "4n",
            "detune": 700,
            "oscillator": {
                "type": osc
            },
            "envelope": {
                "attack": .01,
                "decay": .1,
                "sustain": 0.1,
                "release": 0.01
            },
        });

        connectEffectsChain("synthTest", [synthTest, reverb, /*feedbackDelay, */convolver]);

        // SYNTHS

        ordersMajor = [
            ["C3", "E3", "G3", "C4", "E4", "G4", "C5", "E5", "G5"],
            ["G3", "B3", "D4", "G4", "B4", "D5", "G5", "B5", "D6"],
            ["D3", "F#3", "A3", "D4", "F#4", "A4", "D5", "F#5", "A5"],
            ["A3", "C#4", "E4", "A4", "C#5", "E5", "A5", "C#6", "E6"],
            ["E3", "G#3", "B3", "E4", "G#4", "B4", "E5", "G#5", "B5"],
            ["B3", "D#4", "F#4", "B4", "D#5", "F#5", "B5", "D#6", "F#6"],
            ["F#3", "A#3", "C#4", "F#4", "A#4", "C#5", "F#5", "A#5", "C#6"],
            ["C#3", "F3", "G#3", "C#4", "F4", "G#4", "C#5", "F5", "G#5"],
            ["G#3", "C4", "D#4", "G#4", "C5", "D#5", "G#5", "C6", "D#6"],
            ["D#3", "G3", "A#3", "D#4", "G4", "A#4", "D#5", "G5", "A#5"],
            ["A#3", "D4", "F4", "A#4", "D5", "F5", "A#5", "D6", "F6"],
            ["F3", "A3", "C4", "F4", "A4", "C5", "F5", "A5", "C6"]]

        ordersMinor = [["A3", "C4", "E4", "A4", "C5", "E5", "A5", "C6", "E6"],
            ["E3", "G3", "B3", "E4", "G4", "B4", "E5", "G5", "B5"],
            ["B3", "D4", "F#4", "B4", "D5", "F#5", "B5", "D6", "F#6"],
            ["F#3", "A3", "C#4", "F#4", "A4", "C#5", "F#5", "A5", "C#6"],
            ["C#3", "E3", "G#3", "C#4", "E4", "G#4", "C#5", "E5", "G#5"],
            ["G#3", "B3", "D#4", "G#4", "B4", "D#5", "G#5", "B5", "D#6"],
            ["D#3", "F#3", "A#3", "D#4", "F#4", "A#4", "D#5", "F#5", "A#5"],
            ["A#3", "C#4", "F4", "A#4", "C#5", "F5", "A#5", "C#6", "F6"],
            ["F3", "G#3", "C4", "F4", "G#4", "C5", "F5", "G#5", "C6"],
            ["C3", "D#3", "G3", "C4", "D#4", "G4", "C5", "D#5", "G5"],
            ["G3", "A#3", "D4", "G4", "A#4", "D5", "G5", "A#5", "D6"],
            ["D3", "F3", "A3", "D4", "F4", "A4", "D5", "F5", "A5"]]

        if (happy)
            ordersMinor = ordersMajor

        for (var i = 0; i < ordersMinor.length; i++) {
            for (var j = 0; j < ordersMinor[i].length; j++) {
                ordersMinor[i][j] = ordersMinor[i][j].replace('3', '2')
                ordersMinor[i][j] = ordersMinor[i][j].replace('4', '3')
                ordersMinor[i][j] = ordersMinor[i][j].replace('5', '4')
                ordersMinor[i][j] = ordersMinor[i][j].replace('6', '4')
            }
        }

        majorOrder = Sequencer.randomFromArray(ordersMajor)
        minorOrder1 = Sequencer.randomFromArray(ordersMinor)
        minorOrder2 = minorOrder1.slice(0)
        minorOrder3 = minorOrder1.slice(0)
        minorOrder4 = minorOrder1.slice(0)
        minorOrder5 = minorOrder1.slice(0)

        shuffle(majorOrder);
        shuffle(minorOrder1);
        shuffle(minorOrder2);
        shuffle(minorOrder3);
        shuffle(minorOrder4);
        shuffle(minorOrder5);

        var osc1 = Sequencer.randomFromArray(["sine", "triangle"]);
        var osc2 = Sequencer.randomFromArray(["sine", "triangle"]);//"square", 
        //console.log(osc1, osc2)

        // SYNTH RIFF

        /*var synthRiff = new Tone.DuoSynth();
         synthRiff.set({
         "volume": baseVolume + 13.0,
         //"portamento": 0.02,
         "frequency": 165,
         "harmonicity": 1.5,
         "vibratoAmount": 0.2,
         "vibratoRate": "4n",
         "detune": 00,
         "voice0": {
         "oscillator": {
         "type": "square"
         },
         "envelope": {
         "attack": .01,
         "decay": .1,
         "sustain": 0.8,
         "release": 0.01
         },
         },
         "voice1": {
         "oscillator": {
         "type": "sawtooth"
         },
         "envelope": {
         "attack": .01,
         "decay": .1,
         "sustain": 0.8,
         "release": 0.01
         },
         }
         });
         var reverb = new Tone.JCReverb(.25)
         reverb.roomSize.value = .25
         reverb.wet.value = 1
         
         connectEffectsChain("synthRiff", [synthRiff, reverb, dist, convolver]);*/

        // SYNTH 1

        var synthFast = new Tone.DuoSynth();
        synthFast.set({
            "volume": baseVolume,
            //"portamento": 0.02,
            "frequency": 165,
            "harmonicity": 1.5,
            "vibratoAmount": 0.2,
            "vibratoRate": "4n",
            "detune": -100,
            "voice0": {
                "oscillator": {
                    "type": osc1
                },
                "envelope": {
                    "attack": .01,
                    "decay": .1,
                    "sustain": 0.8,
                    "release": 0.01
                },
            },
            "voice1": {
                "oscillator": {
                    "type": osc2
                },
                "envelope": {
                    "attack": .01,
                    "decay": .1,
                    "sustain": 0.8,
                    "release": 0.01
                },
            }
        });

        connectEffectsChain("synthFast", [synthFast, reverb, /*feedbackDelay, */dist, convolver]);

        // SYNTH 2

        var synthSlow = new Tone.DuoSynth();
        synthSlow.set({
            "volume": baseVolume,
            //"portamento": 0.02,
            "frequency": 165,
            "harmonicity": .5,
            "vibratoAmount": 0.2,
            "detune": -300,
            "vibratoRate": "4n",
            "voice0": {
                "oscillator": {
                    "type": osc1
                },
                "envelope": {
                    "attack": .01,
                    "decay": .02,
                    "sustain": 0.5,
                    "release": 0.1
                },
            },
            "voice1": {
                "oscillator": {
                    "type": osc2
                },
                "envelope": {
                    "attack": .01,
                    "decay": .02,
                    "sustain": 0.5,
                    "release": 0.1
                },
            }
        });

        connectEffectsChain("synthSlow", [synthSlow, reverb, /*feedbackDelay, */dist, convolver]);

        //

        synths = {
            fast: synthFast,
            slow: synthSlow,
            test: synthTest,
            //riff: synthRiff,
        };

        var n = new Tone.NoiseSynth({
            "volume": baseVolume + 8.0,
            noise: {
                type: "pink"
            },
            envelope: {
                attack: .005,
                decay: .01,
                sustain: 0
            }})

        connectEffectsChain("n", [n]);
        var n2 = new Tone.MembraneSynth({
            "volume": baseVolume + 58.0,
            pitchDecay: .05,
            octaves: 2,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: .01,
                decay: .99,
                sustain: .2,
                release: 2.4,
                attackCurve: "exponential"
            }
        })
        connectEffectsChain("n2", [n2]);

        var detune = number.random()
        looping = {enabled: false, wait: Sequencer.roundRange(4, 8) * 2, start: 0, end: 16}
        var sequencer = Sequencer.sequence(0), noteScales = Sequencer.noteScales()

        loop = new Tone.Sequence(function (time, col) {

            Tone.Draw.schedule(function () {

                if (!fadingOff)
                    sequencer = Sequencer.sequence(col)
                noteScales = Sequencer.noteScales()

                SequencerVisual.copy(sequencer, col);
                Forest.animate(sequencer[col], col, noteScales)
                Monster.animate(sequencer[col], col, noteScales)
                Mecha.animate(sequencer[col], col, noteScales)
            }, time);

            /*if (col == looping.end - 1) { //looping.start
             if (looping.wait == 0) {
             if (!looping.enabled) {
             looping.start = Sequencer.randomFromArray([0, 4, 8, 12])
             looping.end = 4 + looping.start
             
             loop.loopStart = looping.start + ' * 16n'
             loop.loopEnd = looping.end + ' * 16n'
             
             looping.enabled = true;
             
             looping.wait = Sequencer.roundRange(2, 4) * 2
             } else {
             looping.start = 0
             looping.end = 16
             
             loop.loopStart = looping.start + ' * 16n'
             loop.loopEnd = looping.end + ' * 16n'
             
             looping.wait = Sequencer.roundRange(4, 8) * 2
             
             looping.enabled = false;
             }
             }
             //console.log(looping.start, looping.end, looping.wait)
             looping.wait--
             
             SequencerVisual.setLooping(looping)
             }*/

            if (sequencer[col][0] != -1 && col % noteScales[0] == 0) {

                var note = minorOrder1[col % minorOrder1.length]
                if (note == "A#4")
                    note = "A#3"
                if (note == "A4")
                    note = "A3"
                if (note == "C4")
                    note = "C3"
                if (note == "D#4") {
                    note = "D#3"
                }
                if (note == "B4") {
                    note = "B3"
                }
                synths.fast.triggerAttackRelease(note, noteScales[0] + ' * 16n', time);
                //if (dist.wet.value > .9)
                //    synths.fast.frequency.value = 60
                //synths.fast.voice0.detune.value = 100
                //synths.fast.voice1.detune.value = 100
                /*TweenLite.to(synths.fast.voice0.detune, 0, {value: 100 + 400 * (detune - .5)})
                 TweenLite.to(synths.fast.voice0.detune, .3, {value: 100})
                 TweenLite.to(synths.fast.voice1.detune, 0, {value: 100 + 400 * (detune - .5)})
                 TweenLite.to(synths.fast.voice1.detune, .3, {value: 100})*/
            }
            if (sequencer[col][1] != -1 && col % noteScales[1] == 0) {
                var note = minorOrder2[col % minorOrder2.length]
                //console.log(note)
                synths.slow.triggerAttackRelease(note, noteScales[1] + ' * 16n', time);

                //if (dist.wet.value > .9)
                //    synths.slow.frequency.value = 60
                //synths.slow.voice0.detune.value = -Math.random() * 200-200
                //synths.slow.voice1.detune.value = -Math.random() * 200-200
                //n2.triggerAttack(time);
            }

            if (sequencer[col][2] != -1 && col % noteScales[2] == 0) {
                var note = minorOrder3[col % minorOrder3.length]
                synths.slow.triggerAttackRelease(note, noteScales[2] + ' * 16n', time);
                //n.triggerAttack(time);
            }

            if (sequencer[col][3] != -1 && col % noteScales[3] == 0) {
                //closedHiHat.triggerAttack(time);
                var note = minorOrder4[col % minorOrder4.length]
                synths.slow.triggerAttackRelease(note, noteScales[3] + ' * 16n', time);
                //n2.triggerAttack(time);
            }

            if (sequencer[col][4] != -1 && col % noteScales[4] == 0) {
                //openHiHat.triggerAttack(time);

                var note = minorOrder5[col % minorOrder5.length]
                synths.slow.triggerAttackRelease(note, noteScales[4] + ' * 16n', time);

                //n.triggerAttack(time);
                //kickEnvelope.triggerAttack(time);
            }
            /*if (sequencer[col][5] != -1) {
             synths.riff.triggerAttackRelease(note, '8n', time);
             synths.riff.frequency.value=60
             
             }*/

        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");

        setBPM(number.random());

        Tone.Master.volume.value = -60

        Tone.Transport.start()
        startPlayback()
    }

    function setBPM(pro) {
        Tone.Transport.bpm.value = Math.floor(60 + (136 - 60) * pro)
        SequencerVisual.setBPM(pro);
        Monster.setBPM(pro);
    }

    function playGem() {
        synths.test.triggerAttackRelease(minorOrder3[Math.floor(Math.random() * minorOrder3.length)], '8n');
    }

    function startPlayback() {
        if (playing || fadingOff)
            return;

        Tone.Master.volume.rampTo(0, 2);
        loop.start(0)
        playing = true;
        SequencerVisual.togglePlaying(true)
    }

    function stopPlayback() {
        if (!playing || fadingOff)
            return;
        loop.stop(0)
        playing = false;
        SequencerVisual.togglePlaying(false)
    }

    function connectEffectsChain(name, chain) {
        for (var i = 0; i < chain.length - 1; i += 1) {
            chain[i].connect(chain[i + 1]);
        }
        allIntruments.push(chain[0])

        chain[chain.length - 1].connect(Tone.Master);
        if (debug)
            addGui(name, chain)
    }

    function addGui(chainName, chain) {
        var types = [
            {name: "volume", min: -60, max: 0},
            {name: "frequency", min: 0, max: 14000},
            {name: "harmonicity", min: 0, max: 3},
            {name: "vibratoAmount", min: 0, max: 3},
            {name: "vibratoRate", min: 0, max: 10},
            {name: "roomSize", min: 0, max: 1},
            {name: "wet", min: 0, max: 1},
            {name: "voice0.detune", min: -1000.0, max: 1000.0},
            {name: "voice0.envelope.attack", min: 0, max: 1},
            {name: "voice0.envelope.decay", min: 0, max: 1},
            {name: "voice0.envelope.sustain", min: 0, max: 1},
            {name: "voice0.envelope.release", min: 0, max: 1},
            {name: "voice1.detune", min: -1000.0, max: 1000.0},
            {name: "voice1.envelope.attack", min: 0, max: 1},
            {name: "voice1.envelope.decay", min: 0, max: 1},
            {name: "voice1.envelope.sustain", min: 0, max: 1},
            {name: "voice1.envelope.release", min: 0, max: 1},
        ]
        var folder = gui.addFolder(chainName);
        for (var i = 0; i < chain.length; i += 1) {
            for (var j = 0; j < types.length; j += 1) {
                var type = types[j]
                var levels = (type.name.match(RegExp('\\.', 'g')) || []).length
                if (levels == 2) {
                    var split = type.name.split('.')
                    var parent = split[0]
                    var middle = split[1]
                    var name = split[2]
                    if (chain[i][parent]) {
                        folder.add(chain[i][parent][middle], name, type.min, type.max).name(chain[i].toString().substr(0, 3) + "." + name).listen();
                    }

                } else if (levels == 1) {
                    var split = type.name.split('.')
                    var parent = split[0]
                    var name = split[1]
                    if (chain[i][parent]) {
                        folder.add(chain[i][parent][name], 'value', type.min, type.max).name(chain[i].toString().substr(0, 10) + "." + type.name).listen();
                    }

                } else if (chain[i][type.name])
                    folder.add(chain[i][type.name], 'value', type.min, type.max).name(chain[i].toString().substr(0, 10) + type.name).listen();
            }

        }
        //f1.open();
        guiID++;
    }

    function shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(number.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }

    function pad(percent1, percent2, percent3, percent4) {
        //console.log(percent1, percent2, percent3, percent4)

        dist.wet.value = percent1 * percent1;
        dist.distortion = 10 * percent1 * percent1
        convolver.wet.value = (percent3 * percent3 / 2) * .7 + .3;
        reverb.roomSize.value = .3 + .5 * percent4 * percent4
        //pingPong.wet.value = percent4

        synths.fast.volume.value = baseVolume + 13 - 30 * percent1 * percent1
        synths.slow.volume.value = baseVolume + 13 - 30 * percent1 * percent1
        //synths.test.volume.value = baseVolume + 3 - 30 * percent1 * percent4

        VizHandler.setIntensity(percent1 * percent1)
        VizHandler.setColors(percent3 * percent3)

    }

    function triggerLooping(part) {
        if (!looping.enabled || looping.start != part * 4) {
            looping.enabled = true
            looping.start = part * 4
            looping.end = part * 4 + 4
            looping.wait = 100000
        } else {
            looping.enabled = false
            looping.start = 0
            looping.end = 16
            looping.wait = Sequencer.roundRange(2, 4) * 2
        }
        loop.loopEnd = looping.end + ' * 16n'
        loop.loopStart = looping.start + ' * 16n'
        SequencerVisual.setLooping(looping)
    }

    return {
        init: init,
        getChannel: function () {
            return synths
        },
        pad: pad,
        playNext: playNext,
        switchTo: switchTo,
        triggerLooping: triggerLooping,
        isFadingOff: function () {
            return fadingOff;
        },
        startPlayback: startPlayback,
        stopPlayback: stopPlayback,
        isPlaying: function () {
            return playing;
        },
        getName: function () {
            return currentTrack;
        },
        playGem: playGem,
        setBPM: setBPM,
    }
}();