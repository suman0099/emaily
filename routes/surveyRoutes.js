const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const { URL } = require('url');
const Path = require('path-parser');
const Survey = mongoose.model('survey');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

router.get('/api/thanks', (req, res) => {
    console.log('api hit');
    res.send('Thanks for your feedback');
});

router.post('/api/surveys/webhooks', (req, res) => {
    console.log('something');
    const events = req.body.map(event => {
        const pathname = new URL(event.url).pathname;
        const p = new Path('/api/surveys/:surveyId/:choice');
        console.log(p.test(pathname));
    });
});

router.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
        title,
        subject,
        body,
        recipients: recipients
            .split(',')
            .map(email => ({ email: email.trim() })),
        _user: req.user.id,
        dateSent: Date.now()
    });

    // Send email
    const mailer = new Mailer(survey, surveyTemplate(survey));

    try {
        await mailer.send();
        await survey.save();
        req.user.credits -= 1;
        const user = await req.user.save();

        res.send(user);
    } catch (err) {
        res.status(422).send(err);
    }
});

module.exports = router;
