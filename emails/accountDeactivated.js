module.exports = (firstName) => {
    return `
        <style>
            .btn {display: inline-block; background: red; color: #fff; font-weight: bold;}
        </style>

        <h1>Account deactivated</h1>
        <p>${firstName}, your account was deactivated. Deactivated accounts are deleted in 60 days.</p>
        <p>To reactivate your account, simply log back in and your account will be reactivated.</p>
        </hr>
        <p>If you have questions, <a href="${process.env.APP_URL}#support">we’re here to help</a>.</p>
    `;
}