import React, { useEffect } from 'react';
import './App.css'; // Import file CSS yang akan kita buat
import checklistImage from './images/1.png';
import checklistImage2 from './images/2.png';
import checklistImage3 from './images/3.png';
import checklistImage4 from './images/4.png';


const Step = ({ stepNumber, title, description, imageSrc, imageAlt, direction }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger saat 10% elemen terlihat
      }
    );

    const elements = document.querySelectorAll('.fade-in-left, .fade-in-right');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
  

  return (
    <div className={` relative w-full flex flex-col md:items-center mb-20 ${direction === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      <div className={`md:w-1/2 ${direction === 'right' ? 'md:pl-8' : 'md:pr-8'} ${direction === 'right' ? 'fade-in-right' : 'fade-in-left'}`}>
        <div className={`text-center mb-3 md:mb-0 ${direction === 'right' ? 'md:text-left' : 'md:text-right'}`}>
          <h3 className="text-lg font-bold">Langkah {stepNumber}</h3>
          <h4 className="text-red-700 text-xl font-bold">{title}</h4>
          <p className={`text-slate-500 mt-2 max-w-md ${direction === 'right' ? 'md:mr-auto' : 'md:ml-auto'}`}>
            {description}
          </p>
        </div>
      </div>
      <div className="step-dot"></div>
      <div className={`md:w-1/2 flex justify-center ${direction === 'right' ? 'md:justify-end' : 'md:justify-start'}`}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-36 h-36 m-10 object-contain"
          onError={(e) => {
            e.target.onerror = null;
            if (e.target.src.includes('b4c933ba')) {
                e.target.src = 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/6d781152-822f-4d30-97d8-c10ac3d17e5e.png';
            } else {
                e.target.src = 'https://placehold.co/150x150?text=Image+not+found';
            }
          }}
        />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center px-4 py-12 font-sans text-slate-800">
      <header className="mb-12 max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold mb-2">Alur <span className="text-red-700">Pendaftaran</span></h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">Berikut alur pendaftaran jadwal kunjungan di sekolah secara mudah dan terstruktur</p>
      </header>

      <main className="relative timeline max-w-5xl w-full">
        <Step
          stepNumber={1}
          title="Cek Ketersediaan Jadwal & Pilih Tanggal"
          description="Pastikan tanggal kunjungan yang Anda inginkan tersedia pada kalender kunjungan sekolah yang disediakan."
          imageSrc={checklistImage}
          imageAlt="Ilustrasi kalender digital dengan pilihan tanggal kunjungan sekolah dengan warna biru dan putih, desain modern dan profesional"
          direction="left"
        />
        <Step
          stepNumber={2}
          title="Isi Formulir Pendaftaran"
          description="Lengkapi data diri dan informasi kunjungan secara lengkap dan jelas melalui formulir pendaftaran yang disediakan."
          imageSrc={checklistImage2}
          imageAlt="Ilustrasi seseorang sedang mengisi formulir pada laptop modern dengan latar berwarna biru dan putih, desain ilustratif profesional"
          direction="right"
        />
        <Step
          stepNumber={4}
          title="Upload Berkas Pendukung"
          description="Jika diperlukan, unggah berkas pendukung seperti surat pengantar atau identitas diri sesuai dengan ketentuan yang berlaku."
          imageSrc={checklistImage3}
          imageAlt="Ilustrasi notifikasi konfirmasi jadwal kunjungan dengan icon centang hijau dan latar belakang biru muda, desain bersih dan sehari-hari"
          direction="left"
        />
        <Step
          stepNumber={3}
          title="Konfirmasi & Verifikasi Data"
          description="Setelah mengisi formulir, tunggu konfirmasi dari pihak sekolah melalui email atau telepon untuk memverifikasi data dan jadwal kunjungan."
          imageSrc={checklistImage4}
          imageAlt="Gambar ilustrasi anak-anak dan orang tua sedang mengunjungi sekolah dengan bangunan sekolah biru dan hijau di latar belakang, suasana ceria dan welcoming"
          direction="right"
        />
      </main>
    </div>
  );
};

export default App;