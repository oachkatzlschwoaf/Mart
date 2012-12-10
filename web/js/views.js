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

            // API Listener
            mailru.events.listen(mailru.app.events.paymentDialogStatus, function(event) {
                this.ev.emitter.trigger('user_balance.update_force');
                $.fancybox.close();
            }.bind(this));

            mailru.events.listen(mailru.app.events.incomingPayment, function(event) {
                this.ev.emitter.trigger('user_balance.update_force');
                
                if (event.status == 'success') {
                    this.ev.emitter.trigger('purchase.try_again');
                }

                $.fancybox.close();
            });

            mailru.events.listen(mailru.common.events.guestbookPublish, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                    _kmq.push(['record', 'api publish guestbook']);
                }
            });

            mailru.events.listen(mailru.common.events.message.send, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                    _kmq.push(['record', 'api send message']);
                }
            });

            mailru.events.listen(mailru.common.events.message.send, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                    _kmq.push(['record', 'api send message']);
                }
            });

            mailru.events.listen(mailru.common.events.streamPublish, function(event) {
                if (event.status == 'publishSuccess') {
                    // stat
                    _kmq.push(['record', 'api publish stream']);
                }
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

        showWelcome: function() {
            this.map.welcome.fancybox({
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
                if (e.is_open == '0' || e.is_open == false) {
                    path = util.covers_path+'/'+e.cover_id+'.png';
                }

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

        fill: function(list, len) {
            this.map.friends_sel.friends.html('');

            $.each(list, function(i, e) {
                this.map.friends_sel.friends.append("<article><div class='photo'><a href='#' onclick='cntrl_purchase.setFriend(\""+e.uid+"\")'><img src='"+e.pic_128+"' width='120' height='120' alt=' '></a></div>"+e.name+"</article>");
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
            this.map.desc.for.text( p.friend.name );
            this.map.desc.for_ava.attr("src", p.friend.pic_50+"?"+d.getTime());

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
        },

        startLoading: function() {
            this.map.done.block.ok.hide();
            this.map.done.block.error.hide();
            this.map.done.loader.show();
        },

        finishLoading: function() {
            this.map.done.loader.hide();
        },

        showError: function(p) {
            d = new Date();

            this.map.done.error.ava.attr('src', p.friend.pic_190+"?"+d.getTime()); 
            this.map.done.error.for.text(p.friend.name); 
            this.map.done.error.gift.attr('src', util.thumbs_path+"/"+gift.id+".png");

            this.map.done.error.text.text(p.need + ' ' + declOfNum(p.need, ['монета', 'монеты', 'монет']));
            
            this.map.done.block.error.show();
        },

        showDone: function(p) {
            d = new Date();

            this.map.done.ok.ava.attr('src', p.friend.pic_190+"?"+d.getTime()); 
            this.map.done.ok.for.text(p.friend.name); 
            this.map.done.ok.gift.attr('src', util.thumbs_path+"/"+gift.id+".png");

            if (p.friend.sex == 1) {
                this.map.done.ok.text.text('она его скорее получила');
                this.map.done.ok.text2.text('Напишите ей об этом сообщение!');
            } else {
                this.map.done.ok.text.text('он его скорее получил');
                this.map.done.ok.text2.text('Напишите ему об этом сообщение!');
            }

            this.map.done.block.ok.show();
        },

        postGuestbook: function(p) {
            mailru.common.guestbook.post({
               'uid': p.purchase.friend_selected,
               'title': 'У меня для тебя подарок', 
               'text': 'Тебе подарок! Посмотри скорее! '+p.purchase.text,
               'img_url': util.abs_path + util.images_path+"/"+p.purchase.gift_selected+".png"
            }); 
        },

        sendMessage: function(p) {
            mailru.common.messages.send({
                'uid': p.purchase.friend_selected,
                'text': 'Тебе подарок! Посмотри скорее! '+p.purchase.text
            });
        },

        postStream: function(p) {
            mailru.common.stream.post({
                'title': 'Сделал подарок для ' + p.friend.name,
                'text': 'Это тебе! '+p.purchase.text,
                'img_url': util.abs_path + util.images_path+"/"+p.purchase.gift_selected+".png",
                'action_links': [
                    {'text': 'Посмотреть', 'href': 'show'},
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

            this.map.friend.name.text(friend.info.name);
            this.map.friend.block.show();     

            if (friend.info.sex == 1) {
                this.map.friend.no_gifts_text.text('У неё еще нет подарков, сделайте первый подарок!');
            } else {
                this.map.friend.no_gifts_text.text('У него еще нет подарков, сделайте первый подарок!');
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
                if (!e.is_open) {
                    path = util.covers_path+'/'+e.cover_id+'.png';
                }

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
    elms_map.friend.button = {};
    elms_map.friend.button.send_gift = $('#friend_send_gift'); // button: send gift

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
}
