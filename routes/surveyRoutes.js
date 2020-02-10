const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const { URL } = require('url');
const _ = require('lodash');
const { Path } = require('path-parser');
const Survey = mongoose.model('survey');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

router.get('/api/surveys/:surveyId/:choice', (req, res) => {
    console.log('api hit');
    res.send('Thanks for your feedback');
});

router.get('/api/surveys', async (req, res) => {
    const surveys = await Survey.find({ _user: req.user.id }).select({
        recipients: false
    });

    res.send(surveys);
});

router.post('/api/surveys/webhooks', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');

    const events = req.body
        .map(({ url, email }) => {
            const match = p.test(new URL(url).pathname);
            console.log(match);
            if (match) {
                return {
                    email,
                    surveyId: match.surveyId,
                    choice: match.choice
                };
            }
        })
        .filter(event => event); // filter undefined events
    const uniqueEvents = _.uniqBy(events, 'email', 'surveyId');

    uniqueEvents.forEach(({ email, surveyId, choice }) => {
        Survey.updateOne(
            {
                _id: surveyId,
                recipients: {
                    $elemMatch: { email: email, responded: false }
                }
            },
            {
                $inc: { [choice]: 1 },
                $set: { 'recipient.$.responded': true },
                lastResponded: Date.now()
            }
        ).exec();
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
