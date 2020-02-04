const keys = require('../../config/keys');

module.exports = survey => {
    return `
        <html>
            <body style="text-align: center;">
            <div>
                <h3>I'd would like your input!</h3>
                <p>Please answer the following question:</p>
                <p>${survey.body}</p>
            </div>
            <div>
                <a href="${keys.redirectDomain}/api/thanks">Yes</a> 
            </div>
            <div>
                <a href="${keys.redirectDomain}/api/thanks">No</a> 
            </div>
            </body>
        </html>
    `;
};
