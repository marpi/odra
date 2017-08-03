var Sequencer = function () {

    var number;
    var sequencer = [];
    var noteScales = [];
    var soundLengths = [16, 8, 4, 2, 1]

    var steps = 16;
    var channels = 5;

    var n, n2, r;
    var currentID;

    var auto = true;

    function initSequencer(id) {
        currentID = id;
        number = {random: new Math.seedrandom(id)};

        noteScales = [1, 2, 4, 2, 1]
        for (var i = 0; i < noteScales.length; i++) {
            noteScales[i] = Sequencer.randomFromArray(soundLengths)
        }

        n = 0, n2 = 0, r = number.random() * .3 + .1//.1;//.1 + number.random() * .1;
        sequencer = [];
        for (var _x = 0; _x < steps; _x++) {
            sequencer[_x] = [];
            for (var _y = 0; _y < channels; _y++) {
                sequencer[_x][_y] = -1
            }
        }

        for (var _x = 0; _x < steps; _x++) {
            for (var _y = 0; _y < channels; _y++) {
                randomize(_x, _y)
            }
        }

        if (!auto)
            Sequencer.toggleAuto()
        //console.log(sequencer)
    }

    function sequence(col) {
        if (col == 0 && auto) {
            n++
            n2++

            if (n == 2) {
                n = 0;
                r += .1
                if (r >= .5)
                    r = .5
                var _y = Math.floor(number.random() * channels)
                for (var _x = 0; _x < steps; _x++) {
                    randomize(_x, _y);
                }
                toggleSoundLength(Math.floor(number.random() * channels))

            }

            if (n2 == 4) {

                for (var i = 0; i < noteScales.length; i++) {
                    if (noteScales[i] == 16) {
                        toggleSoundLength(i)
                    }
                }

                n2 = 0;
            }
        }

        return sequencer;
    }

    function randomize(_x, _y) {
        sequencer[_x][_y] = -1

        if (number.random() < r) {
            sequencer[_x][_y] = number.random();

            /*for (var l = 0; l < noteScales[_y]; l++) {
             console.log(_x, l, _y)
             sequencer[_x + l][_y] = sequencer[_x][_y]
             }*/
        }
    }

    function toggle(_x, _y) {
        if (sequencer[_x][_y] == -1 && !AudioHandler.isFadingOff()) {
            sequencer[_x][_y] = Math.random();
            /*for (var l = 0; l < noteScales[_y]; l++) {
             sequencer[_x + l][_y] = sequencer[_x][_y]
             }*/
        } else {
            sequencer[_x][_y] = -1;
        }
    }

    function toggleSoundLength(n) {

        for (var i = 0; i < soundLengths.length; i++) {

            if (noteScales[n] == soundLengths[i]) {
                var nextI = i + 1
                if (nextI >= soundLengths.length)
                    nextI = 0
                noteScales[n] = soundLengths[nextI]

                break;
            }
        }
        SequencerVisual.rebuild(n)
    }

    function fadeOff(time) {
        for (var _x = 0; _x < steps; _x++) {
            for (var _y = 0; _y < channels; _y++) {
                if (sequencer[_x][_y] != -1)
                    TweenLite.delayedCall(Math.random() * time, toggle, [_x, _y])
            }
        }
    }

    function range(from, to) {
        return from + (to - from) * number.random();
    }
    function roundRange(from, to) {
        return Math.floor(from + ((to + 1) - from) * number.random());
    }
    function randomFromArray(array) {
        return array[Math.floor(number.random() * array.length)];
    }
    function randomNote() {
        var array = ["A1", "A2", "A4", "C2"]
        return array[Math.floor(number.random() * array.length)];
    }
    function randomInterval() {
        var array = [1, 2, 4, 8]
        return array[Math.floor(number.random() * array.length)];
    }

    return {
        steps: steps,
        channels: channels,
        range: range,
        roundRange: roundRange,
        randomFromArray: randomFromArray,
        randomNote: randomNote,
        initSequencer: initSequencer,
        sequence: sequence,
        toggle: toggle,
        toggleSoundLength: toggleSoundLength,
        fadeOff: fadeOff,
        steps:steps,
                channels:channels,
                array: function () {
                    return sequencer
                },
        noteScales: function () {
            return noteScales
        },
        soundLengths:soundLengths,
        toggleAuto: function () {
            auto = !auto;
            SequencerVisual.toggleAuto(auto)
        },
        getAuto:function () {
            return auto;
        }
    };

}();