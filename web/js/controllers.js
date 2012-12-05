// Definition
var cntrl_index       = {};
var cntrl_purchase    = {};
var cntrl_friends_sel = {};
var cntrl_desc        = {};
var cntrl_covers      = {};
var cntrl_friends     = {};
var cntrl_friend      = {};

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
        },

        // General 
        // ----------------------------------------- 

        show: function() {
            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // clean
            cntrl_purchase.purge();

            // show avatar
            this.v_global.showAvatar(
                this.mdl_user.getAvatar(180)
            );

            // set menu
            this.ev.emitter.trigger('menu.select', 'index');

            // update balance
            this.ev.emitter.trigger('user_balance.update', this.mdl_user.balance);

            // show "My gifts" block
            this.scrollMyGifts().done(function() {

                // show catalog
                this.setCatalogCategory(util.default_gift_cat).done(function() {
                    this.ev.emitter.trigger('block_gifts_cat.show');
                    this.ev.emitter.trigger('loading.finish');
                    this.ev.emitter.trigger('page.show', 'index');

                    // show welcome
                    if (util.is_install > 0) {
                        this.ev.emitter.trigger('welcome.show');
                    }

                    // preload friends
                    this.mdl_user.getFriends().done(function(input) {
                    }.bind(this));
                }.bind(this));
            }.bind(this));

            // stat
            _kmq.push(['record', 'view index', {
                'ref': util.ref, 
            }]);
        },

        showGiftsCatalog: function() {
            this.ev.emitter.trigger('block_mygifts.hide');

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
                service_id: p.service_id,
                service_name: p.service_name,
                mailiki_price: p.mailiki 
            });
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
                            _kmq.push(['record', 'open new gift']);
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
        }
    };

    // Purchase 
    // ======================================================
    cntrl_purchase = {
        init: function(ev, mdl_user, mdl_gifts_cat) {
            this.ev = ev;
            this.mdl_user = mdl_user;
            this.mdl_gifts_cat = mdl_gifts_cat;

            // Listener 
            ev.emitter.on('description.complete', function (e, input) { 
                this.setDescription(input);
            }.bind(this));
        },

        purge: function() {
            delete this.friend_selected;
            delete this.gift_selected;
            delete this.text;
            delete this.incognito;
            delete this.privacy;
            delete this.cover;
        },

        setGift: function(gift_id) {
            this.gift_selected = gift_id;  

            // stat
            _kmq.push(['record', 'set gift']);

            if (typeof this.friend_selected != 'undefined') {
                gift = this.mdl_gifts_cat.gifts_all[ this.gift_selected ];
                friend = this.mdl_user.friends[ this.friend_selected ];

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
            this._set_friend(friend_id, type).done(function() {
                if (this.friend_selected) {
                    // stat
                    _kmq.push(['record', 'set friend']);

                    if (typeof this.gift_selected != 'undefined') {
                        gift = this.mdl_gifts_cat.gifts_all[ this.gift_selected ];
                        friend = this.mdl_user.friends[ this.friend_selected ];

                        this.ev.emitter.trigger('desc.show', {
                            gift: gift,
                            friend: friend
                        });
                    } else {
                        this.ev.emitter.trigger('gifts_catalog.show');
                    }
                }
            }.bind(this));
        },

        setDescription: function(p) {
            this.text      = p.text;
            this.incognito = p.incognito;
            this.privacy   = p.privacy

            // stat
            _kmq.push(['record', 'set description']);

            this.ev.emitter.trigger('covers.show');
        },

        setCover: function(id) {
            this.cover = id;  

            // stat
            _kmq.push(['record', 'set cover']);

            this.process();
        },

        process: function() {
            // loading 
            this.ev.emitter.trigger('pages.hide');

            this.ev.emitter.trigger('send_done_block.load.start');

            this.ev.emitter.trigger('page.show', 'done');

            // stat
            _kmq.push(['record', 'process purchase', { 
                'gift':      this.gift_selected,
                'privacy':   this.privacy,
                'incognito': this.incognito,
                'cover':     this.cover,
            }]);

            // process
            $.post(util.api_url.purchase, {
                    gift:      this.gift_selected,
                    receiver:  this.friend_selected,
                    text:      this.text,
                    privacy:   this.privacy,
                    incognito: this.incognito,
                    cover:     this.cover
                },

                function(data) {
                    this.ev.emitter.trigger('send_done_block.load.finish');
                    gift = this.mdl_gifts_cat.gifts_all[ this.gift_selected ];
                    friend = this.mdl_user.friends[ this.friend_selected ];

                    if (data.done == 'gift sended') {
                        this.ev.emitter.trigger('send_done_block.show', {
                            gift: gift,
                            friend: friend
                        });

                        this.mdl_user.balance = data.balance;

                        this.ev.emitter.trigger('user_balance.update', data.balance);

                        // stat
                        _kmq.push(['record', 'finish purchase', { 'result': 'done' }]);
                        _kmq.push(['record', 'send gift']);

                    } else if (data.balance_error == 'need more money') {
                        this.ev.emitter.trigger('send_error_block.show', {
                            gift: gift,
                            friend: friend,
                            need: data.need
                        });

                        // stat
                        _kmq.push(['record', 'finish purchase', { 'result': 'need_money' }]);
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

        postStream: function() {
            friend = this.mdl_user.friends[ this.friend_selected ];

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
                this.show();
            }.bind(this));

            ev.emitter.on('friend.search', function (e, input) { 
                this.search(input);
            }.bind(this));
        },

        search: function(query) {
            x = this.mdl_user.searchFriend(query);

            this.scrollFriends('').done(function() {
            }.bind(this));
        },

        show: function() {
            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // show friends selector
            this.mdl_user.clearActualFriends();

            this.scrollFriends('').done(function() {
                this.ev.emitter.trigger('loading.finish');
                this.ev.emitter.trigger('page.show', 'friends_sel');
            }.bind(this));
        },

        scrollFriends: function(direction) {
            dfd = $.Deferred();
            this.mdl_user.getFriends().done(function(input) {
                scroll(
                    this.slide_params, 
                    input, 
                    direction, 
                    this.v_friends_sel.fill.bind( this.v_friends_sel )
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

            this.scrollFriends('').done(function() {
            }.bind(this));
        },

        show: function() {
            // set menu
            this.ev.emitter.trigger('menu.select', 'friends');
            this.v_global.showAvatar(  
                this.mdl_user.getAvatar(180)
            );

            // clean
            cntrl_purchase.purge();

            // loading 
            this.ev.emitter.trigger('pages.hide');
            this.ev.emitter.trigger('loading.start');

            // show friends 
            this.mdl_user.clearActualFriends();

            this.scrollFriends('').done(function() {
                this.ev.emitter.trigger('loading.finish');
                this.ev.emitter.trigger('page.show', 'friends');
            }.bind(this));

            // stat
            _kmq.push(['record', 'view friends page']);
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

            // Init friend 
            this.mdl_friend.init(uid, this.mdl_user); 
            this.v_global.showAvatar( this.mdl_friend.info.pic_180 );

            this.scrollFriendGifts().done(function() {

                this.ev.emitter.trigger('friend.block.show', { 
                    friend: this.mdl_friend 
                });

                this.ev.emitter.trigger('loading.finish');
                this.ev.emitter.trigger('page.show', 'friend');

            }.bind(this));

            // stat
            _kmq.push(['record', 'view friend page']);
        },

        scrollFriendGifts: function(direction) {
            dfd = $.Deferred();

            this.mdl_friend.getGifts().done(function(input) {
                
                if (input.length > 0) {
                    scroll(
                        this.slide_params, 
                        input, 
                        direction, 
                        this.v_friend.fill.bind( this.v_friend )
                    );
                } else {
                    this.ev.emitter.trigger('friend.block.show_empty_gifts', { 
                        sex: this.mdl_friend.info.sex
                    }); 
                }

                dfd.resolve();
            }.bind(this));

            return dfd.promise();
        }

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
        model_gifts_catalog
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

function scroll(vars, list, direction, cb) {
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

    cb(show_list, list.length);
}

