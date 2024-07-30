(function($) {
    $.fn.extend({

        hs_tabs: function($prams) {

            if ( typeof $prams == "undefined") $prams = {}

            $defaults = {
                firstElementClick : 1,
                checkBeforeChange: function($obj) { return 1 },
                callback : function($obj) {},
                callbackBefore: function($obj) {},
                collapse_all : 0,
                dynamic_tabs : {},
                controller_functions : {},
                animate   : 1,
                animation_duration : 400,
                direction : 'horizontal',
                mobile_direction : 'vertical',
                header_carousel : 0,
            }

            $.each($defaults,function(k,v) {
                $prams[k] = ( typeof $prams[k] == "undefined") ? v : $prams[k];
            });

            var hs_tabs_functions = {

                show : function(elem) {

                    return new Promise(function(res, rej) {

                        if ( Number($prams.animate) ) {

                            elem.slideDown( Number($prams.animation_duration), function () {
                                res(elem)
                            });
                        } else {
                            elem.css("display",'block');
                            res(elem)
                        }
                    })
                    
                },
                hide : function(elem) {

                    return new Promise(function(res, rej) {

                        if ( Number($prams.animate) ) {

                            elem.slideUp( Number($prams.animation_duration), function () {
                                res(elem)
                            });
                        } else {
                            
                            elem.css("display",'none');
                            res(elem)
                        }
                    })
                    
                },
            }
            var set = this

            return set.each(function(k,v){

                var elem = $(v);

                if ( elem.hasClass('hs_tabs_initilized') ) return true;
                elem.addClass('hs_tabs_initilized');
                
                if ( $prams.dynamic_tabs.length ) {

                    $.each($prams.dynamic_tabs, function(k,v) {

                        if ( !isNaN(Number(k)) ) k = cx.utilities.slugify(v);

                        elem.append('<section data-cx_tabs_controller="'+k+'"><header>'+v+'</header><div></div></section>');

                    })
                }
                // hiding all
                
                var sections = elem.children("section");
                sections.children().css("display", "none");
                
                //sections.css("display", "none");
                
                var lis= "";
                sections.each(function(k,v){

                    if ( typeof $(v).attr("data-cx_tabs_controller") == "undefined" ) {

                        text = $(v).children("header").text();
                        $(v).attr("data-cx_tabs_controller" , cx.utilities.slugify(text) );
                    }
                    lis += "<li data-tabindex="+k+" data-cx_tab_controller='"+$(v).attr("data-cx_tabs_controller")+"'>" + $(v).children("header").children().html() + "</li>";
                    //$(v).children("header").remove();
                })
                elem.prepend("<div class='hs_tabs_header clearfix'><ul>"+lis+"</ul></div>");
                
                if ( ($(window).width() < 600 && $prams.mobile_direction == 'vertical') || $prams.direction == 'vartical' ) {
                    
                    sections.children("header").css("display", "block");
                    elem.children(".hs_tabs_header").css("display", "none");
                    $prams.collapse_all = 1;
                    $prams.firstElementClick = 0;

                }

                var hs_tabs_header = elem.children(".hs_tabs_header");

                if ( $prams.header_carousel ) {

                    hs_tabs_header.find("ul").addClass("owl-carousel owl-theme").owlCarousel({
                        //items : 4
                        nav : true,
                        stagePadding: 0,
                        //navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
                        dots : 0,
                        autoHeight:true,
                    });    
                }
                
                sections.children("header").click(function() {

                    var index = $(this).parent().index() - 1;
                    var li = elem.children(".hs_tabs_header").find("li").eq( index );
                    var remove_active = 0;
                    if ( li.hasClass("active") ) {
                        remove_active = 1;
                    }
                    li.trigger("click");
                    if ( remove_active ) li.removeClass("active");
                    

                    
                })

                elem.children(".hs_tabs_header").on("click change","li", function() {

                    

                    if ( !$(this).hasClass("active") ) {

                        var index = $(this).attr("data-tabindex");


                        if ( $prams.checkBeforeChange( index ) ) {

                            
                            elem.children(".hs_tabs_header").find("li").removeClass("active")
                            $(this).addClass("active");
                            
                            sections.children("header").removeClass("active");
                            sections.eq( index ).children("header").addClass("active")
                            
                            $prams.callbackBefore( $(this) );
                            

                            elem_to_hide = sections.children().filter(":not(header)");

                            hs_tabs_functions.hide(elem_to_hide).then(function() {

                                var elem_to_show = sections.eq(index ).children().filter(":not(header)");


                                return hs_tabs_functions.show(elem_to_show);

                            });
                            
                            $prams.callback( index );

                            $controller = $(this).attr("data-cx_tab_controller") ;
                            body = sections.eq(  index ).children().last();
                            // console.log('body: ', body);
                            // console.log('1. before $prams.controller_functions');

                            if ( typeof $prams.controller_functions["__ALL__"] ==  "function") {
                                $prams.controller_functions["__ALL__"]( body );
                                // console.log('yooo: ', $prams.controller_functions[$controller]);
                            }

                            if ( typeof $prams.controller_functions[$controller] ==  "function") {
                                $prams.controller_functions[$controller]( body );
                                // console.log('yooo: ', $prams.controller_functions[$controller]);
                            }
                            // console.log('5. after $prams.controller_functions');
                        }

                    } else {

                        

                        if ( $prams.collapse_all ) {

                            var sec = sections.eq(  index );

                            var elem_to_hide = sec.children();

                            hs_tabs_functions.hide(elem_to_hide.filter(":not(header)"))
                            
                            elem_to_hide.removeClass("active");


                        }
                        
                    }
                    
                });

                

                if ( Number($prams.firstElementClick) ) {

                    elem.children(".hs_tabs_header").find("li").first().trigger("click")
                    
                }
                
            })
        },
    });

})(jQuery);