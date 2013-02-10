// Definition
var cntrl_index       = {};
var cntrl_purchase    = {};
var cntrl_friends_sel = {};
var cntrl_desc        = {};
var cntrl_covers      = {};
var cntrl_friends     = {};
var cntrl_friend      = {};
var cntrl_heart       = {};

// Functions
function loadControllers() {

    // Index 
    // ======================================================
    cntrl_index = { 
        init: function(ev, v_global, v_mygifts, v_gifts_cat, mdl_user, mdl_gifts_cat) {
            this.v_global    = v_global;
            this.v_mygifts   = v_mygifts;
            this.v_gifts_cat = v_gifts_cat;

            this.mdl_user     = mdl_user;
            this.mdl_gifts_cat = mdl_gifts_cat;

            this.ev = ev;

            this.slide_params = {
                my_gifts: {
                    pos:   0,
                    count: util.show_gifts_my, 
                },
                gift_cat: {
                    pos:   0,
                    count: util.show_gifts, 
                }
            };

            this.gifts_cat_params = {
                sort: 'popularity',
                cat: util.default_gift_cat
            }

            // Listener 
            ev.emitter.on('gifts_catalog.show', function (e, input) { 
                this.showGiftsCatalog();
            }.bind(this));

            ev.emitter.on('user_balance.update_force', function (e, input) { 
                this.updateBalance();
            }.bind(this));

            ev.emitter.on('circle.refresh', function (e, input) { 
                this.showCircle();
            }.bind(this));
        },

        // General 
        // ----------------------------------------- 

        checkHash: function() {
            mailru.app.utils.hash.read();
        },

        show: function() {
            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // clean
            cntrl_purchase.purge();
            cntrl_heart.purge();

            // show avatar
            this.v_global.showAvatar(
                this.mdl_user.getAvatar(180)
            );

            this.v_global.updateHearts(util.user_hearts);  

            // set menu
            this.ev.emitter.trigger('menu.select', 'index');

            // update balance
            this.ev.emitter.trigger('user_balance.update', this.mdl_user.balance);

            // show "My gifts" block
            this.scrollMyGifts().done(function() {
                
                // show friends top
                this.showFriendsHeartsTop().done(function() {

                    // show global top
                    this.showHeartsTop().done(function() {

                        // show circle
                        this.showCircle().done(function() {
                            // show catalog
                            this.setCatalogCategory(util.default_gift_cat).done(function() {
                                this.ev.emitter.trigger('block_gifts_cat.show');
                                this.ev.emitter.trigger('attention_top.show');
                                this.ev.emitter.trigger('hearts_promo.show');

                                this.ev.emitter.trigger('hearts_limit.check');

                                this.ev.emitter.trigger('loading.finish');
                                this.ev.emitter.trigger('page.show', 'index');

                                // preload friends
                                this.mdl_user.getFriends().done(function(input) {
                                }.bind(this));
                            }.bind(this));
                        }.bind(this));

                    }.bind(this));

                }.bind(this));

            }.bind(this));

        },

        showFriendsHeartsTop: function() {
            dfd = $.Deferred();

            this.ev.emitter.trigger('friends_hearts_top.hide');

            $.getJSON(util.api_url.friends_hearts_top, function(data) {
                this.ev.emitter.trigger('friends_hearts_top.show', data);
                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        showHeartsTop: function() {
            dfd = $.Deferred();

            this.ev.emitter.trigger('hearts_top.hide');

            $.getJSON(util.api_url.hearts_top, function(data) {
                this.ev.emitter.trigger('hearts_top.show', data);
                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        addInCircle: function() {
            dfd = $.Deferred();

            this.ev.emitter.trigger('circle.show_loader');

            $.post(util.api_url.add_circle,
                function(data) { 

                    this.ev.emitter.trigger('circle.hide_loader');

                    if (data.done == 'added') {
                        this.ev.emitter.trigger('circle.refresh');
                        this.mdl_user.balance = data.balance;
                        this.ev.emitter.trigger('user_balance.update', data.balance);
                    } else {
                        this.ev.emitter.trigger('circle.show_error', data);
                    }

                    dfd.resolve();
                }.bind(this),
                "json"
            );

            return dfd.promise();
        },

        showCircle: function() {
            dfd = $.Deferred();

            $.getJSON(util.api_url.circle, function(data) {
                this.ev.emitter.trigger('circle.show', {'users': data});
                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        showHolidays: function() {
            dfd = $.Deferred();

            this.ev.emitter.trigger('holidays.hide');

            this.mdl_user.getHolidays().done(function(input) {
                this.ev.emitter.trigger('holidays.fill', input);
                this.ev.emitter.trigger('holidays.show');

                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        showGiftsCatalog: function() {
            this.ev.emitter.trigger('block_mygifts.hide');
            this.ev.emitter.trigger('holidays.hide');
            this.ev.emitter.trigger('attention_top.hide');
            this.ev.emitter.trigger('hearts_promo.hide');
            this.ev.emitter.trigger('friends_hearts_top.hide');
            this.ev.emitter.trigger('hearts_top.hide');
            this.ev.emitter.trigger('circle.hide');

            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // show "My gifts" block
            this.setCatalogCategory(util.default_gift_cat).done(function() {
                this.ev.emitter.trigger('block_gifts_cat.show');
                this.ev.emitter.trigger('loading.finish');
                this.ev.emitter.trigger('page.show', 'index');
            }.bind(this));
        },

        showPaymentWindow: function(id) {
            p = util.bconfig[id];

            mailru.app.payments.showDialog({
                service_id: p.id,
                service_name: p.name,
                mailiki_price: p.mailiki 
            });
        },

        updateBalance: function() {
            this.mdl_user.getBalance().done(function(input) {
                this.ev.emitter.trigger('user_balance.update', input);
            }.bind(this));
        },

        // My gifts 
        // ----------------------------------------- 

        scrollMyGifts: function(direction) {
            dfd = $.Deferred();

            this.mdl_user.getGifts().done(function(input) {
                if (input.length > 0) {
                    this.ev.emitter.trigger('block_mygifts.show');

                    scroll(
                        this.slide_params.my_gifts, 
                        input, 
                        direction, 
                        this.v_mygifts.fill.bind( this.v_mygifts )
                    );

                } else {
                    this.ev.emitter.trigger('block_mygifts.hide');
                }

                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        // Gift window
        // ----------------------------------------- 

        showGift: function(gift_id) {
            gift = this.mdl_user.gifts[gift_id]; 

            if (gift.is_open == 'false' || gift.is_open == 0) {
                $.post(util.api_url.open_gift, {
                        ugid: gift.id,
                    },
                    function(data) { 
                        if (data.first_time) {
                            // stat
                        }
                    },
                    "json"
                );
            }

            img_path = util.images_path+"/"+gift.gift_id+".png"

            data = {
                'img':      img_path,
                'text':     gift.text,
                'date':     gift.created_date,
                'incog':    gift.incognito,
                'avatar':   util.avatar_host+gift.user_box+'/'+gift.user_login+'/_avatarsmall',
                'from_id':  gift.user_id
            };

            if (gift.incognito) {
                data.from = 'Инкогнито';
            } else {
                data.from = gift.user_name; 
            }

            this.ev.emitter.trigger('win.gift.show', data);
        },

        // Gift catalog 
        // ----------------------------------------- 

        scrollGiftsCat: function(direction) {
            dfd = $.Deferred();

            this.mdl_gifts_cat.getGifts(this.gifts_cat_params.sort, this.gifts_cat_params.cat).done(function(input) {
                scroll(
                    this.slide_params.gift_cat, 
                    input, 
                    direction, 
                    this.v_gifts_cat.fill.bind(this.v_gifts_cat)
                );

                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        setCatalogCategory: function(cid) {
            this.ev.emitter.trigger('gift_cat.set_category', cid);

            this.slide_params.gift_cat.pos = 0; 
            this.gifts_cat_params.cat  = cid;

            dfd = $.Deferred();
            this.setCatalogSort('popularity').done(function(input) {
                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        setCatalogSort: function(sort) {
            this.ev.emitter.trigger('gift_cat.set_sort', sort);

            this.slide_params.gift_cat.pos = 0; 
            this.gifts_cat_params.sort = sort;

            dfd = $.Deferred();
            this.scrollGiftsCat('').done(function(input) {
                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        // API Call
        pleaseHearts: function() {
            this.ev.emitter.trigger('index.pleaseHearts');
        },

    };

    // Heart 
    // ======================================================
    cntrl_heart = {
        init: function(ev, mdl_user, mdl_friend) {
            this.ev = ev;
            this.mdl_user = mdl_user;
            this.mdl_friend = mdl_friend;

            // Listener 
            ev.emitter.on('heart.process', function (e, input) { 
                this.process();
            }.bind(this));

            ev.emitter.on('heart.try_again', function (e, input) { 
                if (this.error_money == 1) {
                    this.process();
                }
            }.bind(this));
        },

        purge: function() {
            delete this.friend_id;
            delete this.error_money;
        },

        set: function() {
            this.ev.emitter.trigger('friends_selector.show', { 'content': 'hearts' });
        },

        setFriend: function(friend_id) {
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            this.friend_id = friend_id;       
            this.mdl_friend.lookup(this.friend_id).done(function() {
                this.ev.emitter.trigger('loading.finish');
                this.ev.emitter.trigger('heart.process');
            }.bind(this));

        },

        process: function() {
            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('send_done_block.load.start');
            this.ev.emitter.trigger('page.show', 'done');

            // process
            $.post(util.api_url.send_heart, {
                    receiver: this.friend_id 
                },

                function(data) {
                    this.ev.emitter.trigger('send_done_block.load.finish');
                    friend = this.mdl_friend.users[ this.friend_id ];

                    if (data.done == 'heart_sended') {
                        this.ev.emitter.trigger('send_heart_done_block.show', {
                            friend: friend
                        });

                        this.mdl_user.balance = data.balance;

                        this.ev.emitter.trigger('user_balance.update', data.balance);

                        // API Call
                        this.ev.emitter.trigger('send_done_block.request.sendHeart', { 'friend': friend });

                        if (data.free == 1) {
                            util.hearts_limit = new Date();
                            util.hearts_limit.setHours( util.hearts_limit.getHours() + util.heart_interval );
                        }

                        delete this.error_money;

                    } else if (data.balance_error == 'need more money') {
                        this.error_money = 1;
                        this.ev.emitter.trigger('send_heart_error_block.show', {
                            friend: friend,
                            need: data.need
                        });
                    } 
                }.bind(this),
                "json"
            );
        },

        sendMessage: function() {
            friend = this.mdl_friend.users[ this.friend_id ];
            this.ev.emitter.trigger('send_done_block.message.sendHeart', { 'friend': friend });
        },

        postGuestbook: function() {
            friend = this.mdl_friend.users[ this.friend_id ];
            this.ev.emitter.trigger('send_done_block.guestbook.postHeart', { 'friend': friend });
        }
    };

    // Purchase 
    // ======================================================
    cntrl_purchase = {
        init: function(ev, mdl_user, mdl_friend, mdl_gifts_cat) {
            this.ev = ev;
            this.mdl_user = mdl_user;
            this.mdl_friend = mdl_friend;
            this.mdl_gifts_cat = mdl_gifts_cat;

            // Listener 
            ev.emitter.on('description.complete', function (e, input) { 
                this.setDescription(input);
            }.bind(this));

            ev.emitter.on('purchase.try_again', function (e, input) { 
                if (this.error_money == 1) {
                    this.process();
                }
            }.bind(this));
        },

        purge: function() {
            delete this.friend_selected;
            delete this.gift_selected;
            delete this.text;
            delete this.incognito;
            delete this.privacy;
            delete this.cover;
            delete this.error_money;
        },

        setGift: function(gift_id) {
            this.gift_selected = gift_id;  

            if (typeof this.friend_selected != 'undefined') {
                gift = this.mdl_gifts_cat.gifts_all[ this.gift_selected ];
                friend = this.mdl_friend.users[ this.friend_selected ];

                this.ev.emitter.trigger('desc.show', {
                    gift: gift,
                    friend: friend
                });

            } else {
                this.ev.emitter.trigger('friends_selector.show');
            }
        },

        _set_friend: function(fid, type) {
            dfd = $.Deferred();
            if (!type || type == 'uid') {
                this.friend_selected = fid;  
                dfd.resolve();
            } else if (type == 'id') {
                $.post(util.api_url.get_uid, {
                        id: fid
                    },
                    function(data) {
                        if (data && data.uid) {
                            this.friend_selected = data.uid;
                            dfd.resolve();
                        }
                    }.bind(this),
                    "json"
                );
            }

            return dfd.promise();
        },

        setFriend: function(friend_id, type) {
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // get friend id
            this._set_friend(friend_id, type).done(function() {
                if (this.friend_selected) {
                    // friend init and get info about them
                    this.mdl_friend.lookup(this.friend_selected).done(function() {
                        this.ev.emitter.trigger('loading.finish');

                        if (typeof this.gift_selected != 'undefined') {
                            gift = this.mdl_gifts_cat.gifts_all[ this.gift_selected ];
                            friend = this.mdl_friend.users[ this.friend_selected ];

                            this.ev.emitter.trigger('desc.show', {
                                gift: gift,
                                friend: friend
                            });
                        } else {
                            this.ev.emitter.trigger('gifts_catalog.show');
                        }
                    }.bind(this));
                }
            }.bind(this));
        },

        setDescription: function(p) {
            this.text      = p.text;
            this.incognito = p.incognito;
            this.privacy   = p.privacy

            //this.ev.emitter.trigger('covers.show');
            this.process();
        },

        setCover: function(id) {
            this.cover = id;  

            this.process();
        },

        process: function() {
            // loading 
            this.ev.emitter.trigger('pages.hide');

            this.ev.emitter.trigger('send_done_block.load.start');

            this.ev.emitter.trigger('page.show', 'done');

            // process
            $.post(util.api_url.purchase, {
                    gift:      this.gift_selected,
                    receiver:  this.friend_selected,
                    text:      this.text,
                    privacy:   this.privacy,
                    incognito: this.incognito
                },

                function(data) {

                    this.ev.emitter.trigger('send_done_block.load.finish');
                    gift = this.mdl_gifts_cat.gifts_all[ this.gift_selected ];
                    friend = this.mdl_friend.users[ this.friend_selected ];

                    if (data.done == 'gift sended') {
                        this.ev.emitter.trigger('send_done_block.show', {
                            gift: gift,
                            friend: friend
                        });

                        this.mdl_user.balance = data.balance;

                        this.ev.emitter.trigger('user_balance.update', data.balance);

                        // API Call
                        this.ev.emitter.trigger('send_done_block.guestbook.post', { purchase: this });

                        delete this.error_money;

                    } else if (data.balance_error == 'need more money') {
                        this.error_money = 1;

                        this.ev.emitter.trigger('send_error_block.show', {
                            gift: gift,
                            friend: friend,
                            need: data.need
                        });

                    }
                }.bind(this),
                "json"
            );
        },

        postGuestbook: function() {
            this.ev.emitter.trigger('send_done_block.guestbook.post', {
                purchase: this
            });
        },

        sendMessage: function() {
            this.ev.emitter.trigger('send_done_block.message.send', {
                purchase: this
            });
        },

        sendRequest: function() {
            this.ev.emitter.trigger('send_done_block.request.send', { 
                purchase: this 
            });
        },

        postStream: function() {
            friend = this.mdl_friend.users[ this.friend_selected ];

            this.ev.emitter.trigger('send_done_block.stream.post', {
                purchase: this,
                friend: friend
            });
        },

        inviteFriends: function() {
            this.ev.emitter.trigger('send_done_block.friends.invite');
        }
    };

    // Friends Selector 
    // ======================================================
    cntrl_friends_sel = {
        init: function(ev, v_friends_sel, mdl_user) {
            this.ev = ev;

            this.v_friends_sel = v_friends_sel;

            this.mdl_user = mdl_user;


            this.slide_params = {
                pos:   0,
                count: util.show_friends,
            };

            // Listener 
            ev.emitter.on('friends_selector.show', function (e, input) { 
                this.show(input);
            }.bind(this));

            ev.emitter.on('friend.search', function (e, input) { 
                this.search(input);
            }.bind(this));
        },

        search: function(query) {
            x = this.mdl_user.searchFriend(query);

            this.slide_params.pos = 0;

            this.scrollFriends('').done(function() {
            }.bind(this));
        },

        show: function(params) {
            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // show friends selector
            this.mdl_user.clearActualFriends();

            // keep options
            this.options = params; 

            this.scrollFriends('').done(function() {
                this.ev.emitter.trigger('loading.finish');
                this.ev.emitter.trigger('page.show', 'friends_sel');
            }.bind(this));
        },

        scrollFriends: function(direction, params) {
            dfd = $.Deferred();

            this.mdl_user.getFriends().done(function(input) {
                scroll(
                    this.slide_params, 
                    input, 
                    direction, 
                    this.v_friends_sel.fill.bind( this.v_friends_sel ),
                    this.options
                );

                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        }
    };

    // Description 
    // ======================================================
    cntrl_desc = {
        init: function(ev) {
            this.ev = ev;

            // Listener 
            ev.emitter.on('desc.show', function (e, input) { 
                this.show(input);
            }.bind(this));
        },

        show: function(params) {
            // loading 
            this.ev.emitter.trigger('pages.hide');

            this.ev.emitter.trigger('desc_block.show', params);

            this.ev.emitter.trigger('page.show', 'description');
        }
    };

    // Covers 
    // ======================================================
    cntrl_covers = {
        init: function(ev) {
            this.ev = ev;

            // Listener 
            ev.emitter.on('covers.show', function (e, input) { 
                this.show();
            }.bind(this));
        },

        show: function() {
            // loading 
            this.ev.emitter.trigger('pages.hide');

            this.ev.emitter.trigger('covers_block.show');

            this.ev.emitter.trigger('page.show', 'covers');
        }
    };

    // Friends 
    // ======================================================
    cntrl_friends = {
        slide_params: { },

        init: function(ev, v_global, v_friends, mdl_user) {
            this.ev = ev;

            this.v_global = v_global;
            this.v_friends = v_friends;

            this.mdl_user = mdl_user;

            this.slide_params = {
                pos:   0,
                count: util.show_friends,
            };

            // Listener
            ev.emitter.on('friend_all.search', function (e, input) { 
                this.search(input);
            }.bind(this));
        },

        search: function(query) {
            x = this.mdl_user.searchFriend(query);

            this.slide_params.pos = 0;

            this.scrollFriends('').done(function() {
            }.bind(this));
        },

        show: function() {
            // set menu
            this.ev.emitter.trigger('menu.select', 'friends');
            this.v_global.showAvatar(  
                this.mdl_user.getAvatar(180)
            );

            this.v_global.updateHearts(util.user_hearts);  

            // clean
            cntrl_purchase.purge();
            cntrl_heart.purge();

            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // show friends 
            this.mdl_user.clearActualFriends();

            this.scrollFriends('').done(function() {
                this.ev.emitter.trigger('loading.finish');
                this.ev.emitter.trigger('page.show', 'friends');
            }.bind(this));

        },

        scrollFriends: function(direction) {
            dfd = $.Deferred();
            this.mdl_user.getFriends().done(function(input) {
                scroll(
                    this.slide_params, 
                    input, 
                    direction, 
                    this.v_friends.fill.bind( this.v_friends )
                );

                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        }
    };

    // Friend
    // ======================================================
    cntrl_friend = {
        init: function(ev, v_global, v_friend, mdl_user, mdl_friend) {
            this.ev = ev;

            this.v_global = v_global;
            this.v_friend = v_friend;

            this.mdl_user = mdl_user;
            this.mdl_friend = mdl_friend;

            this.slide_params = {
                pos:   0,
                count: util.show_gifts_friend,
            };
        },

        show: function(uid) {
            // set menu
            this.ev.emitter.trigger('menu.select', 'friends');

            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            this.show_user_uid = uid;

            // Init friend 
            this.mdl_friend.lookup(uid).done(function() {
                this.v_global.showAvatar(  
                    this.mdl_friend.users[uid].getAvatar(180)
                );

                this.mdl_friend.getHearts(uid).done(function(count) {
                    this.v_global.updateHearts(count);  

                    this.scrollFriendGifts().done(function() {
                        this.ev.emitter.trigger('friend.block.show', { 
                            friend: this.mdl_friend.users[uid]
                        });

                        this.ev.emitter.trigger('loading.finish');
                        this.ev.emitter.trigger('page.show', 'friend');

                    }.bind(this));
                }.bind(this));
            
            }.bind(this)); 

        },

        scrollFriendGifts: function(direction) {
            dfd = $.Deferred();

            this.mdl_friend.users[ this.show_user_uid ].getGifts().done(function(input) {
                
                if (input.length > 0) {
                    scroll(
                        this.slide_params, 
                        input, 
                        direction, 
                        this.v_friend.fill.bind( this.v_friend )
                    );
                } else {
                    this.ev.emitter.trigger('friend.block.show_empty_gifts', { 
                        sex: this.mdl_friend.users[ this.show_user_uid ].sex
                    }); 
                }

                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        },

        sendMessage: function(fid) {
            this.ev.emitter.trigger('friend.message.send', { 'friend': fid });
        },
    };
}

function initControllers() {
    cntrl_index.init(
        events, 
        view_global,
        view_my_gifts,
        view_gifts_cat,
        model_user,
        model_gifts_catalog
    );

    cntrl_purchase.init(
        events, 
        model_user,
        model_friend,
        model_gifts_catalog
    );

    cntrl_heart.init(
        events, 
        model_user,
        model_friend
    );

    cntrl_friends_sel.init(
        events, 
        view_friends_sel,
        model_user
    );

    cntrl_covers.init(
        events 
    );

    cntrl_desc.init(
        events 
    );

    cntrl_friends.init(
        events, 
        view_global,
        view_friends,
        model_user
    );

    cntrl_friend.init(
        events, 
        view_global,
        view_friend,
        model_user,
        model_friend
    );
}

// UTIL

function scroll(vars, list, direction, cb, params) {
    if (direction == 'forward') {
        vars.pos += vars.count;

        if (vars.pos > (list.length - 1)) {
            vars.pos = 0;
        }
    } else if (direction == 'back') {
        vars.pos -= vars.count;

        if (vars.pos < 0) {
            vars.pos = Math.floor((list.length - 1) / vars.count) 
                * vars.count;
        }
    }

    show_list = list.slice(vars.pos, vars.pos + vars.count);

    cb(show_list, list.length, params);
}

