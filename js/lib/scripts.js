var closefunction;
$(document).ready(function () {
    var ulH = 0;
    var isOpen = false;

    resize();

    function resize() {
        ulH = $('.list ul').outerHeight();
        $('.list ul').css({'height': '0', 'opacity': '1'});
        isOpen = false;
    }

    $('.list p').on("click", function () {
        if (isOpen) {
            isOpen = false;
            var ul = $('.list ul');
            var arrow = $('.list svg');
            TweenMax.to(ul, 0.4, {height: 0, ease: Power3.easeInOut});
            TweenMax.to(arrow, 0.4, {rotation: 0, ease: Power3.easeInOut});
        } else {
            isOpen = true;
            var ul = $('.list ul');
            var arrow = $('.list svg');
            TweenMax.to(ul, 0.4, {height: ulH, ease: Power3.easeInOut});
            TweenMax.to(arrow, 0.4, {rotation: -90, ease: Power3.easeInOut});
        }
    });

    $('.vote').on("click", function () {
        var svg = $('.vote .like__full');
        if (svg.hasClass('liked')) {
            svg.removeClass('liked');
            TweenMax.to(svg, 0.4, {opacity: 0, ease: Power3.easeInOut});
        } else {
            svg.addClass('liked');
            TweenMax.to(svg, 0.4, {opacity: 1, ease: Power3.easeInOut});
        }
    });

    $('.generate').on("click", function () {
        if (isOpen) {

            closefunction();
        }
    });

    closefunction = function () {
            isOpen = false;
        var ul = $('.list ul');
        var arrow = $('.list svg');
        TweenMax.to(ul, 0.4, {height: 0, ease: Power3.easeInOut});
        TweenMax.to(arrow, 0.4, {rotation: 0, ease: Power3.easeInOut});
    }

});
