// Definition
var model_user          = {};
var model_gifts_catalog = {};
var model_friend        = {};

// Functions
function loadModels() {

    model_user = {
        box:   util.user_box,
        login: util.user_login,
        api:   util.api_url,

        gifts:    {},
        friends:  {},
        holidays: {},

        init: function() {
            this.balance = util.user_start_balance;
        },

        getAvatar: function(size) {
            return util.avatar_host + this.box + '/' + this.login + '/_avatar' + size;
        },

        getBalance: function() {
            dfd = $.Deferred();

            $.getJSON(util.api_url.balance, function(data) {
                this.balance = data.balance;
                dfd.resolve(data.balance);
            }.bind(this));

            return dfd.promise();
        },

        getHolidays: function() {
            dfd = $.Deferred();

            if (Object.size(this.holidays) == 0) {
                $.getJSON(util.api_url.holidays, function(data) {
                    this.holidays = data;
                    dfd.resolve(data);
                }.bind(this));
            } else {
                dfd.resolve(this.holidays);
            }

            return dfd.promise();
        },

        getGifts: function() {
            dfd = $.Deferred();

            if (Object.size(this.gifts) == 0) {
                $.getJSON(util.api_url.my_gifts, function(data) {
                    var res = {};
                    $.each(data, function(i, e) {
                        res[ e.id ] = e; 
                    });

                    this.gifts     = res;
                    this.gifts_raw = data;

                    dfd.resolve(data);
                }.bind(this));
            } else {
                dfd.resolve(this.gifts_raw);
            }

            return dfd.promise();
        },

        clearActualFriends: function() {
            this.friends_raw_actual = { };
        },

        getFriends: function () {
            dfd = $.Deferred();

            if (Object.size(this.friends_raw_actual) == 0) {

                if (Object.size(this.friends_raw) == 0) {
                    $.getJSON(this.api.friends_get, function(data) {
                        var res = {};
                        $.each(data, function() {
                            name = htmlEncode(this.first_name + " " + this.last_name);
                            
                            if (name.length === 1) {
                                name = this.nick;
                            }

                            this.name = name;

                            res[ this.uid ] = this; 
                        });
                        this.friends = res;
                        this.friends_raw = data;

                        this.friends_raw_actual = data;

                        dfd.resolve(data);
                    }.bind(this));

                } else {
                    this.friends_raw_actual = this.friends_raw;
                    dfd.resolve(this.friends_raw_actual);
                }

            } else {
                dfd.resolve(this.friends_raw_actual);
            }

            return dfd.promise();
        },

        searchFriend: function(query) {
            serp = new Array();

            $.each(this.friends, function(id, v) {
                if (v.nick.toLowerCase().indexOf(query) >= 0) {
                    serp.push(v);
                } else if (v.first_name.toLowerCase().indexOf(query) >= 0) { 
                    serp.push(v);
                } else if (v.last_name.toLowerCase().indexOf(query) >= 0) {
                    serp.push(v);
                } else if (v.link.toLowerCase().indexOf(query) >= 0) {
                    serp.push(v);
                }
            });

            this.friends_raw_actual = serp;

            return this.friends_raw_actual;
        }
    };

    model_gifts_catalog = {
        gifts: {},
        gifts_all: {},

        init: function() {
        },

        getGifts: function(sort, cat_id) { 
            dfd = $.Deferred();

            if (typeof(this.gifts[cat_id]) === 'undefined' || typeof(this.gifts[cat_id][sort]) === 'undefined') {
                $.getJSON(util.api_url.category_gifts, { 
                    cid:     cat_id, 
                    ext:     1,
                    sort_by: sort 
                }, 
                function(data) {
                    if (typeof(this.gifts[cat_id]) === 'undefined') {
                        this.gifts[cat_id] = {};
                    }

                    this.gifts[cat_id][sort] = data;

                    $.each(data, function(i, e) {
                        this.gifts_all[ e.id ] = e;
                    }.bind(this));

                    dfd.resolve(data);
                }.bind(this));

            } else {
                dfd.resolve(this.gifts[cat_id][sort]);

            }

            return dfd.promise();
        }
    };

    model_friend = {
        init: function(uid, user) {
            if (uid) {
                this.info = user.friends[uid];
                this.uid = uid;
            }
        },

        getGifts: function() {
            dfd = $.Deferred();

            $.getJSON(util.api_url.my_gifts, 
                { 'uid': this.uid }, 
                function(data) {
                    dfd.resolve(data);
                }.bind(this)
            );

            return dfd.promise();
        }
    }
}

function initModels() {
    model_gifts_catalog.init();
    model_user.init();
    model_friend.init();
}

