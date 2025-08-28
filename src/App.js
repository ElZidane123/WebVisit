// src/App.js

import React, { useState, useEffect } from 'react';
import Header from './components/header';
import Footer from './components/footer';
import Steps from './components/Steps';
import './App.css';

// Data acara sekolah yang memblokir kunjungan (tanggal yang tidak bisa dipilih sama sekali)
const schoolEvents = [
    new Date(2024, 2, 15),
    new Date(2024, 2, 22),
    new Date(2024, 2, 25),
    new Date(2024, 2, 26),
    new Date(2024, 2, 27),
    new Date(2024, 2, 28),
    new Date(2024, 2, 29),
];

// Data simulasi untuk jadwal yang sudah di-approve admin
// Key: Tanggal dalam format YYYY-MM-DD
// Value: Array dari sesi yang sudah di-booking (misalnya '10:00 AM - 12:00 AM' atau '13:00 AM - 15:00 AM')
const approvedBookings = {
  // Contoh tanggal yang sudah di-booking
  '2025-8-13': ['10:00 AM - 12:00 AM'], // 13 Agustus 2025, sesi pagi sudah full
  '2025-8-20': ['10:00 AM - 12:00 AM', '13:00 AM - 15:00 AM'], // 20 Agustus 2025, semua sesi full
};

function isDateBlocked(date) {
    if (schoolEvents.some(eventDate => eventDate.toDateString() === date.toDateString())) {
        return true;
    }
    return date.getDay() !== 3; // Kunjungan hanya bisa hari Rabu (3)
}

function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

const App = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarDays, setCalendarDays] = useState([]);
    
    const [visitDetails, setVisitDetails] = useState({
        institution: 'Industri',
        visitors: '1 person',
        mealOption: 'snack',
        totalCost: 0
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState(null);

    // State baru untuk menyimpan sesi yang tersedia pada tanggal yang dipilih
    const [availableSessions, setAvailableSessions] = useState(['10:00 AM - 12:00 AM', '13:00 AM - 15:00 AM']);

    useEffect(() => {
        generateCalendar();
    }, [currentDate, selectedDate]);
    
    useEffect(() => {
        calculateTotalCost();
    }, [visitDetails.institution, visitDetails.visitors, visitDetails.mealOption]);

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            // Cek apakah tanggal sudah diblokir oleh event sekolah atau sudah lewat
            const isBlocked = isPastDate(date) || isDateBlocked(date);
            
            // Format tanggal untuk mencari di approvedBookings
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            
            // Cek apakah semua sesi di tanggal tersebut sudah di-booking
            const isFullyBooked = approvedBookings[dateKey] && approvedBookings[dateKey].length === 2;

            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isCurrentMonth = date.getMonth() === month;

            days.push({
                date,
                isBlocked: isBlocked || isFullyBooked, // Tanggal diblokir jika sudah lewat, ada event sekolah, atau semua sesi sudah di-booking
                isFullyBooked, // Tambahkan properti baru untuk menandai full booked
                isSelected,
                isCurrentMonth
            });
        }
        setCalendarDays(days);
    };

    const handleSelectDate = (date, isBlocked) => {
        if (!isBlocked) {
            setSelectedDate(date);
            
            // Tentukan sesi yang tersedia untuk tanggal yang dipilih
            const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            const bookedSessions = approvedBookings[dateKey] || [];
            
            const allSessions = ['10:00 AM - 12:00 AM', '13:00 AM - 15:00 AM'];
            const available = allSessions.filter(session => !bookedSessions.includes(session));
            setAvailableSessions(available);
            
            // Atur default sesi ke sesi pertama yang tersedia
            setVisitDetails(prev => ({
              ...prev,
              session: available[0]
            }));
        }
    };

    const handleMonthChange = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };
    
    const handleFormChange = (e) => {
        setVisitDetails({
            ...visitDetails,
            [e.target.name]: e.target.value
        });
    };
    
    const calculateTotalCost = () => {
        let cost = 0;
        const visitorCount = parseInt(visitDetails.visitors.split(' ')[0]) || 0;
        
        if (visitDetails.institution === 'Bimbel' || visitDetails.institution === 'Kampus') {
            cost = 1000000;
        } else if (visitDetails.institution === 'SMA') {
            if (visitDetails.mealOption === 'snack') {
                cost = 25000 * visitorCount;
            } else if (visitDetails.mealOption === 'lunch_snack') {
                cost = 50000 * visitorCount;
            }
        } else if (visitDetails.institution === 'SMP') {
            cost = 0;
        }

        setVisitDetails(prev => ({
            ...prev,
            totalCost: cost
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedDate) {
            const formData = {
                firstName: e.target.elements[0].value,
                lastName: e.target.elements[1].value,
                email: e.target.elements[2].value,
                phone: e.target.elements[3].value,
                session: e.target.elements.session.value, // Ambil nilai sesi dari form
                visitors: visitDetails.visitors,
                institution: visitDetails.institution,
                mealOption: visitDetails.institution === 'SMA' ? (visitDetails.mealOption === 'snack' ? 'Snack Only' : 'Makan Siang + Snack') : '-',
                specialRequest: e.target.elements[7].value,
                date: selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                totalCost: visitDetails.totalCost,
            };

            setConfirmationData(formData);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setVisitDetails({
            institution: 'Industri',
            visitors: '1 person',
            mealOption: 'snack',
            totalCost: 0
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
    };

    const [uploadedFile, setUploadedFile] = useState(null);


    return (
        <div className="bg-gray-50">
            <Header />
            
            {/* ... bagian Hero Section ... */}
            <section className="hero-bg text-white py-36">
                <div className="max-w-10xl mx-auto px-6 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-4">Selamat Datang Di SMK Telkom Malang</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Website ini hadir sebagai pusat informasi dan dokumentasi kegiatan kunjungan sekolah, baik kunjungan keluar 
                        (study tour, kunjungan industri, museum, kampus, dll) maupun kunjungan tamu ke sekolah.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-20 justify-center">
                        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold">1000+</div>
                            <div className="text-sm text-blue-100">Siswa Aktif</div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold">60+</div>
                            <div className="text-sm text-blue-100">Guru</div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold">32 Th</div>
                            <div className="text-sm text-blue-100">Berdiri Selama</div>
                        </div>
                    </div>
                </div>
            </section>

            <Steps />
            
            <main className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* ... Bagian Kalender ... */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Pilih Jadwal Kunjungan</h3>
                            <div className="flex space-x-2">
                                <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/></svg>
                                </button>
                                <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold text-gray-800 text-center">
                                {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </h4>
                        </div>
                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">{day}</div>
                            ))}
                        </div>
                        <div id="calendar" className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    className={`calendar-day rounded-lg border-2 p-2 text-center 
                                                ${!day.isCurrentMonth ? 'text-gray-300' : ''} 
                                                ${day.isFullyBooked ? 'date-fully-booked' : day.isBlocked ? 'date-blocked' : 'date-available'} 
                                                ${day.isSelected ? 'date-selected' : ''}`}
                                    onClick={() => handleSelectDate(day.date, day.isBlocked || day.isFullyBooked)}
                                >
                                    <div className="font-medium">{day.date.getDate()}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div><span>Tersedia</span></div>
                            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded opacity-60"></div><span>Tidak tersedia</span></div>
                            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div><span>Terpilih</span></div>
                            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-100 border-2 border-gray-500 rounded"></div><span>Full</span></div>
                        </div>
                    </div>
                    
                    {/* Registration Form */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Registrasi Kunjungan</h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className={`${selectedDate ? '' : 'hidden'} bg-blue-50 border border-blue-200 rounded-lg p-4`}>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>
                                    <span className="text-blue-800 font-medium">Memilih Tanggal Kunjungan: 
                                        <span id="selectedDateText">{selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Nama Depan *</label><input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Nama Belakang *</label><input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Email *</label><input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Nomor telpon *</label><input type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Sesi</label>
                              <select 
                                name="session" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={!selectedDate}
                              >
                                {availableSessions.length > 0 ? (
                                    availableSessions.map(session => (
                                        <option key={session} value={session}>{session}</option>
                                    ))
                                ) : (
                                    <option>Tidak ada sesi tersedia</option>
                                )}
                              </select>
                              {selectedDate && availableSessions.length < 2 && (
                                <p className="mt-2 text-sm text-yellow-600">
                                  ⚠️ Perhatian: Salah satu sesi pada tanggal ini sudah di-booking.
                                </p>
                              )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kunjungan</label>
                                <select 
                                    name="visitors" 
                                    value={visitDetails.visitors} 
                                    onChange={handleFormChange} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option>Per Orangan</option>
                                    <option>Kelompok (5 Sampai 10)</option>
                                    <option>Rombongan (Diatas 10)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asal Instansi</label>
                                <select 
                                    name="institution" 
                                    value={visitDetails.institution} 
                                    onChange={handleFormChange} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option>Industri</option>
                                    <option>Bimbel</option>
                                    <option>Kampus</option>
                                    <option>SMA</option>
                                    <option>SMP</option>
                                </select>
                            </div>

                            {visitDetails.institution === 'SMA' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Paket Kunjungan</label>
                                    <select
                                        name="mealOption"
                                        value={visitDetails.mealOption}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="snack">Studi Banding (Rp 25.000/orang - Dapat snack)</option>
                                        <option value="lunch_snack">Studi Banding (Rp 50.000/orang - Makan siang + snack)</option>
                                    </select>
                                </div>
                            )}
                            
                            {visitDetails.totalCost > 0 && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                                    Total Biaya Kunjungan: <span className="font-bold">Rp {visitDetails.totalCost.toLocaleString('id-ID')}</span>
                                </div>
                            )}

                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Spesial request dan pertanyaan</label><textarea rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tuliskan Request anda"></textarea></div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Dokumen Pendukung</label>
                                <input 
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {uploadedFile && (
                                    <p className="mt-2 text-sm text-green-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                        File berhasil diunggah: <span className="font-medium ml-1">{uploadedFile.name}</span>
                                    </p>
                                )}
                            </div>
                            
                            <button
                                type="submit"
                                disabled={!selectedDate || availableSessions.length === 0}
                                className={`w-full text-white py-3 px-6 rounded-lg font-medium transition-colors ${selectedDate && availableSessions.length > 0 ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {selectedDate ? (availableSessions.length > 0 ? 'Jadwalkan Kunjungan' : 'Tidak ada sesi tersedia pada tanggal ini') : 'Pilih Tanggal untuk Melanjutkan'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* School Events Section */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Informasi Event Sekolah</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-sm font-medium text-red-800">Tidak ada Visit tersedia</span></div>
                            <h4 className="font-semibold text-gray-900">DiesNatalis Moklet 33</h4>
                            <p className="text-sm text-gray-600">Agustus 21, 2025</p>
                            <p className="text-sm text-gray-500 mt-1">Merayakan ulang tahun sekolah ke 33</p>
                        </div>
                        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-sm font-medium text-red-800">Tidak ada Visit tersedia</span></div>
                            <h4 className="font-semibold text-gray-900">DiesNatalis Moklet 33</h4>
                            <p className="text-sm text-gray-600">Agustus 21, 2025</p>
                            <p className="text-sm text-gray-500 mt-1">Merayakan ulang tahun sekolah ke 33</p>
                        </div>
                        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-sm font-medium text-red-800">Tidak ada Visit tersedia</span></div>
                            <h4 className="font-semibold text-gray-900">DiesNatalis Moklet 33</h4>
                            <p className="text-sm text-gray-600">Agustus 21, 2025</p>
                            <p className="text-sm text-gray-500 mt-1">Merayakan ulang tahun sekolah ke 33</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Pop-up Modal Konfirmasi */}
            {isModalOpen && confirmationData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all duration-300 scale-100">
                        <div className="flex flex-col items-center mb-6">
                            <div className="bg-green-100 text-green-600 p-3 rounded-full mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 text-center">Pendaftaran Berhasil!</h3>
                            <p className="text-gray-600 text-center mt-2">Terima kasih. Jadwal kunjungan Anda telah dikonfirmasi.</p>
                        </div>
                        
                        <div className="space-y-4 text-gray-700">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-semibold">Nama:</span>
                                <span>{confirmationData.firstName} {confirmationData.lastName}</span>
                                <span className="font-semibold">Tanggal Kunjungan:</span>
                                <span>{confirmationData.date}</span>
                                <span className="font-semibold">Sesi:</span>
                                <span>{confirmationData.session}</span>
                                <span className="font-semibold">Instansi:</span>
                                <span>{confirmationData.institution}</span>
                                <span className="font-semibold">Jenis Pengunjung:</span>
                                <span>{confirmationData.visitors}</span>
                                {confirmationData.institution === 'SMA' && (
                                    <>
                                        <span className="font-semibold">Paket:</span>
                                        <span>{confirmationData.mealOption}</span>
                                    </>
                                )}
                            </div>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                                Total Biaya: <span className="font-bold">Rp {confirmationData.totalCost.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={closeModal}
                                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;