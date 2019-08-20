var express = require('express');
var router = express.Router();
var models = require('../models');

module.exports = function (passport) {

    /**
     * Use this route to check if the user is logged in
     * */
    router.get('/', function (req, res, next) {
        var user = req.user;

        
        var podName = process.env.POD_NAME || "No name provided"
        var nodeName = process.env.NODE_NAME || "No name provided"
        
        var podSufix = podName.split("-");
        var podSufix = podSufix[podSufix.length -1]

        if (user) {
            return res.send({
                user: user.email,
                session_content: req.session.login_time,
                pod_full_name:podName,
                pod_name:podSufix,
                node_name: nodeName,
                });
        } else {
            return res.send({status: 401, message: "You're not logged in"});
        }
    });

    /**
     * request that handles the login of the user
     *
     * in the post body include the following
     * username: {user's username}
     * password: {user's password}
     * */
    router.post('/login', function (req, res, next) {
        passport.authenticate('login', function (err, user, info) {
            if (err)
                return next(err);
            if (!user)
                return res.status(202).send({status: 202, message: info.message ? info.message : info});

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
		    req.session.login_time = new Date().toISOString();
                return res.status(200).send({status: 200, message: info, user: user});
            });
        })(req, res, next);
    });

    /**
     * request that handles the signup of the user
     *
     * in the post body include the following
     *
     * firstName: {user's first name}
     * lastName: {user's last name}
     * email: {user's email}
     * username: {user's username}
     * password: {user's password}
     * */
    router.post('/signup', function (req, res, next) {
        console.log("signup");
        passport.authenticate('signup', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(202).send({status: 202, message: info.message ? info.message : info});
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                user.password = undefined;
                return res.status(200).send({status: 200, message: info, user: user});

            });
        })(req, res, next);
    });

    //user log out
    router.get('/logout', function (req, res) {
        if (req.isAuthenticated()) {
            req.logout();
            return res.status(200).send({status: 200, message: "User logged out successfully"});
        } else {
            return res.status(401).send({status: 401, message: "Not logged in"});
        }
    });
    return router;
};
