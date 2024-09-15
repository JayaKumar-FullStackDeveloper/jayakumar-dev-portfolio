const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

  // Configure the email transport using Gmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jayakumarjayakrishnanjk@gmail.com', // Your Gmail address
      pass: 'pzxl gmfy erfh qquz',  // Your Gmail password or app-specific password
    },
  });

  // Email options
  let mailOptions = {
    from: email, // Sender's email address
    to: 'jayakumarjayakrishnanjk@gmail.com', // Your email address (where you want to receive emails)
    subject: `New Contact Form Submission from ${name}`,
    text: `You have a new message from ${name} (${email}):\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
