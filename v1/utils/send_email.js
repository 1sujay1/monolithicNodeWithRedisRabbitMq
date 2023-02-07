const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailWithStatic(data) {
    try {
        let msg = {
            to: data.email,
            from: 'no-reply@abc.in <sujaygowdag3@gmail.com>',
            subject: data.templateData.subject,
        };
        if (data.templateData.text) msg.text = data.templateData.text;
        if (data.templateData.html) msg.html = data.templateData.html;
        if (data.attachments) msg.attachments = data.attachments;

        await sgMail.send(msg)
            .then((response) => {
                // console.log("response", response);
                console.log('SendGrid response: ', response && response[0].statusCode ? response[0].statusCode : '');
            })
            .catch((err) => {
                console.log('SendGrid Error: ', err);
                if (err.response && err.response.data) {
                    console.log('SendGrid Errors: ', JSON.stringify(err.response.data.response.body));
                }
            });

    } catch (error) {
        if (error.response) {
            console.error(error.response.body);
            return res.json({ status: false, message: [error.message] })
        }
    }
}
async function sendEmailWithTemplateId(data) {
    try {
        let msg = {
            to: data.email,
            from: 'no-reply@abc.in <sujaygowdag3@gmail.com>',
            templateId: data.templateId,
            dynamic_template_data: data.templateData
        };

        if (data.attachments)
            msg.attachments = data.attachments

        await sgMail.send(msg)
            .then((response) => {
                console.log('SendGrid response: ', response && response[0].statusCode ? response[0].statusCode : '');
            })
            .catch((err) => {
                console.log('SendGrid Error: ', err);
                if (err.response && err.response.data) {
                    console.log('SendGrid Errors: ', JSON.stringify(err.response.data.response.body));
                }
            });

    } catch (error) {
        if (error.response) {
            console.error(error.response.body);
            return res.json({ status: false, message: [error.message] })
        }
    }
}

async function formatEmailData(email, subject, text) {
    let emailData = {
        email,
        templateData: {
            subject,
            text
        }
    }
    return emailData
}

module.exports = {
    sendEmailWithStatic,
    sendEmailWithTemplateId,
    formatEmailData
}