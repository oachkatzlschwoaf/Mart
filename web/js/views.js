// Definition
var elms_map = {};

var view_global      = {};
var view_my_gifts    = {};
var view_win         = {};
var view_friends_sel = {};
var view_covers      = {};
var view_desc        = {};
var view_done        = {};
var view_friends     = {};
var view_friend      = {};
var view_holidays    = {};
var view_friends_hearts_top = {};
var view_hearts_top  = {};

// Functions

function loadViews() {
    mapElementsViews();

    // Global view
    // ======================================================
    view_global = {
        init: function(ev, map) {
            this.map = map; 
            this.ev  = ev;

            // Listener 
            ev.emitter.on('pages.hide', function (e, input) { 
                this.hidePages();
            }.bind(this));

            ev.emitter.on('loading.start', function (e, input) { 
                this.showPageLoader();
            }.bind(this));

            ev.emitter.on('loading.finish', function (e, input) { 
                this.hidePageLoader();
            }.bind(this));

            ev.emitter.on('menu.select', function (e, input) { 
                this.selectMenu(input);
            }.bind(this));

            ev.emitter.on('page.show', function (e, input) { 
                this.showPage(input);
            }.bind(this));

            ev.emitter.on('user_balance.update', function (e, input) { 
                this.updateBalance(input);
            }.bind(this));

            ev.emitter.on('welcome.show', function (e, input) { 
                this.showWelcome();
            }.bind(this));

            ev.emitter.on('money_thanks.show', function (e, input) { 
                this.showMoneyThanks();
            }.bind(this));

            ev.emitter.on('index.pleaseHearts', function (e, input) { 
                this.pleaseHearts();
            }.bind(this));

            ev.emitter.on('hearts_limit.check', function (e, input) { 
                this.checkHeartsLimit();
            }.bind(this));

            // API Listener
            mailru.events.listen(mailru.app.events.paymentDialogStatus, function(event) {
                this.ev.emitter.trigger('user_balance.update_force');

                if (event.status == 'opened') {
                    $.fancybox.close();
                }

                if (event.status == 'closed') {
                    this.ev.emitter.trigger('purchase.try_again');
                    this.ev.emitter.trigger('heart.try_again');
                }
            }.bind(this));

            mailru.events.listen(mailru.app.events.incomingPayment, function(event) {
                this.ev.emitter.trigger('user_balance.update_force');

                if (event.status == 'success') {
                    this.ev.emitter.trigger('money_thanks.show');
                }

            }.bind(this));

            mailru.events.listen(mailru.common.events.guestbookPublish, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                }
            });

            mailru.events.listen(mailru.common.events.message.send, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                }
            });

            mailru.events.listen(mailru.common.events.message.send, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                }
            });

            mailru.events.listen(mailru.common.events.streamPublish, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                }
            });

            mailru.events.listen(mailru.app.events.readHash, function(result){
                $.each(result, function(p, v) {
                    if (p == 'showFriend') {
                        cntrl_friend.show(v);
                    }
                });
            });
        },

        checkHeartsLimit: function() {
            var now = new Date();
            var interval = now - util.hearts_limit;

            if (interval < 0) {
                interval = Math.abs(Math.round(interval / 1000));
                var hours = Math.floor(interval / (60 * 60));
                var min = Math.round((interval - hours * 60 * 60) / 60);

                this.map.hearts.text_limit_interval.text( 
                    hours + ' ' + declOfNum(hours, ['час', 'часа', 'часов']) + ' ' +
                    min + ' ' + declOfNum(min, ['минуту', 'минуты', 'минут'])
                );

                this.map.hearts.send_button.text('Отправить сердечко за ' + util.heart_cost + ' монет');

                this.map.hearts.text_ok.hide();
                this.map.hearts.text_limit.show();

            } else {
                this.map.hearts.send_button.text('Отправить сердечко!');
                this.map.hearts.text_ok.show();
                this.map.hearts.text_limit.hide();

            }
        },

        pleaseHearts: function() {
            mailru.common.stream.post({
                'title': 'Ребята, пришлите мне сердечек!',
                'text': 'Подарите мне сердечек, чтобы победить! Это бесплатно! И всех с праздниками!',
                'img_url': util.abs_path + "../images/heart.png",
                'action_links': [
                    {'text': 'Посмотреть' },
                ]
            });
        },

        hidePages: function() {
            $('.gft_page').each( function() { 
                $(this).hide(); 
            });
        },

        showPage: function(page) {
            $(this.map.page_prefix+page).show();         
        },

        showPageLoader: function() {
            this.map.loader.show();
        },

        hidePageLoader: function() {
            this.map.loader.hide();
        },

        updateBalance: function(p) {
            this.map.user_balance.text(p + ' ' + declOfNum(p, ['монета', 'монеты', 'монет']));
        },

        selectMenu: function(mnu) {
            this.map.menu_elms.each( function() { 
                $(this).removeClass('active'); 
            });

            this.map.nav_buttons[mnu].addClass('active');
        },

        showAvatar: function(ava) {
            this.map.main_avatar.attr('src', ava);
        },

        updateHearts: function(count) {
            this.map.hearts.count.html(count);
        },

        showWelcome: function() {
            this.map.welcome.fancybox({
                'overlayColor': '#fff'
            }).trigger('click');
        },

        showMoneyThanks: function() {
            this.map.money_thanks.fancybox({
                'overlayColor': '#fff'
            }).trigger('click');
        }
    };

    // Windows
    // ======================================================
    view_win = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener 
            ev.emitter.on('win.gift.show', function (e, input) { 
                this.showGift(data);
            }.bind(this));
        },

        showGift: function(data) {
            win = this.map.gift_win;

            // hide
            win.mess.hide();
            win.avatar_c.hide();
            win.answer.hide();

            // fill
            win.img.attr("src", data.img);
            win.text.text(data.text);
            win.date.text(data.date);
            win.from.text(data.from);
            win.avatar.attr("src", data.avatar);

            // Behaivor
            this.map.gift_win.answer.click(function() {
                cntrl_purchase.setFriend(data.from_id, 'id');
                $.fancybox.close();
            }.bind(this));

            // show
            if (data.text) {
                win.mess.show();
            }

            if (typeof data.incog == undefined || data.incog == false) {
                win.avatar_c.show();
                win.answer.show();
            }
        }
    }

    // My Gifts Block 
    // ======================================================
    view_my_gifts = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener 
            ev.emitter.on('block_mygifts.show', function (e, input) { 
                this.show();
            }.bind(this));

            ev.emitter.on('block_mygifts.hide', function (e, input) { 
                this.hide();
            }.bind(this));
        },

        show: function() {
            elms_map.my_gifts_block.show(); 
        },

        hide: function() {
            elms_map.my_gifts_block.hide(); 
        },

        fill: function(list, len) {
            this.map.my_gifts.html('');

            $.each(list, function(i, e) {
                var path = util.thumbs_path+'/'+e.gift_id+'.png';

                user_name = e.user_name;
                if (e.incognito) {
                    user_name = 'Инкогнито';
                }

                this.map.my_gifts.append(
                    "<article><img src='"+path+"' width='90' height='90' alt=''><div class='descr'><a onclick='cntrl_index.showGift("+e.id+")' href='#gift_window' class='gift_link'><img src='"+path+"' width='90' height='90' alt=' '></a>"+user_name+"<div class='grey'>"+e.created_date+"</div></div></article>"
                );    
            }.bind(this));

            $(".gift_link").fancybox({
                'overlayColor': '#fff'
            });
        },
    };

    // Holidays
    // ======================================================
    view_holidays = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener 
            ev.emitter.on('holidays.show', function (e, input) { 
                this.show(input);
            }.bind(this));

            ev.emitter.on('holidays.hide', function (e, input) { 
                this.hide();
            }.bind(this));

            ev.emitter.on('holidays.fill', function (e, input) { 
                this.fill(input);
            }.bind(this));
        },

        show: function(data) {
            this.map.holidays.block.show();
        },

        hide: function() {
            this.map.holidays.block.hide();
        },

        fill: function(data) {
            var i = 0;

            this.map.holidays.list.html('');

            $.each(data, function(d, e) {
                i++;

                if (i < 3) {
                    // Today and Tomorrow (special styles)

                    dname = 'Сегодня';
                    if (i == 2) {
                        dname = 'Завтра';
                    }

                    this.map.holidays.list.append("<article class='today'><div class='big'>"+dname+"</div><ul id='"+this.map.holidays.hlist_pfx+i+"' class='holi_list'></ul><div class='bday' id='"+this.map.holidays.bday_pfx+i+"'></div></article>");
                    
                    if (Object.size(e.friends) > 0) {
                        $("#"+this.map.holidays.bday_pfx+i).append("Дни рождения:<ul id="+this.map.holidays.bday_list_pfx+i+"></ul>"); 

                        var j = 0;
                        $.each(e.friends, function(fid, f) {
                            j++;
                            if (j < 6) {
                                $("#"+this.map.holidays.bday_list_pfx+i).append("<li><a href='#' onclick='cntrl_purchase.setFriend(\""+f.uid+"\")'><img title='"+htmlEncode(f.name)+"' src='"+f.pic_32+"' /></a></li>"); 
                            }
                        }.bind(this));

                    } 

                    if (Object.size(e.holidays) > 0) {
                        var j = 0;
                        $.each(e.holidays, function(hid, h) {
                            j++;
                            if (j < 3) {
                                $("#"+this.map.holidays.hlist_pfx+i).append("<li><a href='#' onclick='cntrl_index.showGiftsCatalog()'>"+h.name+"</a></li>"); 
                            }
                        }.bind(this));

                    } else {
                        $("#"+this.map.holidays.hlist_pfx+i).append("<li>нет праздников</li>"); 
                    }


                } else {
                    // Other dates

                    style_add = "";
                    if (i == 5) {
                        style_add = "style='border-right: none'"; 
                    }

                    this.map.holidays.list.append("<article "+style_add+"><div class='date_title'>"+e.dname+"</div><div id='"+this.map.holidays.date_no_holiday+i+"' class='no_holiday'>нет праздников</div><div class='bday' id='"+this.map.holidays.date_bdays+i+"'>Дни рождения:<ul id='"+this.map.holidays.date_bdays_list+i+"'></ul></div></article>");

                    if (Object.size(e.friends) > 0) {
                        $("#"+this.map.holidays.date_no_holiday+i).html('');
                        $("#"+this.map.holidays.date_bdays+i).show();

                        var j = 0;
                        $.each(e.friends, function(fid, f) {
                            j++;
                            if (j < 3) {
                                $("#"+this.map.holidays.date_bdays_list+i).append("<li><a href='#' onclick='cntrl_purchase.setFriend(\""+f.uid+"\")'><img title='"+htmlEncode(f.name)+"' src='"+f.pic_32+"' /></a></li>"); 
                            }
                        }.bind(this));

                    } else {
                        $("#"+this.map.holidays.date_bdays+i).hide();

                        if (Object.size(e.holidays) > 0) {
                            var j = 0;
                            $.each(e.holidays, function(hid, h) {
                                j++;
                                if (j < 2) {
                                    $("#"+this.map.holidays.date_no_holiday+i).html("<a href='#' onclick='cntrl_index.showGiftsCatalog()'>"+h.name+"</a>"); 
                                }
                            }.bind(this));
                        }
                    }
                }
            }.bind(this));
        }
    };

    // Friends Hearts Top 
    // ======================================================
    view_friends_hearts_top = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener 
            ev.emitter.on('friends_hearts_top.show', function (e, input) { 
                this.show(input);
            }.bind(this));

            ev.emitter.on('friends_hearts_top.hide', function (e, input) { 
                this.hide();
            }.bind(this));
        },

        show: function(data) {
            if (Object.size(data) > 0) {
                this.map.friends_hearts_top.list.html('');

                $.each(data, function(id, el) {
                    e = el.user;
                    this.map.friends_hearts_top.list.append("<article class='article80'><div class='photo80'><a href='#' onclick='cntrl_friend.show(\""+e.uid+"\")'><img src='"+e.pic_128+"' width='80' height='80' alt=' '></a></div><div class='subtitle'><span class='ava_heart'></span><span class='text'>"+el.count+"</span></article></div>");
                }.bind(this));

                this.map.friends_hearts_top.block.show();
            }
        },

        hide: function() {
            this.map.friends_hearts_top.block.hide();
        },
    };

    // Hearts Top 
    // ======================================================
    view_hearts_top = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener 
            ev.emitter.on('hearts_top.show', function (e, input) { 
                this.show(input);
            }.bind(this));

            ev.emitter.on('hearts_top.hide', function (e, input) { 
                this.hide();
            }.bind(this));
        },

        show: function(data) {
            if (Object.size(data) > 0) {
                this.map.hearts_top.list.html('');

                $.each(data, function(id, el) {
                    e = el.user;

                    this.map.hearts_top.list.append("<article class='article80'><div class='photo80'><a href='#' onclick='cntrl_friend.show(\""+e.uid+"\")'><img src='"+e.pic_128+"' width='80' height='80' alt=' '></a></div><div class='subtitle'><span class='ava_heart'></span><span class='text'>"+el.count+"</span></article></div>");
                }.bind(this));

                this.map.hearts_top.block.show();
            }
        },

        hide: function() {
            this.map.hearts_top.block.hide();
        },
    };

    // Gifts Catalog 
    // ======================================================
    view_gifts_cat = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener
            ev.emitter.on('block_gifts_cat.show', function (e, input) { 
                this.show();
            }.bind(this));

            ev.emitter.on('attention_top.show', function (e, input) { 
                this.showAttentionTop();
            }.bind(this));

            ev.emitter.on('attention_top.hide', function (e, input) { 
                this.hideAttentionTop();
            }.bind(this));

            ev.emitter.on('hearts_promo.show', function (e, input) { 
                this.showHeartsPromo();
            }.bind(this));

            ev.emitter.on('hearts_promo.hide', function (e, input) { 
                this.hideHeartsPromo();
            }.bind(this));

            ev.emitter.on('gift_cat.set_category', function (e, input) { 
                this.setCategory(input);
            }.bind(this));

            ev.emitter.on('gift_cat.set_sort', function (e, input) { 
                this.setSort(input);
            }.bind(this));
        },

        show: function() {
            this.map.gifts_cat_block.show(); 
        },

        showAttentionTop: function() {
            this.map.attention_top.block.show(); 
        },

        hideAttentionTop: function() {
            this.map.attention_top.block.hide(); 
        },

        showHeartsPromo: function() {
            this.map.hearts.block.show(); 
        },

        hideHeartsPromo: function() {
            this.map.hearts.block.hide(); 
        },

        fill: function(list, len) {
            this.map.gifts_cat.html('');

            $.each(list, function(i, e) {
                img_path = util.thumbs_path+"/"+e.id+".png";

                this.map.gifts_cat.append("<article><a onclick='cntrl_purchase.setGift("+e.id+")' href='#'><img src='"+img_path+"' width='90' height='90' alt=' '></a></article>");

            }.bind(this));
        },

        setCategory: function(cid) {
            $.each(util.gift_category, function(i, e) {
                $("#"+this.map.gift_category+i).removeClass('active');
            }.bind(this));

            $("#"+this.map.gift_category+cid).addClass('active');
        },

        setSort: function(sort) {
            $.each(util.category_sort, function(i, e) {
                $("#"+this.map.category_sort+i).removeClass('active');
            }.bind(this));

            $("#"+this.map.category_sort+sort).addClass('active');
        }
    };

    // Friends Selector 
    // ======================================================
    view_friends_sel = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener
            ev.emitter.on('block_friends_sel.show', function (e, input) { 
                this.show();
            }.bind(this));

            // Behaivor
            map.friends_sel.friends_search.focus(function() {
                $(this).val('');
            });

            map.friends_sel.friends_search.keyup(function() {
                var query = map.friends_sel.friends_search.val();  
                this.ev.emitter.trigger('friend.search', query);
            }.bind(this));
        },

        show: function() {
            this.map.friends_sel.friends_block.show();
        },

        fill: function(list, len, params) {
            this.map.friends_sel.friends.html('');

            $.each(list, function(i, e) {
                var action = "cntrl_purchase.setFriend(\""+e.uid+"\")";

                if (typeof(params) != 'undefined' && params.content == 'hearts') {
                    action = "cntrl_heart.setFriend(\""+e.uid+"\")";
                }

                this.map.friends_sel.friends.append("<article><div class='photo'><a href='#' onclick='"+action+"'><img src='"+e.pic_128+"' width='120' height='120' alt=' '></a></div>"+e.name+"</article>");
            }.bind(this));

            if (len <= util.show_friends) {
                elms_map.friends_sel.friends_nav.hide();       
            } else {
                elms_map.friends_sel.friends_nav.show();       
            }
        }

    };

    // Description 
    // ======================================================
    view_desc = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener
            ev.emitter.on('desc_block.show', function (e, input) { 
                this.show(input);
            }.bind(this));
        },

        show: function(p) {
            d = new Date();

            this.map.desc.img.attr("src", util.images_path+"/"+p.gift.id+".png");
            this.map.desc.for.text( p.friend.getName() );
            this.map.desc.for_ava.attr("src", p.friend.getAvatar(50)+"?"+d.getTime());

            this.map.desc.text.val("");
            this.map.desc.private.removeAttr("checked");
            this.map.desc.incognito.removeAttr("checked");

            this.map.desc.block.show();
        },

        complete: function() {
            var desc = { };

            desc.text = this.map.desc.text.val();

            desc.privacy = 0;
            if (this.map.desc.private.is(':checked')) {
                desc.privacy = 1;
            }

            desc.incognito = 0;
            if (this.map.desc.incognito.is(':checked')) {
                desc.incognito = 1;
            }

            this.ev.emitter.trigger('description.complete', desc);
        }
    };


    // Covers 
    // ======================================================
    view_covers = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener
            ev.emitter.on('covers_block.show', function (e, input) { 
                this.show(input);
            }.bind(this));
        },

        show: function() {
            this.map.covers.block.show();
        }
    };


    // Send Done, Error 
    // ======================================================
    view_done = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener
            ev.emitter.on('send_done_block.show', function (e, input) { 
               this.showDone(input);
            }.bind(this));

            ev.emitter.on('send_error_block.show', function (e, input) { 
               this.showError(input);
            }.bind(this));

            ev.emitter.on('send_heart_done_block.show', function (e, input) { 
               this.showHeartDone(input);
            }.bind(this));

            ev.emitter.on('send_heart_error_block.show', function (e, input) { 
               this.showHeartError(input);
            }.bind(this));

            ev.emitter.on('send_done_block.load.start', function (e, input) { 
               this.startLoading();
            }.bind(this));

            ev.emitter.on('send_done_block.load.finish', function (e, input) { 
               this.finishLoading();
            }.bind(this));

            ev.emitter.on('send_done_block.guestbook.post', function (e, input) { 
               this.postGuestbook(input);
            }.bind(this));

            ev.emitter.on('send_done_block.message.send', function (e, input) { 
               this.sendMessage(input);
            }.bind(this));

            ev.emitter.on('send_done_block.stream.post', function (e, input) { 
               this.postStream(input);
            }.bind(this));

            ev.emitter.on('send_done_block.friends.invite', function (e, input) { 
               this.inviteFriends(input);
            }.bind(this));

            ev.emitter.on('send_done_block.request.send', function (e, input) { 
               this.request(input);
            }.bind(this));

            // Hearts
            ev.emitter.on('send_done_block.guestbook.postHeart', function (e, input) { 
               this.postGuestbookHeart(input);
            }.bind(this));

            ev.emitter.on('send_done_block.request.sendHeart', function (e, input) { 
               this.requestHeart(input);
            }.bind(this));

            ev.emitter.on('send_done_block.message.sendHeart', function (e, input) { 
               this.sendMessageHeart(input);
            }.bind(this));
        },

        startLoading: function() {
            this.map.done.block.ok.hide();
            this.map.done.block.error.hide();
            this.map.done.block.ok_heart.hide();
            this.map.done.block.error_heart.hide();
            this.map.done.loader.show();
        },

        finishLoading: function() {
            this.map.done.loader.hide();
        },

        showError: function(p) {
            d = new Date();

            this.map.done.error.ava.attr('src', p.friend.getAvatar(190)+"?"+d.getTime()); 
            this.map.done.error.for.text(p.friend.getName()); 
            this.map.done.error.gift.attr('src', util.thumbs_path+"/"+gift.id+".png");

            this.map.done.error.text.text(p.need + ' ' + declOfNum(p.need, ['монета', 'монеты', 'монет']));
            
            this.map.done.block.error.show();
        },

        showDone: function(p) {
            d = new Date();

            this.map.done.ok.ava.attr('src', p.friend.getAvatar(190)+"?"+d.getTime()); 
            this.map.done.ok.for.text(p.friend.getName()); 
            this.map.done.ok.gift.attr('src', util.thumbs_path+"/"+gift.id+".png");

            this.map.done.block.ok.show();
        },

        showHeartError: function(p) {
            d = new Date();

            this.map.done.heart_error.ava.attr('src', p.friend.getAvatar(190)+"?"+d.getTime()); 
            this.map.done.heart_error.text.text(p.need + ' ' + declOfNum(p.need, ['монета', 'монеты', 'монет']));

            this.map.done.block.error_heart.show();
        },

        showHeartDone: function(p) {
            d = new Date();

            this.map.done.heart_ok.ava.attr('src', p.friend.getAvatar(190)+"?"+d.getTime()); 
            this.map.done.heart_ok.for.text(p.friend.getName()); 

            this.map.done.block.ok_heart.show();
        },

        postGuestbookHeart: function(p) {
            mailru.common.guestbook.post({
               'uid': p.friend.uid,
               'title': 'Сердечко для тебя!', 
               'text': 'Отправляю тебе сердечко! И жду твое в ответ ;-)',
               'img_url': util.abs_path + "../images/heart128.png"
            }); 
        },

        request: function(p) {
            mailru.app.friends.request({
               'friends': [ p.purchase.friend_selected ],
               'text': 'Отправляю тебе валентинку! И жду твою в ответ ;-)',
               'image_url': util.abs_path + "../uploads/images/"+p.purchase.gift_selected+".png"
            }); 
        },

        requestHeart: function(p) {
            mailru.app.friends.request({
               'friends': [ p.friend.uid ],
               'text': 'Отправляю тебе сердечко! И жду твое в ответ ;-)',
               'image_url': util.abs_path + "../images/heart128.png"
            }); 
        },

        postGuestbook: function(p) {
            mailru.common.guestbook.post({
               'uid': p.purchase.friend_selected,
               'title': 'У меня для тебя валентинка!', 
               'text': 'Тебе подарок! Посмотри скорее! '+p.purchase.text,
               'img_url': util.abs_path + "../uploads/images/"+p.purchase.gift_selected+".png"
            }); 
        },

        sendMessage: function(p) {
            mailru.common.messages.send({
                'uid': p.purchase.friend_selected,
                'text': 'Тебе подарок! Посмотри скорее! '+p.purchase.text
            });
        },

        sendMessageHeart: function(p) {
            mailru.common.messages.send({
                'uid': p.friend.uid,
                'text': 'Отправляю тебе сердечко! Поддержи меня и пришли мне тоже :-) Это бесплатно!'
            });
        },


        postStream: function(p) {
            mailru.common.stream.post({
                'title': 'Сделал подарок для ' + p.friend.getName(),
                'text': 'Это тебе! '+p.purchase.text,
                'img_url': util.abs_path + "../uploads/images/"+p.purchase.gift_selected+".png",
                'action_links': [
                    {'text': 'Посмотреть', 'href': 'showFriend=' + p.friend.uid},
                ]
            });
        },

        inviteFriends: function() {
            mailru.app.friends.invite();
        }
    };


    // Friends 
    // ======================================================
    view_friends = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Behaivor
            map.friends.friends_search.focus(function() {
                $(this).val('');
            });

            map.friends.friends_search.keyup(function() {
                var query = map.friends.friends_search.val();  
                this.ev.emitter.trigger('friend_all.search', query);
            }.bind(this));
        },

        fill: function(list, len) {
            this.map.friends.friends.html('');

            $.each(list, function(i, e) {
                this.map.friends.friends.append("<article><div class='photo'><a href='#' onclick='cntrl_friend.show(\""+e.uid+"\")'><img src='"+e.pic_128+"' width='120' height='120' alt=' '></a></div>"+e.name+"</article>");
            }.bind(this));

            if (len <= util.show_friends) {
                elms_map.friends.friends_nav.hide();       
            } else {
                elms_map.friends.friends_nav.show();       
            }
        }

    };


    // Friend 
    // ======================================================
    view_friend = {
        init: function(ev, map) {
            this.ev  = ev;
            this.map = map; 

            // Listener
            ev.emitter.on('friend.block.show', function (e, input) { 
                this.show(input);
            }.bind(this));

            ev.emitter.on('friend.block.show_empty_gifts', function (e, input) { 
                this.showEmptyGifts();
            }.bind(this));
        },

        show: function(p) {
            friend = p.friend;

            this.map.friend.name.text( friend.getName() );
            this.map.friend.block.show();     

            if (friend.getSex() == 1) {
                this.map.friend.no_gifts_text.text('У неё еще нет подарков, сделайте первый подарок!');
                this.map.friend.title.text('Её подарки');
            } else {
                this.map.friend.no_gifts_text.text('У него еще нет подарков, сделайте первый подарок!');
                this.map.friend.title.text('Его подарки');
            }

            // Behaivor
            this.map.friend.make_gift_btn.click(function() {
                cntrl_purchase.setFriend(friend.uid);
            }.bind(this));

            this.map.friend.button.send_gift.click(function() {
                cntrl_purchase.setFriend(friend.uid);
            }.bind(this));
        },

        fill: function(list, len) {
            this.map.friend.no_gifts.hide();
            this.map.friend.gifts_list.html('');

            $.each(list, function(i, e) {
                user_name = e.user_name;
                if (e.incognito) {
                    user_name = 'Инкогнито';
                }

                var path = util.thumbs_path+'/'+e.gift_id+'.png';

                this.map.friend.gifts_list.append( "<article><img src='"+path+"' width='90' height='90' alt=''><div class='descr'><img src='"+path+" 'width='90' height='90' alt=''>"+user_name+"<div class='grey'>"+e.created_date+"</div></div></article>" );
            }.bind(this));

            if (len <= util.show_gifts_friend) {
                elms_map.friend.gifts_nav.hide();       
            } else {
                elms_map.friend.gifts_nav.show();       
            }

            this.map.friend.gifts_block.show();
        },
        
        showEmptyGifts: function() {
            this.map.friend.gifts_block.hide();
            this.map.friend.no_gifts.show();
        }
    };
}

function mapElementsViews() {
    // Global
    elms_map.main_avatar = $('#main_avatar');  // main avatar
    elms_map.loader = $('#right_loader'); // right loader
    elms_map.welcome = $('#welcome'); // welcome window 
    elms_map.money_thanks = $('#money_thanks'); // money thanks window 

    // Balance
    elms_map.user_balance = $('#user_balance');

    // Pages
    elms_map.page_prefix = '#page_'; 

    // Navigation buttons
    elms_map.menu_elms = $('.gft_mnu'); 
    elms_map.nav_buttons = new Array();
    elms_map.nav_buttons['index']   = $('#nav_index');
    elms_map.nav_buttons['friends'] = $('#nav_friends');

    // My Gifts block
    elms_map.my_gifts = $('#gifts_my'); // slider 
    elms_map.my_gifts_block = $('#gifts_my_block'); // block

    // Gift window
    elms_map.gift_win = {};
    elms_map.gift_win.img      = $('#show_gift_img'); 
    elms_map.gift_win.mess     = $("#show_gift_message");
    elms_map.gift_win.text     = $("#show_gift_text");
    elms_map.gift_win.from     = $("#show_gift_from");
    elms_map.gift_win.date     = $("#show_gift_date");
    elms_map.gift_win.avatar   = $("#show_gift_from_img");
    elms_map.gift_win.avatar_c = $("#show_gift_from_img_c");
    elms_map.gift_win.answer   = $("#answer_gift");

    // Gifts catalog
    elms_map.gifts_cat = $('#gifts_list'); // slider
    elms_map.gifts_cat_block = $('#gifts_catalog'); // block
    elms_map.gift_category = 'category_';
    elms_map.category_sort = 'sort_';

    // Friends selector 
    elms_map.friends_sel = {};
    elms_map.friends_sel.friends = $('#friends'); // slider
    elms_map.friends_sel.friends_block = $('#friends_block'); // block
    elms_map.friends_sel.friends_search = $('#friend_search_query'); // search
    elms_map.friends_sel.friends_nav = $('#friends_sel_nav'); // navi

    // Description
    elms_map.desc = {};
    elms_map.desc.block     = $('#description_block'); // block 
    elms_map.desc.img       = $('#gift_show'); // image
    elms_map.desc.for       = $('#gift_for'); // for 
    elms_map.desc.for_ava   = $('#gift_for_ava'); // for ava 
    elms_map.desc.text      = $('#desc_text'); // text 
    elms_map.desc.private   = $('#is_private'); // privacy
    elms_map.desc.incognito = $('#incognito'); // incognito 

    // Covers
    elms_map.covers = {};
    elms_map.covers.block = $("#covers_block"); // block

    // Send done, error
    elms_map.done = {};
    elms_map.done.loader = $("#send_loader"); // loader 
    elms_map.done.block = {};
    elms_map.done.block.ok = $("#done_ok"); // done block 
    elms_map.done.block.error = $("#done_error"); // error block
    elms_map.done.block.ok_heart = $("#heart_send_ok"); // done heart block 
    elms_map.done.block.error_heart = $("#heart_send_error"); // error heart block

    elms_map.done.ok = {};
    elms_map.done.ok.ava = $("#done_ava_for"); // avatar
    elms_map.done.ok.gift = $("#done_gift"); // gift
    elms_map.done.ok.for = $("#done_for"); // for
    elms_map.done.ok.text = $("#done_text"); // text 
    elms_map.done.ok.text2 = $("#done_text2"); // text
    
    elms_map.done.error = {};
    elms_map.done.error.ava = $("#error_ava_for"); // avatar
    elms_map.done.error.gift = $("#error_gift"); // gift
    elms_map.done.error.for = $("#error_for"); // for
    elms_map.done.error.text = $("#error_text"); // text 

    elms_map.done.heart_ok = {};
    elms_map.done.heart_ok.ava = $("#heart_done_ava_for"); // avatar
    elms_map.done.heart_ok.for = $("#heart_done_for"); // for

    elms_map.done.heart_error = {};
    elms_map.done.heart_error.ava = $("#heart_error_ava_for"); // avatar
    elms_map.done.heart_error.text = $("#heart_error_text"); // text 

    // Friends
    elms_map.friends = {};
    elms_map.friends.friends = $('#friends_all'); // slider
    elms_map.friends.friends_block = $('#friends_all_block'); // block
    elms_map.friends.friends_search = $('#friend_all_query'); // search
    elms_map.friends.friends_nav = $('#friends_all_nav'); // navi

    // Friend
    elms_map.friend = {};
    elms_map.friend.block = $('#friend_block'); // block
    elms_map.friend.name = $('#friend_name'); // user name  
    elms_map.friend.gifts_block = $('#friend_gifts_all'); // gifts block
    elms_map.friend.gifts_list = $('#friend_gift_list'); // gifts list
    elms_map.friend.no_gifts = $('#friend_gifts_none'); // no gifts attention 
    elms_map.friend.gifts_nav = $('#friend_gifts_nav'); // navi
    elms_map.friend.make_gift_btn = $('#friend_make_gift'); // button: make gift
    elms_map.friend.no_gifts_text = $('#friend_gifts_none_text'); // text: he hasn't gifts
    elms_map.friend.title = $('#friend_title'); // her/his gifts
    elms_map.friend.button = {};
    elms_map.friend.button.send_gift = $('#friend_send_gift'); // button: send gift
    
    // Holidays
    elms_map.holidays = {};
    elms_map.holidays.block = $('#holidays'); // block
    elms_map.holidays.list = $('#holidays_list'); // list 
    elms_map.holidays.bday_pfx = 'bdays_'; // bday elements prefix
    elms_map.holidays.bday_list_pfx = 'bdays_list_'; // bday list prefix
    elms_map.holidays.hlist_pfx = 'hlist_'; // holidays elements list prefix
    elms_map.holidays.date_no_holiday = 'date_no_hday_'; // no holidays in date element prefix 
    elms_map.holidays.date_bdays = 'date_bdays_'; // bdays in date element prefix 
    elms_map.holidays.date_bdays_list = 'date_bdays_list_'; // bdays list in date element prefix 

    // Attention
    elms_map.attention_top = {};
    elms_map.attention_top.block = $('#attention_heart_top'); // block

    // Hearts 
    elms_map.hearts = {};
    elms_map.hearts.block = $('#heart_promo'); // block
    elms_map.hearts.text_ok = $('#hearts_text_ok'); // text without limit 
    elms_map.hearts.text_limit = $('#hearts_text_limit'); // text with limit 
    elms_map.hearts.text_limit_interval = $('#hearts_limit_interval'); // time limit 
    elms_map.hearts.send_button = $('#send_hearts_button'); // button 
    elms_map.hearts.count = $('#main_heart_count'); // counter

    // Friends Hearts Top
    elms_map.friends_hearts_top = {};
    elms_map.friends_hearts_top.block = $('#friends_hearts_top'); // block
    elms_map.friends_hearts_top.list = $('#friends_top_list'); // list 

    // Hearts Top
    elms_map.hearts_top = {};
    elms_map.hearts_top.block = $('#hearts_top'); // block
    elms_map.hearts_top.list = $('#hearts_top_list'); // list 
}

function initViews() {
    view_global.init(
        events,
        elms_map
    );

    view_my_gifts.init(
        events,
        elms_map
    );

    view_gifts_cat.init(
        events,
        elms_map
    );

    view_win.init(
        events,
        elms_map
    );

    view_friends_sel.init(
        events,
        elms_map
    );

    view_desc.init(
        events,
        elms_map
    );

    view_covers.init(
        events,
        elms_map
    );

    view_done.init(
        events,
        elms_map
    );

    view_friends.init(
        events,
        elms_map
    );

    view_friend.init(
        events,
        elms_map
    );

    view_holidays.init(
        events,
        elms_map
    );

    view_friends_hearts_top.init(
        events,
        elms_map
    );

    view_hearts_top.init(
        events,
        elms_map
    );
}
