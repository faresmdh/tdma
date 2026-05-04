import { Box } from "lucide-react"

interface Station {
    name: string,
    packets: number
}

interface GanttDiagramProps {
  stations: Station[]
  timePerSlot: number
}

export function GanttDiagram({ 
  stations, 
  timePerSlot
}: GanttDiagramProps) {
  
  // Calculate total slots needed based on max packets
  const maxPackets = Math.max(0, ...stations.map(s => s.packets))
  const totalSlots = maxPackets * stations.length
  
  // Generate Gantt slots
  const ganttSlots: {
    stationIndex: number
    startTime: number
    endTime: number
    hasPacket: boolean
    slotIndex: number
    stationTurn: number
  }[] = []
  
  // Create slots in the actual temporal order they occur
  for (let slotIndex = 0; slotIndex < totalSlots; slotIndex++) {
    const stationIndex = slotIndex % stations.length
    const stationTurn = Math.floor(slotIndex / stations.length)
    const hasPacket = stationTurn < stations[stationIndex].packets
    
    ganttSlots.push({
      stationIndex,
      startTime: slotIndex * timePerSlot,
      endTime: (slotIndex + 1) * timePerSlot,
      hasPacket,
      slotIndex,
      stationTurn
    })
  }
  
  // Find max time for scaling
  const maxTime = Math.max(...ganttSlots.map(s => s.endTime))
  
  // Create time markers for each slot (trame)
  const timeMarkers = []
  
  // Add marker for time 0
  timeMarkers.push(0)
  
  // Add markers for each trame (slot) - show every slot or every 2nd/3rd slot if too many
  const markerStep = Math.max(1, Math.ceil(totalSlots / 15)) // Show around 15 markers max
  
  for (let slotIndex = 0; slotIndex <= totalSlots; slotIndex++) {
    const time = slotIndex * timePerSlot
    
    // Always include the first and last markers
    if (slotIndex === 0 || slotIndex === totalSlots) {
      if (!timeMarkers.includes(time)) {
        timeMarkers.push(time)
      }
    } 
    // Include markers at regular intervals
    else if (slotIndex % markerStep === 0) {
      timeMarkers.push(time)
    }
  }
  
  // Sort and ensure unique values
  const sortedTimeMarkers = [...new Set(timeMarkers)].sort((a, b) => a - b)
  
  const getStationColor = (index: number) => {
    switch(index % 5) {
      case 0: return "bg-red-500"
      case 1: return "bg-purple-500"
      case 2: return "bg-green-500"
      case 3: return "bg-blue-500"
      default: return "bg-yellow-500"
    }
  }
  
  const getStationTextColor = (index: number) => {
    switch(index % 5) {
      case 0: return "text-red-600"
      case 1: return "text-purple-600"
      case 2: return "text-green-600"
      case 3: return "text-blue-600"
      default: return "text-yellow-600"
    }
  }
  
  return (
    <div className="w-full mt-8">
      {/* Grid layout for Gantt and axes */}
      <div className="relative w-full h-75" 
           style={{ "--station-count": stations.length } as React.CSSProperties}>
        
        <div className="absolute inset-0">
          
          {/* Y-axis (vertical line on the left) */}
          <div className="absolute top-0 bottom-6 start-12 w-px bg-muted-foreground">
            {/* Arrow at top of Y-axis */}
            <div className="absolute -top-2 -start-1.5 w-0 h-0 
                          border-l-[6px] border-r-[6px] border-t-0 border-b-[8px]
                          border-l-transparent border-r-transparent border-t-transparent border-b-muted-foreground" />
          </div>
          
          {/* X-axis (horizontal line at bottom) */}
          <div className="absolute left-12 right-0 bottom-6 h-px bg-muted-foreground">
            {/* Arrow at end of X-axis */}
            <div className="absolute -right-2 -bottom-1.5 w-0 h-0 
                          border-l-[8px] border-r-0 border-b-[6px] border-t-[6px]
                          border-l-muted-foreground border-r-transparent border-b-transparent border-t-transparent" />
          </div>
          
          {/* Station labels on the left (Y-axis) */}
          <div className="absolute start-0 -top-4 bottom-10 flex flex-col justify-between">
            {stations.map((station, index) => (
              <div 
                key={index}
                className="flex items-start gap-2"
                style={{ height: `calc(100% / ${stations.length})` }}
              >
                <Box className={`h-4 w-4 ${getStationTextColor(index)}`} />
                <span className={`text-sm font-medium ${getStationTextColor(index)} whitespace-nowrap`}>
                  {station.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Time markers on X-axis - Now shows each trame */}
          <div className="absolute left-12 right-0 bottom-7 flex justify-between">
            {sortedTimeMarkers.map((time, index) => {
                
              
              return (
                <div 
                  key={index}
                  className="flex flex-col items-center -translate-x-1/2"
                  style={{ 
                    left: `${(time / maxTime) * 100}%`,
                    position: 'absolute' as const 
                  }}
                >
                  <div className="w-px h-2 bg-muted-foreground"></div>
                  <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                    {time < 1000 ? `${time}ms` : `${(time/1000).toFixed(1)}s`}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Grid lines (vertical) for each trame */}
          <div className="absolute left-12 right-0 top-0 bottom-6">
            {ganttSlots.map((slot, index) => {
              // Show grid line at the start of each slot
              const leftPercent = (slot.startTime / maxTime) * 100
              
              return (
                <div 
                  key={`grid-${index}`}
                  className="absolute w-px h-full bg-ring opacity-10"
                  style={{ 
                    left: `${leftPercent}%`
                  }}
                ></div>
              )
            })}
            
            {/* Add final grid line at the end */}
            <div 
              className="absolute w-px h-full bg-ring opacity-10"
              style={{ 
                left: `100%`
              }}
            ></div>
          </div>
          
          {/* Station rows with horizontal grid lines */}
          <div className="absolute left-12 right-0 top-0 bottom-6">
            {stations.map((_, index) => (
              <div 
                key={index}
                className="absolute w-full border-t border-dashed border-ring opacity-20"
                style={{ 
                  top: `${(index + 1) * (100 / stations.length)}%` 
                }}
              ></div>
            ))}
          </div>
          
          {/* Gantt slots (trames) */}
          <div className="absolute left-12 right-0 top-0 bottom-6">
            {ganttSlots.map((slot) => {
              if (!slot.hasPacket) return null
              
              const stationIndex = slot.stationIndex
              const left = (slot.startTime / maxTime) * 100
              const width = ((slot.endTime - slot.startTime) / maxTime) * 100
              
              // Calculate vertical position for this station's row
              const rowHeight = 100 / stations.length
              const top = stationIndex * rowHeight + (rowHeight / 2) - 10
              
              return (
                <div
                  key={slot.slotIndex}
                  className="absolute"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${top}%`
                  }}
                >
                  {/* Line representing the trame */}
                  <div className={`absolute top-1/2 -translate-y-1/2 w-full h-px ${getStationColor(stationIndex)} opacity-100`}>
                    {/* Start dot */}
                    <div className={`absolute -left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${getStationColor(stationIndex)}`} />
                    
                    {/* End dot */}
                    <div className={`absolute -right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${getStationColor(stationIndex)}`} />
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Additional grid lines for better readability - dotted lines between stations */}
          <div className="absolute left-12 right-0 top-0 bottom-6">
            {stations.map((_, index) => {
              // Center line for each station row
              const rowHeight = 100 / stations.length
              const top = index * rowHeight + (rowHeight / 2)
              
              return (
                <div 
                  key={`center-${index}`}
                  className="absolute w-full border-t border-dotted border-ring opacity-10"
                  style={{ 
                    top: `${top}%`
                  }}
                ></div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}