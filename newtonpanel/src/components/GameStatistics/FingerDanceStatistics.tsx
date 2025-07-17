import React, { useState } from "react";
import HandModel from "../3d-models/materials";
import { getFingerStats, getHeatMapColors } from "./HeatMapUtils";
import { GameResultData, GameConfigData, SessionData } from "../../utils/sessionHelpers";

type Props = {
    session: SessionData;
    gameConfig: GameConfigData;
    gameResult: GameResultData;
};

const fingers = [1, 2, 3, 4, 5]; // 1: Baş parmak, 5: Küçük parmak

const FingerDanceStatistics: React.FC<Props> = ({ session, gameConfig, gameResult }) => {
    const [selectedFinger, setSelectedFinger] = useState<number | null>(null);

    const heatMap = getHeatMapColors(gameResult);

    return (
        <div style={{ display: "flex", flexDirection: "row", gap: 40 }}>
            <div>
                <HandModel
                    heatMap={heatMap}
                    onFingerClick={setSelectedFinger}
                />
                <div style={{ marginTop: 10 }}>
                    <span style={{ background: "#ddd", padding: 4, marginRight: 8 }}>Kullanılmayan</span>
                    <span style={{ background: "#ffa", padding: 4, marginRight: 8 }}>Az Kullanılan</span>
                    <span style={{ background: "#f00", padding: 4, color: "#fff" }}>Çok Kullanılan</span>
                </div>
            </div>
            <div>
                {selectedFinger ? (
                    <FingerStats
                        finger={selectedFinger}
                        stats={getFingerStats(gameResult, selectedFinger)}
                    />
                ) : (
                    <div>Lütfen bir parmak seçin</div>
                )}
            </div>
        </div>
    );
};

const FingerStats = ({ finger, stats }: { finger: number; stats: any }) => (
    <div>
        <h4>{finger}. Parmak</h4>
        <div>Min ROM: {stats.minRom}°</div>
        <div>Max ROM: {stats.maxRom}°</div>
        <div>Doğru Nota: {stats.correctCount}</div>
        <div>Kaçırılan Nota: {stats.missedCount}</div>
    </div>
);

export default FingerDanceStatistics;