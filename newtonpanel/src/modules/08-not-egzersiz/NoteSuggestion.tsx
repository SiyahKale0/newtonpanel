import React from 'react';

const NoteSuggestion = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Not ve Egzersiz Önerisi</h2>
      <textarea placeholder="Not ekle..." style={{ width: '100%', minHeight: 80 }} />
      <button>Not Kaydet</button>
      <h3>Egzersiz Önerisi</h3>
      <input type="text" placeholder="Egzersiz adı" />
      <button>Öner</button>
    </div>
  );
};

export default NoteSuggestion;