import React from 'react';

const AuthExample = () => {
  return (
    <div style={{ padding: 24 }}>
      <h2>Kullanıcı Girişi</h2>
      <form>
        <input type="email" placeholder="E-posta" />
        <input type="password" placeholder="Şifre" />
        <button type="submit">Giriş Yap</button>
      </form>
      <p>OAuth 2.0 ve JWT ile kimlik doğrulama burada uygulanacak.</p>
    </div>
  );
};

export default AuthExample;