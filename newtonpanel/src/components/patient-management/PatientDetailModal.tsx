// src/components/patient-management/PatientDetailModal.tsx
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import {
    BarChart3, Loader2, ArrowUpDown, X, User, Activity, FileText,
    ChevronDown, Gamepad2, Clock, CheckCircle, XCircle, Target, Trophy, GitBranch, Stethoscope, AreaChart
} from 'lucide-react';
import { Patient, Session, GameResult, Rom } from '@/types/firebase';
import { GameStatisticsModal } from '../statistics/GameStatisticsModal';

import { getAllSessions } from '@/services/sessionService';
import { getAllGameResults } from '@/services/gameResultService';
import { getRomById } from '@/services/romService';

// ===================================================================
//                        Detay Kartı Bileşeni
// ===================================================================
// Bu alt bileşende bir değişiklik yok.
function SessionDetailCard({ session, gameResult, onShowStats }: { session: Session; gameResult: GameResult | undefined, onShowStats: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getGameName = (gameType: string | undefined) => {
        if (gameType === 'appleGame') return { name: 'Elma Toplama', icon: Target };
        if (gameType === 'fingerDance') return { name: 'Piyano Oyunu', icon: Gamepad2 };
        return { name: 'Bilinmiyor', icon: Gamepad2 };
    };

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return 'N/A';
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);
        return `${duration > 0 ? duration : 0} dk`;
    };

    const GameDetails = () => {
        if (!gameResult) return <p className="text-xs text-muted-foreground">Oyun sonucu bulunamadı.</p>;
        if (gameResult.gameType === 'appleGame' && 'apples' in gameResult) {
            const correct = gameResult.apples?.filter(a => a.status === 'picked').length || 0;
            const missed = gameResult.apples?.filter(a => a.status === 'missed').length || 0;
            const dropped = gameResult.apples?.filter(a => a.status === 'dropped').length || 0;
            return (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-xs">
                    <p className="flex items-center gap-1.5"><strong><CheckCircle className="w-3 h-3 text-green-500"/>Doğru Sepet:</strong> {correct}</p>
                    <p className="flex items-center gap-1.5"><strong><XCircle className="w-3 h-3 text-red-500"/>Kaçırılan:</strong> {missed}</p>
                    <p className="flex items-center gap-1.5"><strong><GitBranch className="w-3 h-3 text-yellow-500"/>Yanlış Sepet:</strong> {dropped}</p>
                    <p className="flex items-center gap-1.5"><strong><Trophy className="w-3 h-3 text-purple-500"/>Başarı:</strong> %{gameResult.successRate?.toFixed(0) || 0}</p>
                </div>
            );
        }
        if (gameResult.gameType === 'fingerDance' && 'notes' in gameResult) {
            const correct = gameResult.notes?.filter(n => n.hit).length || 0;
            const mistakes = gameResult.mistakes || 0;
            return (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-xs">
                    <p className="flex items-center gap-1.5"><strong><CheckCircle className="w-3 h-3 text-green-500"/>Doğru Nota:</strong> {correct}</p>
                    <p className="flex items-center gap-1.5"><strong><XCircle className="w-3 h-3 text-red-500"/>Hatalı Nota:</strong> {mistakes}</p>
                    <p className="flex items-center gap-1.5"><strong><GitBranch className="w-3 h-3 text-yellow-500"/>Maks. Kombo:</strong> {gameResult.combo || 0}</p>
                    <p className="flex items-center gap-1.5"><strong><Trophy className="w-3 h-3 text-purple-500"/>Skor:</strong> {gameResult.score || 0}</p>
                </div>
            );
        }
        return null;
    }

    const { name: gameName, icon: GameIcon } = getGameName(session.gameType);

    return (
        <Card className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'shadow-md border-primary' : 'shadow-sm'}`}>
            <div className="p-3 flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <GameIcon className="w-5 h-5 text-primary" />
                    <div>
                        <p className="font-semibold text-sm">{gameName}</p>
                        <p className="text-xs text-muted-foreground">{session.date}</p>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <CardContent className="p-3 pt-0 animate-in fade-in-50">
                    <div className="border-t pt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                            <p className="flex items-center gap-1.5"><strong><Clock className="w-3 h-3"/> Başlangıç:</strong> {session.startTime}</p>
                            <p className="flex items-center gap-1.5"><strong><Clock className="w-3 h-3"/> Bitiş:</strong> {session.endTime}</p>
                            <p className="flex items-center gap-1.5"><strong><Activity className="w-3 h-3"/> Süre:</strong> {calculateDuration(session.startTime, session.endTime)}</p>
                            <p className="flex items-center gap-1.5"><strong><Trophy className="w-3 h-3"/> Skor:</strong> {gameResult?.score || 'N/A'}</p>
                        </div>
                        <div className="border-t pt-2"><GameDetails /></div>
                        {gameResult && (
                            <div className="flex justify-end pt-2">
                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onShowStats(); }}>
                                    <AreaChart className="w-4 h-4 mr-2"/>
                                    Oyun İstatistikleri
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}


// ===================================================================
//                         Ana Modal Bileşeni
// ===================================================================
interface PatientDetailModalProps {
    patient: Patient | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onNavigateToPerformance: (patientId: string) => void;
}

export function PatientDetailModal({ patient, open, onOpenChange, onNavigateToPerformance }: PatientDetailModalProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [gameResults, setGameResults] = useState<GameResult[]>([]);
    const [romData, setRomData] = useState<Rom | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [selectedSessionData, setSelectedSessionData] = useState<{session: Session, gameResult: GameResult, rom: Rom | null} | null>(null);

    useEffect(() => {
        if (open && patient) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [allSessions, allResults, rom] = await Promise.all([
                        getAllSessions(),
                        getAllGameResults(),
                        patient.romID ? getRomById(patient.romID) : Promise.resolve(null)
                    ]);

                    const patientSessionIds = new Set(Object.keys(patient.sessions || {}));
                    setSessions(allSessions.filter(s => patientSessionIds.has(s.id)));
                    setGameResults(allResults);
                    setRomData(rom);
                } catch (error) {
                    console.error("Detay verileri çekilirken hata:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [open, patient]);

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (sortOrder === 'newest') return dateB - dateA;
            return dateA - dateB;
        });
    }, [sessions, sortOrder]);

    const handleShowStats = (session: Session, gameResult: GameResult) => {
        setSelectedSessionData({ session, gameResult, rom: romData });
        setStatsModalOpen(true);
    };

    const handleNavigate = () => {
        if(patient) {
            onNavigateToPerformance(patient.id);
            onOpenChange(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    showCloseButton={false}
                    className="h-[90vh] flex flex-col p-0"
                    style={{ width: 'calc(1.8 * 90vh)', maxWidth: '95vw' }}
                >
                    <DialogHeader className="p-6 flex-shrink-0 border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">{patient?.name}</DialogTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleNavigate} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Performans Analizine Git
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-grow p-6 overflow-hidden bg-gray-50/50 dark:bg-black/20 flex flex-col md:flex-row gap-6">
                        {/* Sol Panel: Bilgiler */}
                        <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col gap-6 overflow-y-auto">
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-blue-500"/>Hasta Bilgileri</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-3">
                                    <p><strong>Teşhis:</strong> <Badge variant="secondary">{patient?.diagnosis}</Badge></p>
                                    <p><strong>Yaş:</strong> {patient?.age}</p>
                                    <p><strong>Cinsiyet:</strong> {patient?.isFemale ? 'Kadın' : 'Erkek'}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-green-500"/>ROM Bilgileri</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    {romData ? (
                                        <>
                                            <p><strong>Sol Kol Menzili:</strong> {romData.arm.leftSpace} cm</p>
                                            <p><strong>Sağ Kol Menzili:</strong> {romData.arm.rightSpace} cm</p>
                                        </>
                                    ) : <p className="text-muted-foreground">ROM bilgisi bulunamadı.</p>}
                                </CardContent>
                            </Card>
                            <Card className="flex-grow">
                                <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500"/>Notlar</CardTitle></CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    {patient?.note || 'Bu hasta için eklenmiş bir not bulunmuyor.'}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sağ Panel: Seanslar */}
                        <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                <h3 className="font-semibold text-lg">Geçmiş Seanslar ({sessions.length})</h3>
                                <Select value={sortOrder} onValueChange={(v: 'newest' | 'oldest') => setSortOrder(v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <ArrowUpDown className="mr-2 h-4 w-4" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Yeniden Eskiye</SelectItem>
                                        <SelectItem value="oldest">Eskiden Yeniye</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2">
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /> <p className="ml-2 text-muted-foreground">Seanslar Yükleniyor...</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedSessions.length > 0 ? sortedSessions.map(session => {
                                            // ==========================================================
                                            // ↓↓↓ EŞLEŞTİRME MANTIĞI DÜZELTMESİ BURADA ↓↓↓
                                            // ==========================================================
                                            // Önce tam ID ile eşleştirmeye çalış, olmazsa oyun tipine göre ilk bulduğunu al.
                                            let result = gameResults.find(r => session.id.endsWith(r.sessionID));
                                            if (!result) {
                                                result = gameResults.find(r => r.gameType === session.gameType);
                                            }

                                            // 'result' undefined ise bile butonu göstermemek için kartı render et ama butonu gösterme
                                            return <SessionDetailCard
                                                key={session.id}
                                                session={session}
                                                gameResult={result}
                                                onShowStats={() => result && handleShowStats(session, result)}
                                            />
                                        }) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-white dark:bg-gray-800/50 rounded-lg border-2 border-dashed">
                                                <Stethoscope className="w-12 h-12 mb-4 text-gray-400"/>
                                                <h4 className="font-semibold text-lg">Seans Bulunamadı</h4>
                                                <p className="text-sm max-w-xs">Bu hastaya ait kaydedilmiş bir seans bulunmuyor.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedSessionData && (
                <GameStatisticsModal
                    isOpen={statsModalOpen}
                    onClose={() => setStatsModalOpen(false)}
                    sessionData={selectedSessionData}
                />
            )}
        </>
    );
}
