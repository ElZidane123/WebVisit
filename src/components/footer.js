// src/Footer.js

import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-12 mt-16">
            <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
                        <p className="text-gray-300 mb-2">📍 Jl Danau Ranau</p>
                        <p className="text-gray-300 mb-2">📞 (555) 123-4567</p>
                        <p className="text-gray-300">✉️ info@smktelkom-mlg.sch.id</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Visit Hours</h4>
                        <p className="text-gray-300 mb-2">Senin - selasa: Tidak Bisa Visit</p>
                        <p className="text-gray-300 mb-2">Rabu: 10:00 - 15:00</p>
                        <p className="text-gray-300">Kamis - Minggu: Tidak Bisa Visit</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <div className="space-y-2">
                            <a href="#" className="block text-gray-300 hover:text-white">Admissions</a>
                            <a href="#" className="block text-gray-300 hover:text-white">Academic Programs</a>
                            <a href="#" className="block text-gray-300 hover:text-white">Faculty & Staff</a>
                            <a href="#" className="block text-gray-300 hover:text-white">Student Life</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;