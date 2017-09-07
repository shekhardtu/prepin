// Video Popup code


var $doc = $(document);

// Building the slider using IIFE

(function () {
    var pl = {
        data: {
            jsonFile: "./src/data/data.json"
        },
        model: {
            getJsonData: function (jsonFile) {
                var dfd = $.Deferred();
                $.ajax({
                    dataType: "json",
                    url: jsonFile
                }).done(function (response) {
                    dfd.resolve(response);
                }).fail(function (error) {
                    dfd.reject(error);
                });
                return dfd.promise();
            }
        },
        views: {
            sliderTileView: function () {
                var sliderTileDom = "<a class=\"sldr__tile js-sldr__tile\" href=\"__articleUrl__\">\
                    <div class=\"tile__img\">\
                        <img class=\"tile__img--src\" src=\"__imgUrl__\">\
                    </div>\
                    <div class=\"tile__dtl\">\
                        <div class=\"tile__ttl\">\
                            __title__\
                        </div>\
                        <div class=\"tile__ttl--sub\">\
                            <div class=\"open__link js-open__link\" data-open-url=\"__writerUrl__\">__writerName__</div>\
                        </div>\
                        <div class=\"tile__meta\">\
                            <div class=\"tile__meta--elmnt tile__meta--rtng\">__articleRating__ &#9733; </div>\
                            <div class=\"tile__meta--elmnt tile__meta--views\"> __articleViews__ &#128065;</div>\
                            \
                        </div>\
                    </div>\
                </a>";
                return sliderTileDom;
            },
            sliderContainerDom: function () {
                var sliderCntnr = "<section class=\"sctn sldr js-sldr\" data-slideitemwrapper=\"js-sldr__cntnr--trnslt\" data-slideitem=\"js-sldr__tile\">\
					<div class=\"js-sldr__arrow sldr__arrow sldr__arrow--prev js-sldr__dsbl-btn\" data-slide=\"0\"></div>\
					<div class=\"js-sldr__arrow sldr__arrow sldr__arrow--next\" data-slide=\"0\"></div>\
					<div class=\"sctn__hdr clearfix\">\
						<div class=\"sctn__ttl clearfix\">__title__</div>\
						<a class=\"sctn__view-all bttn bttn--red bttn--rds\" href=\"__url__\">\
							View All\
						</a>\
					</div>\
					<div class=\"sldr__cntnr\">\
					<div class=\"sldr__cntnr--trnslt js-sldr__cntnr--trnslt clearfix\">\
								__sldrTiles__\
					</div>\
					</div>\
				</section>";
                return sliderCntnr;
            }
        },
        controller: {
            createSliderTile: function (sliderCntnrs, sliderData) {
                var slider = "",
                    mapObj;
                for (var i = 0; i < sliderData.length; i++) {
                    mapObj = { // Kind of templating 
                        __articleUrl__: sliderData[i].readurl,
                        __imgUrl__: sliderData[i].imageUrl,
                        __writerName__: sliderData[i].author.name,
                        __writerUrl__: sliderData[i].author.url,
                        __title__: sliderData[i].title,
                        __articleRating__: (sliderData[i].averageRating).toFixed(2),
                        __articleViews__: sliderData[i].readCount,
                        __ratingCount__: sliderData[i].ratingCount

                    };
                    slider += pl.views.sliderTileView().replace(/__articleUrl__|__imgUrl__|__writerName__|__writerUrl__|__title__|__articleRating__|__articleViews__|__ratingCount__/gi, function (matched) {
                        return mapObj[matched];
                    });
                }
                slider = sliderCntnrs.replace(/__sldrTiles__/ig, slider);
                return slider;
            },
            createSliders: function () {
                pl.model.getJsonData(pl.data.jsonFile).done(function (response) {
                    var galleryData = response.sections;
                    var tempVar = "";
                    var sliderCntnrs = "";
                    for (var i = 0; i < galleryData.length; i++) {
                        var mapObj = {
                            __title__: galleryData[i].title,
                            __url__: galleryData[i].url
                        };
                        tempVar = pl.views.sliderContainerDom().replace(/__title__|__url__/gi, function (matched) {
                            return mapObj[matched];
                        });
                        sliderCntnrs += pl.controller.createSliderTile(tempVar, galleryData[i].bookList);
                    }

                    $(".js-sldr--hook").append(sliderCntnrs);

                });
            }
        },
        init: function () {
            pl.controller.createSliders();
        }

    };

    pl.init();

})();


// Building the slider using IIFE
function slide(element, direction) {
    var $slider = $(element).closest(".js-sldr"),
        slideItemWrapper = $slider.data("slideitemwrapper"),
        $elementWrapper = $slider.find(".js-sldr__cntnr--trnslt"),
        slideItem = $slider.data("slideitem"),
        $elements = $elementWrapper.find("." + slideItem),
        $currentElement = $elements.filter(".js-sldr-crnt"),
        $startElement = null,

        countCurrItems = Math.floor($("." + slideItemWrapper).width() / $elements.eq(0).outerWidth(true)),
        countRightItems = $elements.length - $elements.index($currentElement) - countCurrItems,
        countLeftItems = $elements.index($currentElement),
        elementPos;

    if ($(element).hasClass("js-sldr__dsbl-btn")) {
        return;
    }

    $slider.children(".sldr__arrow--prev").removeClass("js-sldr__dsbl-btn");
    $slider.children(".sldr__arrow--next").removeClass("js-sldr__dsbl-btn");

    if (direction === "right") {
        if (countRightItems > countCurrItems) {
            $startElement = $elements.eq($elements.index($currentElement) + countCurrItems);
        } else {
            $startElement = $elements.eq($elements.length - countCurrItems);
            $(element).addClass("js-sldr__dsbl-btn");
        }
    } else if (direction === "left") {
        if (countLeftItems > countCurrItems) {
            $startElement = $elements.eq($elements.index($currentElement) - countCurrItems);
        } else {
            $startElement = $elements.eq(0);
            $(element).addClass("js-sldr__dsbl-btn");
        }
    }

    $currentElement.removeClass("js-sldr-crnt");
    $startElement.addClass("js-sldr-crnt");

    //IE does not support transitions.
    elementPos = -$startElement.position().left;

    $elementWrapper.css({
        "transform": "translateX(" + elementPos + "px)",
        "-webkit-transform": "translateX(" + elementPos + "px)",
        "-ms-transform": "translateX(" + elementPos + "px)"
    });

    return false;
}

$doc.ready(function () {
    $doc.on("click", ".sldr__arrow", function () {
        var isNext = $(this).hasClass("sldr__arrow--next");
        if (isNext) {
            slide(this, "right");
        } else {
            slide(this, "left");
        }
    });

});