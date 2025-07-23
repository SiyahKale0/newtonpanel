import React from 'react';
// Chart.js veya D3.js entegrasyonu için uygun importlar eklenebilir

const ChartExample = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Örnek Grafik</h2>
      <div style={{ width: 400, height: 200, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Chart.js veya D3.js ile grafik burada render edilecek */}
        <span>Grafik alanı</span>
      </div>
    </div>
  );
};

export default ChartExample;