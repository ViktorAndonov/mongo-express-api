module.exports = (firstName, verificationLink) => {
    return `
        <style>
            .btn {display: inline-block; background: red; color: #fff; font-weight: bold;}
        </style>

        <h1>Welcome to ${process.env.APP_NAME}, ${firstName}. </h1>
        <p>You’re receiving this message because you recently signed up for a ${process.env.APP_NAME} account.</p>
        <p>Confirm your email address by clicking the button below. This step adds extra security to your account by verifying you own this email. </p>
        <p><a href="${verificationLink}" class="btn">Confirm email</a></p>
        </hr>
        <p>This link will expire in 24 hours. If you have questions, <a href="${process.env.APP_URL}#support">we’re here to help</a>.</p>
    `;
}