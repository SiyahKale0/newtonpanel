import React from 'react';

const PatientManager = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Hasta Yönetimi</h2>
      <button>Hasta Ekle</button>
      <button>Hasta Düzenle</button>
      <button>Hasta Sil</button>
      <h3>Seans Geçmişi</h3>
      <ul>
        <li>Seans 1 - 01.01.2024</li>
        <li>Seans 2 - 05.01.2024</li>
      </ul>
    </div>
  );
};

export default PatientManager;