// Firebase veri yapısını işlemek için yardımcı fonksiyonlar

export type SessionData = any;
export type GameConfigData = any;
export type GameResultData = any;

export function getAppleGameRomStats(session: SessionData) {
    // Burada firebase'den ilgili ROM datasını çekip döndür
    return {
        leftArm: { min: 10, max: 100 },
        rightArm: { min: 15, max: 110 }
    };
}

// Diğer yardımcı fonksiyonları burada ekleyebilirsin