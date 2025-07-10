import React from "react";
import MovementChart from "./chart/MovementChart";
import { getAppleGameRomStats } from "../../utils/sessionHelpers";
import { GameResultData, GameConfigData, SessionData } from "../../utils/sessionHelpers";

type Props = {
    session: SessionData;
    gameConfig: GameConfigData;
    gameResult: GameResultData;
};

const AppleGameStatistics: React.FC<Props> = ({ session, gameConfig, gameResult }) => {
    const { leftArm, rightArm } = getAppleGameRomStats(session);

    // position_log.json datasını MovementChart'a prop olarak geçmelisin
    return (
        <div>
            <h4>ROM Ölçümleri</h4>
            <div>Sol Kol: Min {leftArm?.min}° - Max {leftArm?.max}°</div>
            <div>Sağ Kol: Min {rightArm?.min}° - Max {rightArm?.max}°</div>
            <h4>Hareket Grafiği</h4>
            <MovementChart />
        </div>
    );
};

export default AppleGameStatistics;