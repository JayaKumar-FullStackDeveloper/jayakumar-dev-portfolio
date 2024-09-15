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
        const response = await axios.post('http://localhost:5000/send', formData);
        console.log('Server response:', response); // Log the response for debugging
        setStatusMessage('Email sent successfully!');
        setFormData({
            name: '',
            email: '',
            message: '',
        });
    } catch (error) {
        console.error('Error sending email:', error);
        setStatusMessage('Error sending email. Please try again.');
    }
};

  return (
    <div className="max-w-xl mx-auto my-10 p-5 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-white mb-4">Contact Me</h2>
      {statusMessage && (
        <p className="text-center mb-4 text-white">
          {statusMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-md focus:ring focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-md focus:ring focus:ring-teal-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-md focus:ring focus:ring-teal-300"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

export default Contact;
