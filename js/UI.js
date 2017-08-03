var UI = function () {

    var votedArray = [];
    var titles = [];
    var generateRollOver = {enabled: true, value: 0};

    var generateButton
    var frame = 0

    var buttons, panel, desc;
    var tween = {opacity: 0, buttonBG: 0, listBG: .5}

    var arr = [
        '<i id="stateicon" class="fa fa-circle"></i>',
        '<i id="stateicon" class="fa fa-stop"></i>',
        '<i id="stateicon" class="fa fa-play"></i>'
    ]

    function init() {
        events.on("update", update);

        if (Cookies.get('votedArray')) {
            votedArray = JSON.parse(Cookies.get('votedArray'))
        }

        panel = document.getElementById("panel");
        if (isMobile.any) {
            document.getElementById("generate2").style.display = "none";
            document.getElementById("b1").style.display = "none";
            document.getElementById("b2").style.display = "none";
        }

        document.getElementById("generate").addEventListener("mousedown", onGenerateClick);
        document.getElementById("generate2").addEventListener("mousedown", onGenerateClick);

        $('.vote').on("click", function () {

            var name = AudioHandler.getName()
            var vote;
            //console.log(votedArray, votedArray.indexOf(name))
            if (votedArray.indexOf(name) == -1) {
                votedArray.push(name)
                vote = 1
            } else {
                votedArray = votedArray.filter(function (item) {
                    return item !== name
                })
                vote = 0;
            }
            Cookies.set('votedArray', votedArray);

            var request = new XMLHttpRequest();
            var url = "vote/";
            request.open("POST", url, true);
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    processReturnVotes(request)
                }
            }

            request.send("name=" + name + "&vote=" + vote);
            show(name, true)
        });

        /*var btn = document.createElement("a");
         btn.id = "vote"
         //btn.type = "button"
         btn.addEventListener("mousedown", onVoteClick);
         var t = document.createTextNode('');
         btn.appendChild(t);
         //desc.appendChild(btn);
         
         var div = document.createElement("div");
         div.id = "name"
         div.className = "name"
         var t = document.createTextNode('');
         div.appendChild(t);
         //desc.appendChild(div);
         
         var div = document.createElement("div");
         div.id = "votes"
         var t = document.createTextNode('');
         div.appendChild(t);
         //desc.appendChild(div);*/

        //if (!isMobile.any)
            topTracksUI();

        updateOpacity()
    }

    function onButtonsOver(e) {
        TweenLite.to(e.target, .3, {css: {backgroundColor: "rgba(0,0,0," + .5 + ")"}})
    }

    function onButtonsOut(e) {
        TweenLite.to(e.target, .3, {css: {backgroundColor: "rgba(0,0,0," + .5 + ")"}})
    }

    function onGenerateOver(e) {
        generateRollOver.enabled = true;
        TweenLite.to(generateRollOver, 0, {value: .8})
        //TweenLite.to(generateRollOver, 1.8, {value: 0})
        //generateRollOver.value = .8
        //TweenLite.to(generateButton.style,1,{backgroundColor:0x333333})
        TweenLite.to(generateButton, .1, {css: {backgroundColor: "rgba(0,0,0," + .5 + ")"}})
    }

    function onGenerateOut(e) {
        generateRollOver.enabled = false;
        TweenLite.to(generateRollOver, .3, {value: 0})
        //TweenLite.to(generateButton.style,1,{backgroundColor:"rgba(0,0,0,.1)"})
        TweenLite.to(generateButton, .5, {css: {backgroundColor: "rgba(0,0,0," + 0 + ")"}})
    }

    function generateButtonSet() {

        //var t = [arr[Math.floor(Math.random() * arr.length)], arr[Math.floor(Math.random() * arr.length)], arr[Math.floor(Math.random() * arr.length)]]
        //generateButton.innerHTML = '<i id="stateicon" class="fa fa-forward"></i>'//'Generate'//&nbsp;&nbsp;' + t.join(" ")
    }

    function shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }

    function topTracksUI() {
        var request = new XMLHttpRequest();
        request.open('GET', 'top.json', true);
        request.onreadystatechange = function (e) {
            e.preventDefault()
            if (request.readyState == 4 && request.status == 200 && request.responseText)
            {

                var json = JSON.parse(request.responseText).data
                var max = json.length

                if (max < 1)
                    return;
                var buttons = document.getElementById("buttons");
                buttons.innerHTML = '';
                //console.log(json)
                titles = []
                for (var i = 0; i < max; i++) {

                    var info = json[i]

                    var name = info.name
                    var votes = info.votes
                    titles.push(name)

                    var li = document.createElement("li");
                    li.id = name

                    var btn = document.createElement("a");
                    btn.id = name
                    btn.i = i
                    btn.className = "track"
                    btn.style.top = 20 * i + 50 + "px";
                    //btn.style.cursor="pointer";
                    btn.addEventListener("click", onButtonClick);
                    //btn.addEventListener("mouseover", onButtonOver);
                    //btn.addEventListener("mouseout", onButtonOut);
                    btn.innerHTML = name.charAt(0).toUpperCase() + name.slice(1) + " " + '<span style="opacity:.5" id="'+name+'">' + votes + '</span>'
                    li.appendChild(btn)
                    buttons.appendChild(li);

                }
            }
        }
        request.send();
    }

    function getVotes() {
        var name = AudioHandler.getName()
        var request = new XMLHttpRequest();
        var url = "vote/votes/";
        request.open("POST", url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200)
            {
                processReturnVotes(request)
            }
        }
        request.send("name=" + name);
    }

    function processReturnVotes(request) {
        //console.log(request.responseText)
        var json = JSON.parse(request.responseText).data
        var max = json.length

        if (max < 1)
            return;

        for (var i = 0; i < max; i++) {

            var info = json[i]

            var votes = info.votes
            var div = document.getElementById("votes")
            div.innerHTML = votes;
            //var t = document.createTextNode('&nbsp;&nbsp;&nbsp;&nbsp;'+votes);
            //div.appendChild(t);

        }
    }

    function onGenerateClick(e) {
        e.preventDefault();
        e.stopPropagation();
        AudioHandler.switchTo()
    }

    function show(name, dontUpdateVotes) {
        //var desc = document.getElementById("vote");
        //console.log(votedArray.indexOf(name), votedArray)

        var div = document.getElementById("name");
        if (!div)
            return;
        div.innerHTML = name.charAt(0).toUpperCase() + name.slice(1);//"Odra: " + 

        if (votedArray.indexOf(name) == -1) {
            //desc.innerHTML = '<i id="stateicon" class="fa fa-heart"></i>';
            var svg = $('.vote .like__full');
            //console.log('dislike', svg.hasClass('liked'))
            if (svg.hasClass('liked')) {
                svg.removeClass('liked');
                TweenMax.to(svg, 0.4, {opacity: 0});
            }
        } else {
            var svg = $('.vote .like__full');
            //console.log('like', svg.hasClass('liked'))
            if (!svg.hasClass('liked')) {
                svg.addClass('liked');
                TweenMax.to(svg, 0.4, {opacity: 1});
            }
            //desc.innerHTML = '<i id="stateicon" class="fa fa-heart-o"></i>';
        }

        //if (dontUpdateVotes != true)
        //    getVotes(name)
    }

    function onButtonClick(e) {
        //console.log('a')
        e.preventDefault();
        e.stopPropagation();
        AudioHandler.switchTo(e.target.id)
    }

    function onButtonOver(e) {
        TweenLite.to(e.target, 0, {css: {opacity: 0.5}})
    }

    function onButtonOut(e) {
        TweenLite.to(e.target, .3, {css: {opacity: 1}})
    }

    function fade(animateIn) {
        if (animateIn) {
            TweenLite.to(tween, .5, {opacity: 0, onUpdate: updateOpacity})
        } else {
            TweenLite.to(tween, .5, {opacity: 1, onUpdate: updateOpacity})
        }
    }

    function updateOpacity() {
        //desc.style.opacity = tween.opacity
        //if (!isMobile.any)
        if (isMobile.any) {
            document.getElementById("generate2").style.display = "none";
            document.getElementById("generate2").style.opacity = tween.opacity
        }
        panel.style.opacity = tween.opacity
    }

    function update() {
        //desc.style.opacity=Math.random()

        /*if (generateRollOver.value != 0) {
         frame++
         if (1 - generateRollOver.value < frame / 10) {
         frame = 0
         generateButtonSet()
         
         }
         }*/
    }

    return {
        init: init,
        show: show,
        getTitles: function () {
            return titles;
        },
        update: update,
        fade: fade,
    };
}();