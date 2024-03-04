const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vasudhapatoliya502@gmail.com",
    pass: "mlta ztcb qmpl bovp",
  },
});

function sendWelcomeEmail({ email, url, subject }) {
  //   const text = "http://127.0.0.1:5173" + url;
  const mailOptions = {
    from: "vasudhapatoliya502@gmail.com",
    to: email,
    subject: subject,
    text: `http://localhost:5173/${url}`,
  };

  return transporter.sendMail(mailOptions);
}

function sendUpdateEmail({ email, newObject }) {
  // console.log("🚀 ~ sendUpdateEmail ~ data:", newObject);

  const mailOptions = {
    from: "vasudhapatoliya502@gmail.com",
    to: email,
    subject: "Update Info By Admin",
    text: newObject.split(", ").join("\n"),
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendWelcomeEmail, sendUpdateEmail };
