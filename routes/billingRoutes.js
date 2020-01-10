const keys = require("../config/keys");
const stripe = require("stripe")(keys.stripeSecretKey);
const requireLogin = require("../middlewares/requireLogin");

module.exports = app => {
    app.post("/api/stripe", requireLogin, async (req, res) => {
        const charge = await stripe.charges.create({
            amount: 500,
            currency: "usd",
            description: "$5 for 5 credits",
            shipping: {
                name: "Jenny Rosen",
                address: {
                    line1: "510 Townsend St",
                    postal_code: "98140",
                    city: "San Francisco",
                    state: "CA",
                    country: "US"
                }
            },
            source: req.body.id
        });

        console.log(req.user);
        req.user.credits += 5;
        const user = await req.user.save();
        res.send(user);
    });
};
