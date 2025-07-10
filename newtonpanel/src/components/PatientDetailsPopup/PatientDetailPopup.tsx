import React, { useState } from "react";
import SessionStatisticsButton from "./SessionStatisticsButton";
import SessionStatisticsPopup from "./SessionStatisticsPopup";

// Örnek veri tipleri (bunları kendi utils/sessionHelpers.ts dosyandan import edebilirsin)
import { SessionData, GameConfigData, GameResultData } from "../../utils/sessionHelpers";

// Örnek props tipi
type Props = {
    sessions: SessionData[];
    gameConfigs: { [id: string]: GameConfigData };
    gameResults: { [sessionID: string]: GameResultData };
};

const PatientDetailsPopup: React.FC<Props> = ({ sessions, gameConfigs, gameResults }) => {
    const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Seçili seansın config ve result'ını bul
    const gameConfig =
        selectedSession && selectedSession.gameConfigID
            ? gameConfigs[selectedSession.gameConfigID]
            : null;

    // sessionID ile ilgili sonucu bul (örnek: session.sessionID ya da başka bir unique id)
    const gameResult =
        selectedSession && selectedSession.sessionID
            ? gameResults[selectedSession.sessionID]
            : null;

    return (
        <div className="patient-details-popup" style={{ padding: 24 }}>
            <h2>Seanslar</h2>
            <div>
                {sessions.map((session, idx) => (
                    <div
                        key={idx}
                        style={{
                            border: "1px solid #eee",
                            marginBottom: 8,
                            padding: 8,
                            background: selectedSession === session ? "#f5f5f5" : "#fff",
                            cursor: "pointer",
                        }}
                        onClick={() => setSelectedSession(session)}
                    >
                        <div>
                            <b>Tarih:</b> {session.date} <b>Oyun:</b> {session.gameType}
                        </div>
                        {/* İstersen burada başka seans bilgileri de gösterebilirsin */}
                    </div>
                ))}
            </div>

            {/* Seans detayları ve Oyun İstatistikleri butonu */}
            {selectedSession && (
                <div style={{ marginTop: 16 }}>
                    <h3>Seans Detayları</h3>
                    <div>
                        <div>
                            <b>Başlangıç Saati: </b> {selectedSession.startTime}
                        </div>
                        <div>
                            <b>Oyun Tipi: </b> {selectedSession.gameType}
                        </div>
                        {/* Diğer detaylar */}
                    </div>
                    <SessionStatisticsButton
                        onClick={() => setModalOpen(true)}
                        disabled={!gameConfig || !gameResult}
                    />
                </div>
            )}

            {/* Oyun İstatistikleri Pop-up */}
            {selectedSession && gameConfig && gameResult && (
                <SessionStatisticsPopup
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    session={selectedSession}
                    gameConfig={gameConfig}
                    gameResult={gameResult}
                />
            )}
        </div>
    );
};

export default PatientDetailsPopup;