export function getHeatMapColors(gameResult: any) {
    // notes: {finger, hit, ...}
    const usage: Record<number, number> = {};
    if (gameResult?.notes) {
        gameResult.notes.forEach((n: any) => {
            usage[n.finger] = (usage[n.finger] || 0) + 1;
        });
    }
    const max = Math.max(1, ...Object.values(usage));
    return [1,2,3,4,5].reduce((acc, finger) => {
        if (!usage[finger]) acc[finger] = "#ddd";
        else if (usage[finger] < max/2) acc[finger] = "#ffa";
        else acc[finger] = "#f00";
        return acc;
    }, {} as Record<number, string>);
}

export function getFingerStats(gameResult: any, finger: number) {
    const notes = (gameResult?.notes || []).filter((n: any) => n.finger === finger);
    return {
        minRom: 0, // ROM datası yoksa 0
        maxRom: 90, // ROM datası yoksa 90
        correctCount: notes.filter((n: any) => n.hit).length,
        missedCount: notes.filter((n: any) => !n.hit).length,
    };
}