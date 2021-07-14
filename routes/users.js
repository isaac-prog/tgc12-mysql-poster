const express = require("express");
const router = express.Router();
const crypto = require('crypto');

// hashing password, encrypting passwords
const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// import in the User model
const { User } = require('../models');

const { createRegistrationForm,createLoginForm, bootstrapField } = require('../forms');

router.get('/users/register', (req,res)=>{
    // display the registration form
    const registerForm = createRegistrationForm();
    res.render('users/register', {
        'form': registerForm.toHTML(bootstrapField)
    })
})

router.post('/users/register', (req, res) => {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        success: async (form) => {
            const user = new User({
                'username': form.data.username,
                // this encrypts the password
                'password': getHashedPassword(form.data.password),
                'email': form.data.email
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/users/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login',{
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/users/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login

            // ...find the user by email and password
            let user = await User.where({
                'email': form.data.email
            }).fetch({
               require:false}
            );
            // if the variable is null, then it means there is no user with that email.
            // In that case we will just redirect back to the login page with an error message.

            if (!user) {
                req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                res.redirect('/users/login');
            } 
            // If the user is successfully retrieved, we proceed to check if the password matches
            else {
                // check if the password matches the hashed password
                if (user.get('password') === getHashedPassword(form.data.password)) {
                    // add to the session that login succeed
                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('username'));
                    //  redirects the user to the /users/profile route
                    res.redirect('/users/profile');
                } else {
                    req.flash("error_messages", "Sorry, the authentication details you provided does not work.")
                    res.redirect('/users/login')
                }
            }
        }, 'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// Add a users/profile route
// This route displays the details of a logged in user; we use this to test if the user authentication is working.
router.get('/users/profile', (req, res) => {
    // Retrieves the currently logged in user from the session. 
    // If there is none, we will redirect to the login page with an error message
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profiles',{
            'user': user
        })
    }
})

// logout
// redirect to url home page
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "Goodbye");
    res.redirect('/users/login');
})

module.exports = router;

