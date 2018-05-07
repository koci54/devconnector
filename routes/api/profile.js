const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// load profile models
const Profile = require('../../models/Profile');
// load user model
const User = require('../../models/User');

// @route GET api/profile/test
// @desc tests profile route
// @access public
router.get('/test', (req, res) => res.json({ msg: 'profile works' }));

// @route GET api/profile
// @desc get current user's profile
// @access private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
 const errors = {};

  Profile.findOne({user: req.user.id})
  .populate('user', ['name', 'avatar'])
  .then(profile => {
    if (!profile) {
      errors.noprofile = 'There is no profile for this user.';
      return res.status(404).json(errors);
    }
    res.json(profile);
  })
  .catch(err => res.status(404).json(err));
});

// @route GET api/profile/all (backend)
// @desc get all profiles
// @access public

router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
  .populate('user', ['name', 'avatar'])
  .then(profiles => {
    if(!profiles) {
      errors.noprofile = 'There is no profiles';
      return res.status(404).json(errors);
    }
    res.json(profiles);
  })
.catch(err => res.status(404).json({profile: 'There are no profiles for this user.'}));
})

// @route GET api/profile/handle/:handle (backend)
// @desc get profile by handle
// @access public

router.get('/handle/:handle', (req, res) => {
  Profile.findOne({ handle: req.params.handle})
     .populate('user', ['name', 'avatar'])
     .then(profile => {
       if(!profile) {
         errors.noprofile = 'There is no profile for this user.';
         res.status(404).json(errors);
       }
       res.json(profile)
     })
     .catch(err => res.status(404).json(err));
});

// @route GET api/profile/user/:user_id (backend)
// @desc get profile by user id
// @access public

router.get('/user/:user_id', (req, res) => {
  Profile.findOne({ handle: req.params.user_id})
     .populate('user', ['name', 'avatar'])
     .then(profile => {
       if(!profile) {
         errors.noprofile = 'There is no profile for this user.';
         res.status(404).json(errors);
       }
       res.json(profile)
     })
     .catch(err => res.status(404).json({profile: 'There is no profile for this user.'}));
});

// @route POST api/profile
// @desc create or edit user's profile
// @access private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
 const { errors, isValid} = validateProfileInput(req.body);

 // check validation
 if (!isValid){
   // return any errors with 400 Status
   return res.status(400).json(errors);
 }
 // get fields
 const profileFields = {};
 profileFields.user = req.user.id;
 if (req.body.handle) profileFields.handle = req.body.handle; // check if is sent in
 if (req.body.company) profileFields.company = req.body.company; // check if is sent in
 if (req.body.website) profileFields.website = req.body.website; // check if is sent in
 if (req.body.location) profileFields.location = req.body.location; // check if is sent in
 if (req.body.bio) profileFields.bio = req.body.bio; // check if is sent in
 if (req.body.status) profileFields.status = req.body.status; // check if is sent in
 if (req.body.githubusername) profileFields.githubusername = req.body.githubusername; // check if is sent in
// skills - split into array
 if (typeof req.body.skills !== 'undefined') {
   profileFields.skills = req.body.skills.split(',');
 }

 // social
 profileFields.social = {};

 if (req.body.youtube) profileFields.social.youtube = req.body.youtube; // check if is sent in
 if (req.body.twitter) profileFields.social.twitter = req.body.twitter; // check if is sent in
 if (req.body.facebook) profileFields.social.facebook = req.body.facebook; // check if is sent in
 if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin; // check if is sent in
 if (req.body.instagram) profileFields.social.instagram = req.body.instagram; // check if is sent in

Profile.findOne({ user: req.user.id})
 .then(profile => {
   if (profile) {
     // update
     Profile.findOneAndUpdate(
       {user: req.user.id},
       {$set: profileFields},
       {new: true}
     ).then(profile => res.json(profile));
   } else {
     // create

     // check if handle exists
     Profile.findOne({handle: profileFields.handkle}).then(profile => {
       if (profile) {
         errors.handle = 'That handle already exists';
         res.status(400).json(errors);
       }

       // save profileFields
       new Profile(profileFields).save().then(profile => res.json(profile));
     })
   }
 })
});

// @route POST api/profile/experience
// @desc add experience to profile
// @access private
router.post('/experience', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid} = validateExperienceInput(req.body);

   // check validation
   if (!isValid){
     // return any errors with 400 Status
     return res.status(400).json(errors);
   }

    Profile.findOne({ user: req.user.id})
      .then(profile => {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        }

        // add to experience array
        profile.experience.unshift(newExp);

        profile.save().then(profile => res.json(profile));
      })
})

// @route POST api/profile/education
// @desc add experience to profile
// @access private
router.post('/education', passport.authenticate('jwt', { session: false}), (req, res) => {
  const { errors, isValid} = validateEducationInput(req.body);

   // check validation
   if (!isValid){
     // return any errors with 400 Status
     return res.status(400).json(errors);
   }

    Profile.findOne({ user: req.user.id})
      .then(profile => {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        }

        // add to experience array
        profile.education.unshift(newEdu);

        profile.save().then(profile => res.json(profile));
      })
})

// @route DELETE api/profile/experience/:exp_id
// @desc delete experience from profile
// @access private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false}), (req, res) => {

    Profile.findOne({ user: req.user.id}).then(profile => {
      // get remove index
      const removeIndex = profile.experience
       .map(item => item.id)
       .indexOf(req.params.exp_id);

      // splice out of array
      profile.experience.splice(removeIndex, 1);

      // save
      profile.save().then(profile => res.json(profile));

    })
    .catch(err = res.status(404).json(err));
  }
);

// @route DELETE api/profile/education/:edu_id
// @desc delete education from profile
// @access private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false}), (req, res) => {

    Profile.findOne({ user: req.user.id}).then(profile => {
      // get remove index
      const removeIndex = profile.education
       .map(item => item.id)
       .indexOf(req.params.edu_id);

      // splice out of array
      profile.education.splice(removeIndex, 1);

      // save
      profile.save().then(profile => res.json(profile));

    })
    .catch(err = res.status(404).json(err));
  }
);

// @route DELETE api/profile
// @desc delete user and profile
// @access private
router.delete('/', passport.authenticate('jwt', { session: false}), (req, res) => {

    Profile.findOneAndRemove({ user: req.user.id})
     .then(() => {
       User.findOneAndRemove({_id: req.user.id}).then(() => {
         res.json({success: true})
       })
     )
  }
);

module.exports = router;
