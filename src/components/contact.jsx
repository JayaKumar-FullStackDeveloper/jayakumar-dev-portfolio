import React, { useState } from 'react';
import axios from 'axios';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://your-backend.onrender.comnpm runn/send', formData);  // Update the endpoint to match your backend setup
      console.log('Server response:', response);
      setStatusMessage('Your message has been sent successfully! I will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        message: '',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setStatusMessage('There was an error sending your message. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto lg:mb-4 p-8 border-gray-950  rounded-lg shadow-lg">
      {/* <h2 className="text-3xl font-bold text-center text-white mb-6">Contact Me</h2> */}
      {statusMessage && (
        <p className="text-center mb-6 text-yellow-300 font-semibold">
          {statusMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="w-full px-4 lg:py-3 py-2 bg-transparent border text-white rounded-md placeholder-gray-300 focus:ring focus:ring-teal-900"
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="w-full px-4 lg:py-3 py-2 bg-transparent border text-white rounded-md placeholder-gray-300 focus:ring focus:ring-teal-900"
          />
        </div>
        <div>
          <textarea
            name="message"
            id="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
            placeholder="How can I assist you? Type your query or service request here..."
            required
            className="w-full px-4 lg:py-3 py-2 bg-transparent border text-white rounded-md placeholder-gray-300 focus:ring focus:ring-teal-900"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full lg:py-3 py-2 bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Send Message
        </button>
      </form>
      <p className="text-center text-sm text-white lg:mt-4 mt-2">
       Thanks for reaching out!
      </p>
    </div>
  );
}

export default Contact;
