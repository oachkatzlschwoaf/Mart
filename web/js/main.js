var purchase      = { };
var view          = { };
var user          = { };
var friend        = { };
var gifts         = { };
var gifts_catalog = { };

var my_gifts      = { };

var util = {
    api_url: { },
};

function main_init() {

    // Friend
    friend = {
        friend_gifts: {
            'open': new Array(),
            'newest': new Array()
        },

        emitter: $(document),

        select: function(id, friends) {
            f = friends[id];
            this.emitter.trigger('friend.select', f);
        },

        getGifts: function(uid) {
            dfd = $.Deferred();

            $.getJSON(util.api_url.my_gifts, 
                { 'uid': uid }, 
                function(data) {
                    dfd.resolve(data);
                }.bind(this)
            );

            return dfd.promise();
        }
    };

    // Gifts Catalog
    gifts_catalog = {
        emitter: $(document),

        gifts: new Array(),

        setCategory: function(id) {
            dfd = $.Deferred();
            this.prev_cat_id = this.cat_id;
            this.cat_id = id;

            this.emitter.trigger('show_block_loader', this);

            this.getGiftsByCategory(this.cat_id, 'popularity').done(function(gifts) {
                this.emitter.trigger('hide_block_loader');
                this.emitter.trigger('gift_catalog.set_category', this);
                dfd.resolve(this);
            }.bind(this));

            return dfd.promise();
        },

        getGiftsByCategory: function(id, sort) {
            dfd = $.Deferred();

            $.getJSON(util.api_url.category_gifts, { 
                cid:     id, 
                ext:     1,
                sort_by: sort
            }, function(data) {
                this.gifts = data;
                dfd.resolve(this.gifts);
            }.bind(this));

            return dfd.promise();
        },

        sortGifts: function(sort) {
            this.emitter.trigger('show_block_loader');

            this.getGiftsByCategory(this.cat_id, sort).done(function(gifts) {
                this.emitter.trigger('hide_block_loader');
                this.emitter.trigger('gift_catalog.sort_gifts', { 'gifts': gifts, 'sort': sort });
            }.bind(this));

            return false;
        },

    };

    // Gifts My
    gifts.my = {
        emitter: $(document),

        open:    new Array(),
        newest:  new Array(),

        // Methods
        init: function (view) {
            // Choose Friend
            view.emitter.on('view.open_gift', function (e, input) { 
                this.openGift(input);
            }.bind(this));
        },

        clear: function() {
            this.open   = new Array();
            this.newest = new Array();
        },

        getList: function() {
            dfd = $.Deferred();

            if (this.open.length == 0 || this.newest.length == 0) {
                $.getJSON(util.api_url.my_gifts, function(data) {
                    $.each(data, function(k, v) {
                        if (v.is_open) {
                            this.open.push(v);
                        } else {
                            this.newest.push(v);
                        }
                    }.bind(this));

                    dfd.resolve(this);
                }.bind(this));
            } else {
                dfd.resolve(this);
            }

            return dfd.promise();
        },

        openGift: function(id) {
            $.post(util.api_url.open_gift, {
                    ugid: id,
                },
                function(data) { 
                    if (data.first_time) {
                        _kmq.push(['record', 'open new gift']);
                    }
                },
                "json"
            );
        }
    };

    // Purchase
    purchase = {
        emitter: $(document),
        cost: 0,

        // Methods
        init: function (view) {
            // Choose Friend
            view.emitter.on('view.friend_choose', function (e, input) { 
                this.setFriend(input);
            }.bind(this));

            // Choose Description
            view.emitter.on('view.desc_choose', function (e, input) { 
                this.setDescription(input);
            }.bind(this));
        },

        clear: function() {
            delete this.friend_selected;
            delete this.receiver;
            delete this.gift_selected;
            delete this.text;
            delete this.privacy;
            delete this.incognito;
            delete this.cover;
            delete this.need;
            delete this.error_balance;
        },

        setGift: function (gid, premium) {
            this.gift_selected = gid;

            if (typeof(premium) === 'undefined' || premium == 0) {
                this.cost += util.price.gift;
            } else if (premium > 0) {
                this.cost += util.price.gift_premium;
            }

            _kmq.push(['record', 'set gift']);

            this.emitter.trigger('purchase.gift_selected', this);
        },

        setFriend: function (u) {
            this.friend_selected = u;

            _kmq.push(['record', 'set friend']);

            this.emitter.trigger('purchase.friend_selected', this);
        },

        setDescription: function(p) {
            this.privacy = p.privacy;
            this.incognito = p.incognito;
            this.text = p.text;

            if (this.privacy == 1) {
                this.cost += util.price.private;
            }

            if (this.incognito == 1) {
                this.cost += util.price.incognito;
            }

            _kmq.push(['record', 'set description']);

            this.emitter.trigger('purchase.desc_selected', this);
        },

        setCover: function (cvid, cvcost) {
            this.cover_selected = cvid;
            this.cost += cvcost;

            _kmq.push(['record', 'set cover']);

            this.emitter.trigger('purchase.cover_selected', this);
        },


        process: function() {
            this.emitter.trigger('show_send_loader', this);

            _kmq.push(['record', 'process purchase', { 
                'gift':      this.gift_selected,
                'privacy':   this.privacy,
                'incognito': this.incognito,
                'cover':     this.cover_selected,
            }]);

            $.post(util.api_url.purchase, {
                    gift:      this.gift_selected,
                    receiver:  this.friend_selected.uid,
                    text:      this.text,
                    privacy:   this.privacy,
                    incognito: this.incognito,
                    cover:     this.cover_selected
                },

                function(data) {

                    this.emitter.trigger('hide_send_loader', this);

                    if (data.done == 'gift sended') {
                        _kmq.push(['record', 'finish purchase', { 'result': 'done' }]);
                        this.emitter.trigger('purchase.done', this);

                        _kmq.push(['record', 'send gift']);

                        // Send notify
                        $.post(util.api_url.send_notify, {
                                uid:     this.friend_selected.uid,
                                text_id: 1, // Text: you received gift
                            },
                            function(data) { },
                            "json"
                        );

                    } else if (data.balance_error == 'need more money') {
                        _kmq.push(['record', 'finish purchase', { 'result': 'need_money' }]);

                        this.need = data.need;
                        this.error_balance = 1;
                        this.emitter.trigger('purchase.error_balance', this);
                    }
                }.bind(this),
                "json"
            );
        },
        
        postGuestbook: function() {
            mailru.common.guestbook.post({
               'uid': this.friend_selected.uid,
               'title': 'У меня для тебя подарок', 
               'text': 'Тебе подарок! Посмотри скорее! '+this.text,
               'img_url': util.abs_path + util.images_path+"/"+purchase.gift_selected+".png"
            }); 
        },

        sendMessage: function() {
            mailru.common.messages.send({
                'uid': this.friend_selected.uid,
                'text': 'Тебе подарок! Посмотри скорее! '+this.text
            });
        },

        postStream: function() {
            mailru.common.stream.post({
                'title': 'Сделал подарок для ' + purchase.friend_selected.name,
                'text': 'Это тебе! '+this.text,
                'img_url': util.abs_path + util.images_path+"/"+purchase.gift_selected+".png",
                'action_links': [
                    {'text': 'Посмотреть', 'href': 'show'},
                ]
            });
        },

        inviteFriends: function() {
            mailru.app.friends.invite();
        }
    }

    // User
    user = {
        friends: new Array(), 
        api: util.api_url,
        emitter: $(document),
        balance: util.user_start_balance,

        // Methods
        getFriends: function () {
            dfd = $.Deferred();

            if (this.friends.length == 0) {
                $.getJSON(this.api.friends_get, function(data) {
                    $.each(data, function() {
                        name = htmlEncode(this.first_name + " " + this.last_name);
                        
                        if (name.length === 1) {
                            name = this.nick;
                        }

                        this.name = name;
                    });

                    this.friends = data;
                    dfd.resolve(data);
                }.bind(this));
            } else {
                dfd.resolve(this.friends);
            }

            return dfd.promise();
        },

        searchFriend: function(query) {
            serp = new Array();

            $.each(this.friends, function(k, v) {
                if (v.nick.toLowerCase().indexOf(query) >= 0) {
                    serp.push(v);
                } else if (v.first_name.toLowerCase().indexOf(query) >= 0) { 
                    serp.push(v);
                } else if (v.last_name.toLowerCase().indexOf(query) >= 0) {
                    serp.push(v);
                } else if (v.link.toLowerCase().indexOf(query) >= 0) {
                    serp.push(v);
                }

                /*
                if ( v.nick.match(query, 'i') ) {
                    serp.push(v);
                } else if ( v.first_name.match(query, 'i') ) {
                    serp.push(v);
                } else if ( v.last_name.match(query, 'i') ) {
                    serp.push(v);
                } else if ( v.link.match(query, 'i') ) {
                    serp.push(v);
                }
                */
            });

            this.emitter.trigger('user.search_friend', { 'result' : serp });
        },

        updateBalance: function() {
            this.balance = this.balance + this.amount; 

            this.emitter.trigger('user.update_balance', this.balance);
        },
    };

    // Views 
    view = {
        nav_buttons: {
            'index':   $('#nav_index'),
            'friends': $('#nav_friends')
        },

        selectMenu: function(mnu) {
            elements = $('.gft_mnu');
            elements.each( function() { 
                $(this).removeClass('active'); 
            });

            this.nav_buttons[mnu].addClass('active');
        },

        hideBlocks: function() {
            $('.gft_block').each( function() { 
                $(this).hide(); 
            });

            $('.gft_loader').each( function() { 
                $(this).hide(); 
            });
        },

        showPaymentDialog: function(sid, sname, mailiki, money, bonus, u) {
            u.amount = money + bonus;
            u.money = mailiki;

            mailru.app.payments.showDialog({
                service_id: sid,
                service_name: sname,
                mailiki_price: mailiki 
            });
        }
    };

    // Page: friends
    view.friends = {
        emitter:           $(document),

        container:         $('#friends_all_block'),
        loader:            $('#friends_all_loader'),

        friends_list:      $('#friends_all'),
        friends_search:    $('#friend_all_query'),
        friends_to_show:   15,

        friend_container:   $('#friend_block'),
        friend_name:        $('#friend_name'),
        friend_ava:         $('#friend_ava'),
        friend_bday_block:  $('#friend_bday_block'),
        friend_bday:        $('#friend_bday'),
        friend_title:       $('#friend_title'),

        friend_gift_list:      $('#friend_gift_list'),
        friend_gift_loader:    $('#friend_gifts_loader'),
        friend_gift_container: $('#friend_gifts'),
        friend_gift_nav:       $('#friend_gifts_nav'),
        friend_gift_none:      $('#friend_gifts_none'),
        friend_gift_all:       $('#friend_gifts_all'),
        friend_gift_none_text: $('#friend_gifts_none_text'),
        friend_gift_answer:    $('#friend_gifts_answer'),
        
        count: 4, 

        // Methods
        init: function (v, u, f, p) {
            // Friends search
            u.emitter.on('user.search_friend', function (e, input) { 
                this.pos = 0;
                this.users = input.result;
                this.scrollFriends();
            }.bind(this));

            // Select Friend
            u.emitter.on('friend.select', function (e, input) { 
                this.showFriendPage(v, input, f, p);
            }.bind(this));

            // Handlers
            this.friends_search.focus(function() {
                $(this).val('');
            });

            this.friends_search.keypress(function() {
                var query = this.friends_search.val();  
                u.searchFriend(query);
            }.bind(this));

        },

        showFriendPage: function(v, f_info, f, p) {
            v.hideBlocks();

            d = new Date();

            this.friend_name.text(f_info.name);
            this.friend_ava.attr('src', f_info.pic_190 + '?' + d.getTime())

            if (f_info.birthday.length > 1) {
                this.friend_bday_block.show();
                this.friend_bday.text(f_info.birthday);
            } else {
                this.friend_bday_block.hide();
            }

            if (f_info.sex == 1) {
                this.friend_title.text('Её подарки');
                this.friend_gift_none_text.text('У неё еще нет подарков, сделайте подарок первым!');
            } else {
                this.friend_title.text('Его подарки');
                this.friend_gift_none_text.text('У него еще нет подарков, сделайте подарок первым!');
            }

            this.friend_gift_answer.click(function() {
                p.setFriend(f_info);
            }.bind(this));

            this.friend_gift_container.hide();
            this.friend_gift_loader.show();

            f.getGifts(f_info.uid).done(function(gs) {
                this.gifts = $.grep(gs, function(v, i) {
                    if (v.privacy == 1 && v.user_id != util.user_id) {
                        return false;
                    } else {
                        return true;
                    }
                });

                this.pos = 0;

                this.friend_gift_none.hide();
                this.friend_gift_all.show();

                if (this.gifts.length == 0) {
                    this.friend_gift_none.show();
                    this.friend_gift_all.hide();
                } else if (this.gifts.length <= this.count) {
                    this.friend_gift_nav.hide(); 
                } else {
                    this.friend_gift_nav.show(); 
                }

                this.scrollGifts();

                this.friend_gift_loader.hide();
                this.friend_gift_container.show();
            }.bind(this));

            this.friend_container.show();

            _kmq.push(['record', 'view friend page']);
        },

        scrollGifts: function(direction) {
            if (direction == 'forward') {
                this.pos += this.count;

                if (this.pos > (this.gifts.length - 1)) {
                    this.pos = 0;
                }
            } else if (direction == 'back') {
                this.pos -= this.count;

                if (this.pos < 0) { 
                    this.pos = Math.floor((this.gifts.length - 1) / this.count) 
                        * this.count;
                }
            }

            pos       = this.pos;
            cnt       = this.count; 
            gifts     = this.gifts;
            container = this.friend_gift_list;

            container.html('');

            for (i = pos; i < (pos + cnt); i++) {
                var v = gifts[i];

                if (typeof(v) === 'object') {
                    var path = util.thumbs_path+'/'+v.gift_id+'.png';

                    user_name = v.user_name;
                    if (v.incognito) {
                        user_name = 'Инкогнито';
                    }

                    if (!v.is_open) {
                        path = util.covers_path+'/'+v.cover_id+'.png';
                    }

                    container.append(
                        "<article><img src='"+path+"' width='90' height='90' alt=''><div class='descr'><img src='"+path+" 'width='90' height='90' alt=''>"+user_name+"<div class='grey'>"+v.created_date+"</div></div></article>"
                    );    

                }
            }

            return false;
        },

        showFriendsPage: function(v, p, g, u) {
            v.hideBlocks();

            g.clear();
            p.clear();
            v.my_gifts.clear();

            this.loader.show();

            v.selectMenu('friends');

            u.getFriends().done(function(friends) {
                this.users = friends;
                this.pos = 0;

                this.scrollFriends();

                this.loader.hide();
                this.container.show();

                _kmq.push(['record', 'view friends page']);
            }.bind(this));
        },

        scrollFriends: function(direction) {
            if (direction == 'forward') {
                this.pos += this.friends_to_show;

                if (this.pos > (this.users.length - 1)) {
                    this.pos = 0;
                }
            } else if (direction == 'back') {
                this.pos -= this.friends_to_show;

                if (this.pos < 0) {
                    this.pos = 
                        Math.floor((this.users.length - 1) / this.friends_to_show) * this.friends_to_show;
                }
            }

            cnt = this.friends_to_show;
            pos = this.pos;

            this.friends_list.html("");

            for (i = pos; i < (pos + cnt); i++) {
                var v = this.users[i];

                if (typeof(v) === 'object') {
                    this.friends_list.append(
                        "<article><div class='photo'><a href='#' onclick='friend.select(\""+i+"\",view.friends.users)'><img src='"+v.pic_128+"' width='120' height='120' alt=' '></a></div>"+v.name+"</article>"
                    );
                }
            }
        }
    };

    // Page: Gifts catalog
    view.gifts_catalog = {
        emitter:           $(document),

        cost:              $("#cost"),
        container:         $('#gifts_catalog'),

        loader:            $('#gifts_catalog_loader'),
        loader_block:      $('#gifts_block_loader'),

        gifts_container:   $('#gifts_block'),
        gifts_list:        $('#gifts_list'),
        gifts_navi:        $('#gifts_catalog_navi'),
        gifts_to_show:     util.show_gifts,

        friends_container: $('#friends_block'),
        friends_list:      $('#friends'),
        friends_search:    $('#friend_search_query'),
        friends_loader:    $('#friends_loader'),
        friends_to_show:   15,

        desc_container:    $('#description_block'),
        desc_gift:         $('#gift_show'),
        desc_gift_for:     $('#gift_for'),
        desc_gift_for_ava: $('#gift_for_ava'),
        desc_text:         $('#desc_text'),
        desc_is_private:   $('#is_private'),
        desc_incognito:    $('#incognito'),

        covers_container:  $('#covers_block'),

        done_container_ok: $('#done_ok'),
        done_ava:          $('#done_ava_for'),
        done_for:          $('#done_for'),
        done_gift:         $('#done_gift'),
        done_text:         $('#done_text'),
        done_text1:        $('#done_text1'),
        done_text2:        $('#done_text2'),

        done_container_error: $('#done_error'),
        error_ava:            $('#error_ava_for'),
        error_gift:           $('#error_gift'),
        error_text:           $('#error_text'),

        send_loader:       $('#send_loader'),

        user_balance:      $('#user_balance'),

        category_id:       'category_',
        sort_id:           'sort_',

        // Methods
        init: function (v, vmg, purchase, user, gc, mg, g) {
            // Set Gift
            purchase.emitter.on('purchase.gift_selected', function (e, input) { 
                this.container.hide();
                v.hideBlocks();

                if (typeof input.friend_selected === 'undefined') {
                    this.showFriendsSelector(user); 
                } else {
                    this.showDescriptionBlock(purchase);
                }

            }.bind(this));

            // Friends search
            user.emitter.on('user.search_friend', function (e, input) { 
                this.pos = 0;
                this.users = input.result;
                this.scrollFriends();
            }.bind(this));

            // Set Friend
            purchase.emitter.on('purchase.friend_selected', function (e, input) { 
                if (typeof input.gift_selected === 'undefined') {
                    // Gift not selected
                    v.hideBlocks();

                    this.loader.show();
                    gc.setCategory(util.default_gift_cat).done(function() {
                    }.bind(this));

                } else {
                    // Gifts selected
                    this.friends_container.hide();
                    this.showDescriptionBlock(purchase);
                }
            }.bind(this));

            // Set Description
            purchase.emitter.on('purchase.desc_selected', function (e, input) { 
                this.cost.text(input.cost);
                this.desc_container.hide();
                this.showCoverBlock();
            }.bind(this));

            // Set Cover 
            purchase.emitter.on('purchase.cover_selected', function (e, input) { 
                this.cost.text(input.cost);
                this.covers_container.hide();

                input.process();
            }.bind(this));

            // Show block loader 
            purchase.emitter.on('show_block_loader', function (e, input) { 
                this.gifts_list.hide();
                this.gifts_navi.hide();
                this.loader_block.show();
            }.bind(this));

            // Hide block loader 
            purchase.emitter.on('hide_block_loader', function (e, input) { 
                this.loader.hide();
                this.loader_block.hide();
                this.gifts_list.show();
            }.bind(this));

            // Show send loader 
            purchase.emitter.on('show_send_loader', function (e, input) { 
                this.done_container_ok.hide(); 
                this.done_container_error.hide(); 
                this.send_loader.show();
            }.bind(this));

            // Hide send loader 
            purchase.emitter.on('hide_send_loader', function (e, input) { 
                this.send_loader.hide();
            }.bind(this));

            // Update balance
            purchase.emitter.on('user.update_balance', function (e, balance) { 
                b = balance;
                this.user_balance.text( b + ' ' + declOfNum(b, ['монета', 'монеты', 'монет']) );
            }.bind(this));    

            // Purchase done 
            purchase.emitter.on('purchase.done', function (e, input) { 
                img_path = util.thumbs_path+"/"+input.gift_selected+".png";

                user.balance = user.balance - input.cost;
                b = user.balance;
                this.user_balance.text( b + ' ' + declOfNum(b, ['монета', 'монеты', 'монет']) );

                d = new Date();

                this.done_ava.attr('src', input.friend_selected.pic_190+"?"+d.getTime()); 
                this.done_for.text(input.friend_selected.name); 
                this.done_gift.attr('src', img_path);

                if (input.friend_selected.sex == 1) {
                    this.done_text.text('она его скорее получила');
                    this.done_text2.text('Напишите ей об этом сообщение!');
                } else {
                    this.done_text.text('он его скорее получил');
                    this.done_text2.text('Напишите ему об этом сообщение!');
                }

                this.done_container_ok.show();
            }.bind(this));

            // Purchase balance error 
            purchase.emitter.on('purchase.error_balance', function (e, input) { 
                img_path = util.thumbs_path+"/"+input.gift_selected+".png";

                d = new Date();

                this.error_ava.attr('src', input.friend_selected.pic_190+"?"+d.getTime()); 
                this.error_gift.attr('src', img_path);
                this.error_text.text(input.need + ' ' + declOfNum(input.need, ['монета', 'монеты', 'монет']));

                this.done_container_error.show();

            }.bind(this));

            // Set category 
            gc.emitter.on('gift_catalog.set_category', function (e, input) { 
                $("#"+this.category_id+input.cat_id).attr('class', 'active');
                $("#"+this.category_id+input.prev_cat_id).attr('class', '');

                $("#"+this.sort_id+'popularity').attr('class', 'active');
                $("#"+this.sort_id+'created_at').attr('class', '');

                this.gifts = input.gifts;
                this.gpos = 0;

                if (this.gifts.length <= this.gifts_to_show) {
                    this.gifts_navi.hide();
                } else {
                    this.gifts_navi.show();
                }

                this.scrollGifts();
                this.container.show();
        
            }.bind(this));

            // Sort gifts 
            gc.emitter.on('gift_catalog.sort_gifts', function (e, input) { 
                if (input.sort == 'popularity') {
                    $("#"+this.sort_id+'popularity').attr('class', 'active');
                    $("#"+this.sort_id+'created_at').attr('class', '');
                } else {
                    $("#"+this.sort_id+'created_at').attr('class', 'active');
                    $("#"+this.sort_id+'popularity').attr('class', '');
                }

                if (this.gifts.length <= this.gifts_to_show) {
                    this.gifts_navi.hide();
                } else {
                    this.gifts_navi.show();
                }

                this.gifts = input.gifts;
                this.gpos = 0;
                this.scrollGifts();
            }.bind(this));

            // Other handlers
            this.friends_search.focus(function() {
                this.friends_search.val('');
            }.bind(this));
        },

        showIndex: function(v, p, u, gc, g) {
            v.hideBlocks();

            g.clear();
            p.clear();
            v.my_gifts.clear();

            v.selectMenu('index');

            v.my_gifts.showGiftsBlock(g).done(function() {
                this.loader.show();
                gc.setCategory(util.default_gift_cat).done(function() {
                    _kmq.push(['record', 'view index', {
                        'ref': util.ref, 
                    }]);

                    // Preload friends
                    u.getFriends().done(function(friends) {

                        // pic_128, pic_50, pic_190 
                        imgs_to_load = {
                            'pic_128': [],
                            'pic_50':  [],
                            'pic_190': []
                        };

                        $.each(friends, function() {
                            imgs_to_load.pic_128.push( this.pic_128 );
                            imgs_to_load.pic_50.push( this.pic_50 );
                            imgs_to_load.pic_190.push( this.pic_190 );
                        });

                        preloadImages(imgs_to_load.pic_128); 
                        preloadImages(imgs_to_load.pic_50); 
                        preloadImages(imgs_to_load.pic_190); 
                    });
                }.bind(this));
            }.bind(this));
        },

        scrollGifts: function(direction) {
            if (direction == 'forward') {
                this.gpos += this.gifts_to_show;

                if (this.gpos > (this.gifts.length - 1)) {
                    this.gpos = 0;
                }
            } else if (direction == 'back') {
                this.gpos -= this.gifts_to_show;

                if (this.gpos < 0) {
                    this.gpos = 
                        Math.floor((this.gifts.length - 1) / this.gifts_to_show) * this.gifts_to_show;
                }
            }

            cnt = this.gifts_to_show;
            pos = this.gpos;

            this.gifts_list.html(''); 

            for (i = pos; i < (pos + cnt); i++) {
                var v = this.gifts[i];

                if (typeof(v) === 'object') {
                    img_path = util.thumbs_path+"/"+v.id+".png";

                    this.gifts_list.append("<article><a onclick='purchase.setGift("+v.id+", "+v.premium+")' href='#'><img src='"+img_path+"' width='90' height='90' alt=' '></a></article>");
                }
            }

            return false;
        },

        showFriendsSelector: function(u) {
            
           this.friends_loader.show();

            u.getFriends().done(function(friends) {
                this.users = friends;
                this.pos = 0;

                this.scrollFriends();

                this.friends_loader.hide();
                this.friends_container.show();
            }.bind(this));
        },

        scrollFriends: function(direction) {
            if (direction == 'forward') {
                this.pos += this.friends_to_show;

                if (this.pos > (this.users.length - 1)) {
                    this.pos = 0;
                }
            } else if (direction == 'back') {
                this.pos -= this.friends_to_show;

                if (this.pos < 0) {
                    this.pos = 
                        Math.floor((this.users.length - 1) / this.friends_to_show) * this.friends_to_show;
                }
            }

            cnt = this.friends_to_show;
            pos = this.pos;

            this.friends_list.html("");

            for (i = pos; i < (pos + cnt); i++) {
                var v = this.users[i];

                if (typeof(v) === 'object') {
                    this.friends_list.append(
                        "<article><div class='photo'><a href='#' onclick='view.gifts_catalog.chooseFriend(\""+i+"\")'><img src='"+v.pic_128+"' width='120' height='120' alt=' '></a></div>"+v.name+"</article>"
                    );
                }
            }
        },

        searchFriend: function() {
            var query = this.friends_search.val();  
            user.searchFriend(query);
        },

        showDescriptionBlock: function() {
            d = new Date();

            this.desc_gift.attr("src", util.images_path+"/"+purchase.gift_selected+".png");
            this.desc_gift_for.text( purchase.friend_selected.name );
            this.desc_gift_for_ava.attr("src", purchase.friend_selected.pic_50+"?"+d.getTime());

            this.desc_text.val("");
            this.desc_is_private.removeAttr("checked");
            this.desc_incognito.removeAttr("checked");

            this.desc_container.show();
        },

        chooseFriend: function(id) {
            var u = this.users[id];

            this.emitter.trigger('view.friend_choose', u);
        },

        chooseDescription: function() {
            var desc = {};

            desc.text = this.desc_text.val(); 
            
            desc.privacy = 0;
            if (this.desc_is_private.is(':checked')) {
                desc.privacy = 1;
            }

            desc.incognito = 0;
            if (this.desc_incognito.is(':checked')) {
                desc.incognito = 1;
            }
            
            this.emitter.trigger('view.desc_choose', desc);
        },

        showCoverBlock: function() {
            this.covers_container.show();
        },

        hide: function() {
            this.container.hide();
        }
    };

    // Part: My gifts
    view.my_gifts = {
        emitter:   $(document),

        container: $('#gifts_my_block'),
        
        gifts_container: {
            open:   $('#gifts_my'),
            newest: $('#gifts_my_new')
        },

        gifts_holder: {
            open:   $('#gifts_my_holder'),
            newest: $('#gifts_newest_holder')
        },

        gifts_navi: {
            open:   $('#open_navi'),
            newest: $('#newest_navi')
        },

        gift_img:      $("#show_gift_img"),
        gift_text:     $("#show_gift_text"),
        gift_from:     $("#show_gift_from"),
        gift_date:     $("#show_gift_date"),
        gift_avatar:   $("#show_gift_from_img"),
        gift_avatar_c: $("#show_gift_from_img_c"),
        gift_answer:   $("#answer_gift"),

        loader: $('#gifts_my_loader'),

        count: {
            open:   6,
            newest: 6,
        },

        pos: {
            open: 0,
            newest: 0
        },

        gifts: { },

        clear: function() {
            this.pos.open   = 0;
            this.pos.newest = 0;

            this.gifts_container.open.html('');
            this.gifts_container.newest.html('');
        },

        showGiftsBlock: function(g) {
            dfd = $.Deferred();

            this.loader.show();

            g.getList().done(function(list) {
                this.gifts.open   = list.open;
                this.gifts.newest = list.newest;

                // Open
                this.scrollGifts('open');

                if (this.gifts.open.length < 1) {
                    this.gifts_holder.open.hide();
                } else {
                    this.gifts_holder.open.show();
                }
                
                if (this.gifts.open.length <= this.count.open) {
                    this.gifts_navi.open.hide();
                }

                // Newest
                this.scrollGifts('newest');

                if (this.gifts.newest.length < 1) {
                    this.gifts_holder.newest.hide();
                } else {
                    this.gifts_holder.newest.show();
                }

                if (this.gifts.newest.length <= this.count.newest) {
                    this.gifts_navi.newest.hide();
                }
                
                this.loader.hide();
                this.container.show();

                dfd.resolve(this);
            }.bind(this));

            return dfd.promise();
        },

        scrollGifts: function(type, direction) {
            if (direction == 'forward') {
                this.pos[type] += this.count[type];

                if (this.pos[type] > (this.gifts[type].length - 1)) {
                    this.pos[type] = 0;
                }
            } else if (direction == 'back') {
                this.pos[type] -= this.count[type];


                if (this.pos[type] < 0) {
                    this.pos[type] = Math.floor((this.gifts[type].length - 1) / this.count[type]) 
                        * this.count[type];
                }
            }

            pos       = this.pos[type];
            cnt       = this.count[type]; 
            container = this.gifts_container[type];
            gifts     = this.gifts[type];

            container.html("");

            for (i = pos; i < (pos + cnt); i++) {
                var v = gifts[i];

                if (typeof(v) === 'object') {
                    var path = util.thumbs_path+'/'+v.gift_id+'.png';
                    if (type == 'newest') {
                        path = util.covers_path+'/'+v.cover_id+'.png';
                    }

                    user_name = v.user_name;
                    if (v.incognito) {
                        user_name = 'Инкогнито';
                    }

                    container.append(
                        "<article><img src='"+path+"' width='90' height='90' alt=''><div class='descr'><a onclick='view.my_gifts.showGift("+i+", \""+type+"\", user, purchase)' href='#data' class='inline'><img src='"+path+"' width='90' height='90' alt=' '></a>"+user_name+"<div class='grey'>"+v.created_date+"</div></div></article>"
                    );    
                }
            }

            // Show dialog
            $(".inline").fancybox({
                'overlayColor': '#fff'
            });

            return false;
        },

        showGift: function(id, type, u, p) {
            // Customize dialog
            gift        = this.gifts[type][id]; 
            avatar_path = 'http://avt.appsmail.ru/'+gift.user_box+'/'+gift.user_login+'/_avatarsmall';

            this.gift_img.attr("src", 
                util.images_path+"/"+gift.gift_id+".png");
            this.gift_text.text(gift.text);
            this.gift_date.text(gift.created_date);

            if (gift.incognito) {
                this.gift_from.text('Инкогнито');
                this.gift_avatar_c.hide();
                this.gift_answer.hide();
            } else {
                this.gift_from.text(gift.user_name);
                this.gift_avatar.attr("src", avatar_path);
                this.gift_avatar_c.show();
                this.gift_answer.show();
            }

            this.gift_answer.click(function() {
                u.getFriends().done(function(friends) {

                    $.each(friends, function(i, f) {
                        link = 'http://my.mail.ru/' + gift.user_box + '/' + gift.user_login + '/';
                        if (f.link == link) {
                            p.setFriend(f);
                        }
                    });

                    this.gift_answer.off('click');

                    $.fancybox.close();
                }.bind(this));
            }.bind(this));

            if (type == 'newest') {
                this.emitter.trigger('view.open_gift', gift.id);
            }
        },

        hide: function() {
            this.container.hide();
        }
    };

    // Main init
    $.ajaxSetup({ cache: false });

    // Init views
    purchase.init(view.gifts_catalog);
    gifts.my.init(view.my_gifts);

    my_gifts = gifts.my;

    view.gifts_catalog.init(view, view.my_gifts, purchase, user, gifts_catalog, my_gifts, gifts);

    view.friends.init(view, user, friend, purchase);

    // Start work
    view.gifts_catalog.showIndex(view, purchase, user, gifts_catalog, my_gifts);

    // Welcome
    if (util.is_install > 0) {
        $("#welcome").fancybox({
            'overlayColor': '#fff'
        }).trigger('click');
    }

    // Other handlers & listeners
    mailru.events.listen(mailru.app.events.paymentDialogStatus, function(event) {
        $.fancybox.close();
    });

    mailru.events.listen(mailru.app.events.incomingPayment, function(event) {
        
        if (event.status == 'success') {
            user.updateBalance();

            if (purchase.error_balance == 1) {
                purchase.process();
            }
        }

        $.fancybox.close();
    });

    mailru.events.listen(mailru.common.events.guestbookPublish, function(event) {
        if (event.status == 'publishSuccess') {
            _kmq.push(['record', 'api publish guestbook']);
        }
    });

    mailru.events.listen(mailru.common.events.message.send, function(event) {
        if (event.status == 'publishSuccess') {
            _kmq.push(['record', 'api send message']);
        }
    });

    mailru.events.listen(mailru.common.events.message.send, function(event) {
        if (event.status == 'publishSuccess') {
            _kmq.push(['record', 'api send message']);
        }
    });

    mailru.events.listen(mailru.common.events.streamPublish, function(event) {
        if (event.status == 'publishSuccess') {
            _kmq.push(['record', 'api publish stream']);
        }
    });
}

// MAIN

$(document).ready(function() {

    mailru.loader.require('api', function() {
        mailru.app.init(util.private);

        // MAIN INIT
        main_init();
    });
});

// Util 

function htmlEncode(value){
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

function declOfNum(number, titles)  {  
    cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}  

function preloadImages(aoi) {
    $(aoi).each(function(){
        $('<img/>')[0].src = this;
    });
}
