import React from "react";

type Props = {
    onClick: () => void;
    disabled?: boolean;
};

const SessionStatisticsButton: React.FC<Props> = ({ onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="statistics-btn">
        Oyun İstatistikleri
    </button>
);

export default SessionStatisticsButton;