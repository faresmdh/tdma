import { Box, Boxes, ChartArea, Info, Play, Pause, RefreshCw, StepForward, StepBack } from "lucide-react"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Progress } from "./ui/progress"
import { useEffect, useState, useRef } from "react"
import { GanttDiagram } from "./GanttDiagram" // Importez le nouveau composant
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"

// Exportez l'interface Station pour qu'elle soit accessible
export interface Station {
    name: string,
    packets: number
}

interface TDMAProps {
    stations: Station[],
    time: number
}

export default function TDMA({ stations, time }: TDMAProps) {
    const maxPackets = Math.max(0, ...stations.map(s => s.packets))
    const totalSlots = maxPackets * stations.length
    
    const [currentSlot, setCurrentSlot] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [progress, setProgress] = useState(0)
    const [transferredPackets, setTransferredPackets] = useState<number[]>(Array(stations.length).fill(0))
    const [isPlaying, setIsPlaying] = useState(false)
    const [showGantt, setShowGantt] = useState(false) // État pour contrôler l'affichage du Gantt
    const timerRef = useRef<number | null>(null)
    
    // Calculate total time and progress
    const totalTime = totalSlots * time
    
    // Calculate which slot belongs to which station
    const getSlotStation = (slotIndex: number) => {
        return slotIndex % stations.length
    }
    
    // Check if current slot should have a packet
    const shouldTransferPacket = (slotIndex: number) => {
        const stationIndex = getSlotStation(slotIndex)
        const station = stations[stationIndex]
        const packetsTransferred = transferredPackets[stationIndex]
        const stationTurn = Math.floor(slotIndex / stations.length)
        
        // Check if station has a packet for this specific turn
        return packetsTransferred <= stationTurn && station.packets > stationTurn
    }
    
    // Calculate packets remaining for each station
    const getRemainingPackets = (stationIndex: number) => {
        return stations[stationIndex].packets - transferredPackets[stationIndex]
    }
    
    // Process a single slot
    const processSlot = (slotIndex: number) => {
        const stationIndex = getSlotStation(slotIndex)
        
        // Transfer packet if station has packets remaining for this turn
        if (shouldTransferPacket(slotIndex)) {
            setTransferredPackets(prev => {
                const newTransferred = [...prev]
                newTransferred[stationIndex] += 1
                return newTransferred
            })
        }
        
        const newElapsedTime = (slotIndex + 1) * time
        setElapsedTime(newElapsedTime)
        setProgress((newElapsedTime / totalTime) * 100)
    }
    
    // Step forward one slot
    const stepForward = () => {
        if (currentSlot < totalSlots) {
            processSlot(currentSlot)
            setCurrentSlot(prev => prev + 1)
        }
    }
    
    // Step backward one slot
    const stepBackward = () => {
        if (currentSlot > 0) {
            const prevSlot = currentSlot - 1
            
            
            // Check if packet was transferred in this slot
            const slotStationIndex = getSlotStation(prevSlot)
            const stationTurn = Math.floor(prevSlot / stations.length)
            
            if (stationTurn < transferredPackets[slotStationIndex]) {
                setTransferredPackets(prev => {
                    const newTransferred = [...prev]
                    newTransferred[slotStationIndex] = Math.max(0, newTransferred[slotStationIndex] - 1)
                    return newTransferred
                })
            }
            
            const newElapsedTime = (currentSlot - 1) * time
            setElapsedTime(newElapsedTime)
            setProgress((newElapsedTime / totalTime) * 100)
            setCurrentSlot(prev => prev - 1)
        }
    }
    
    // Toggle play/pause
    const togglePlay = () => {
        if (isPlaying) {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            setIsPlaying(false)
        } else {
            if (currentSlot >= totalSlots) {
                handleReset()
            }
            setIsPlaying(true)
        }
    }
    
    // Reset everything
    const handleReset = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        setIsPlaying(false)
        setCurrentSlot(0)
        setElapsedTime(0)
        setProgress(0)
        setTransferredPackets(Array(stations.length).fill(0))
    }
    
    // Auto-play logic
    useEffect(() => {
        if (isPlaying && currentSlot < totalSlots) {
            timerRef.current = setTimeout(() => {
                stepForward()
            }, time)
        } else if (currentSlot >= totalSlots) {
            setIsPlaying(false)
        }
        
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [isPlaying, currentSlot, totalSlots])
    
    // Get current station (the one whose turn it is)
    const currentStationIndex = currentSlot < totalSlots ? getSlotStation(currentSlot) : -1
    
    // Create destination slots array
    const destinationSlots = Array.from({ length: totalSlots }, (_, slotIndex) => {
        if (slotIndex < currentSlot) {
            const stationIndex = getSlotStation(slotIndex)
            const stationTurn = Math.floor(slotIndex / stations.length)
            
            // Only show packet if station had a packet for this turn
            if (stationTurn < transferredPackets[stationIndex]) {
                return stationIndex
            }
        }
        return null
    })
    
    // Check if next slot exists
    const hasNextSlot = currentSlot < totalSlots
    const hasPreviousSlot = currentSlot > 0
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-primary font-bold text-lg">TDMA</h1>
                    <p className="text-xs text-muted-foreground">Time Division Multiple Access</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline'><Info /> Sur TDMA</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>TDMA (Time Division Multiple Access)</DialogTitle>
                                <DialogDescription>Chaque station a le droit a un laps de temps.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose>
                                    <Button variant='outline'>Fermer</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    
                    {/* Bouton pour ouvrir le diagramme de Gantt dans un Sheet */}
                    <Sheet open={showGantt} onOpenChange={setShowGantt}>
                        <SheetTrigger asChild>
                            <Button onClick={() => setShowGantt(true)}>
                                <ChartArea /> Diagramme de Gantt
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="p-8 min-w-[calc(100%-400px)] sm:max-w-4xl overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Diagramme de Gantt - TDMA</SheetTitle>
                                <SheetDescription>
                                    Visualisation des tranches de temps allouées à chaque station
                                </SheetDescription>
                            </SheetHeader>
                            <div>
                                <GanttDiagram
                                    stations={stations}
                                    timePerSlot={time}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <Separator />
            
            {/* Stations list */}
            <div className="flex flex-col gap-2">
                {stations.map((s, idx) => {
                    const remainingPackets = getRemainingPackets(idx)
                    
                    return (
                        <div key={s.name} className="flex gap-4 items-center">
                            <Badge className={`
                                h-10 transition-all duration-300
                                ${idx === currentStationIndex ? 'ring-2 ring-offset-2 ring-primary bg-opacity-100' : 'bg-opacity-80'}
                                ${idx === 0 ? "bg-red-500" 
                                    : idx === 1 ? "bg-purple-500"
                                    : idx === 2 ? "bg-green-500"
                                    : idx === 3 ? "bg-blue-500"
                                    : "bg-yellow-500"}
                            `}>
                                <Boxes />{s.name}
                            </Badge>
                            <div className="flex gap-2 items-center">
                                {Array.from({ length: remainingPackets }).map((_, i) => (
                                    <Box key={i} className={`
                                        ${idx === 0 ? "text-red-500"
                                            : idx === 1 ? "text-purple-500"
                                            : idx === 2 ? "text-green-500"
                                            : idx === 3 ? "text-blue-500"
                                            : "text-yellow-500"}
                                    `} />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
            
            <Separator />
            
            {/* Destination grid (horizontal layout) */}
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium">Destination</h3>
                <div className="flex flex-wrap gap-2">
                    {destinationSlots.map((slotStationIndex, slotIndex) => {
                        const isCurrentSlot = slotIndex === currentSlot
                        const isPastSlot = slotIndex < currentSlot
                        
                        return (
                            <div
                                key={slotIndex}
                                className={`
                                    w-10 h-10 flex items-center justify-center
                                    border-2 rounded transition-all duration-300
                                    ${isCurrentSlot ? 'border-primary border-opacity-100 bg-primary/10' 
                                     : isPastSlot ? 'border-muted-foreground/30 bg-muted/50' 
                                     : 'border-input bg-input/50'}
                                `}
                            >
                                {slotStationIndex !== null && (
                                    <Box className={`
                                        ${slotStationIndex === 0 ? "text-red-500"
                                            : slotStationIndex === 1 ? "text-purple-500"
                                            : slotStationIndex === 2 ? "text-green-500"
                                            : slotStationIndex === 3 ? "text-blue-500"
                                            : "text-yellow-500"}
                                        ${isPastSlot ? 'opacity-100' : 'opacity-60'}
                                    `} />
                                )}
                                {isCurrentSlot && slotStationIndex === null && (
                                    <span className="text-xs text-muted-foreground">Vide</span>
                                )}
                            </div>
                        )
                    })}
                </div>
                
                {/* Current station indicator */}
                <div className="text-sm text-muted-foreground">
                    {currentStationIndex >= 0 && currentSlot < totalSlots ? (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                            <span>Lap de station : {stations[currentStationIndex]?.name} (Trame {currentSlot})</span>
                        </div>
                    ) : currentSlot >= totalSlots ? (
                        <span className="text-green-600 font-medium">✓ Transmission Fini</span>
                    ) : null}
                </div>
            </div>
            
            {/* Control Panel */}
            <div className="flex flex-col gap-4 pt-4 border-t">
                
            
                {/* Progress section */}
                <div className="flex flex-col gap-2">
                    <Progress value={progress} />
                    <div className="flex justify-between">
                        <p>{elapsedTime < 1000 ? elapsedTime + ' ms' : elapsedTime/1000 + ' s'}</p>
                        <div className="text-xs text-muted-foreground">
                            Unité de temps: {time < 1000 ? time + ' ms' : time/1000 + ' s'} | Etapes : {currentSlot}/{totalSlots}
                        </div>
                        <p>{Math.round(progress)} %</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                    {/* Reset Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Réinitialiser
                    </Button>
                    
                    {/* Step Backward */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={stepBackward}
                        disabled={!hasPreviousSlot || isPlaying}
                        className="gap-2"
                    >
                        <StepBack className="h-4 w-4" />
                        Retourner
                    </Button>
                    
                    {/* Play/Pause Button */}
                    <Button
                        onClick={togglePlay}
                        className="gap-2 min-w-[100px]"
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="h-4 w-4" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                {currentSlot === 0 ? 'Commencer' : currentSlot >= totalSlots ? 'Recommencer' : 'Résumer'}
                            </>
                        )}
                    </Button>
                    
                    {/* Step Forward */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={stepForward}
                        disabled={!hasNextSlot || isPlaying}
                        className="gap-2"
                    >
                        <StepForward className="h-4 w-4" />
                        Avancer
                    </Button>
                </div>
                
                {/* Status Indicator */}
                <div className="text-center text-sm">
                    {isPlaying && currentSlot < totalSlots && (
                        <div className="text-primary animate-pulse">
                            Auto-playing - Next slot in {time}ms
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}