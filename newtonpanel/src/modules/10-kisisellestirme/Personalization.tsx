import React from 'react';

const Personalization = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Kişiselleştirme Parametreleri</h2>
      <label>
        Tema:
        <select>
          <option>Açık</option>
          <option>Koyu</option>
        </select>
      </label>
      <br />
      <label>
        Bildirimler:
        <input type="checkbox" /> Aktif
      </label>
      <button>Kaydet</button>
    </div>
  );
};

export default Personalization;