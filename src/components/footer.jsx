import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 bg-opacity-20 text-gray-400 py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-col-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 text-left mb-6">
          <div className="col-span-2">
            <h3 className="text-white font-semibold mb-2">Contact Information</h3>
            <p className="mb-1">
              Email:{" "}
              <a
                href="mailto:jkrkumar1801@gmail.com"
                className="text-gray-300"
              >
                jayakumarjayakrishnanjk@gmail.com
              </a>
            </p>
            <p className="mb-1">
              Phone:{" "}
              <a href="tel:+919514101822" className="text-gray-300">
                +91 9514101822
              </a>
            </p>
          </div>

          {/* Address Section with responsiveness */}
          <div className="sm:col-span-1 lg:col-span-2 grid grid-cols-2 lg:grid-row-2 gap-6">
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-white font-semibold mb-2">Home Address</h3>
              <p className="mb-px">Pillayar Kovil Street, Ponngunam,</p>
              <p className="mb-px">Panruti-607 106</p>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-white font-semibold mb-2">Current Address</h3>
              <p className="mb-px">
                No:26/5, Vagai Street, Balaji Nagar, Irumbuliur, East Tambaram,
              </p>
              <p className="mb-px">Chennai-600 045</p>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-700 pt-4 text-center w-full">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Jayakumar's Portfolio. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
