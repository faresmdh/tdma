import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Moon, Play, StopCircle, Sun } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Label } from "./components/ui/label";
import { Slider } from "./components/ui/slider";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Separator } from "./components/ui/separator";
import TDMA from "./components/TDMA";

interface Station{
    name:string,
    packets:number
}


export function App() {

    const [type,setType] = useState('TDMA')
    const [stationsData,setStationsData] = useState<Station[]>([
        {name:"S1" , packets:1},
        {name:"S2" , packets:1}
    ])
    const [stations,setStations] = useState([2])
    const [time,setTime] = useState([100])
    const [runing,setRuning] = useState(false)
    const [dark,setDark] = useState('light')


    useEffect(()=>{
        const tmpData = []
        for(let i = 0; i < stations[0] ; i++){
            tmpData.push({name:`S${i+1}` , packets:1})
        }
        setStationsData(tmpData)
    },[stations])

return (
    <div className="h-screen flex gap-8 p-4 flex-col md:flex-row">
        <Card className="py-0 w-100 max-h-full overflow-y-auto">
            <CardHeader className="mt-8">
                <CardTitle className="text-primary flex gap-2 items-center font-bold text-2xl">Simulateur des méthodes d'accées statiques</CardTitle>
                <CardDescription>Configurer votre simulation puis cliquer sur commencer.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <Label>Méthode</Label>
                    <Select disabled={runing} value={type} onValueChange={(value)=>setType(value)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selectionner la méthode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TDMA">TDMA</SelectItem>
                            <SelectItem value="FDMA">FDMA</SelectItem>
                            <SelectItem value="CDMA">CDMA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <Label>Nombre des stations</Label>
                        <div className="flex items-center gap-2">
                        <span className="text-lg font-bold px-3 py-1 bg-primary/10 rounded-md">
                            {'0'+stations[0]}
                        </span>
                        </div>
                    </div>
                    <Slider
                        value={stations}
                        onValueChange={setStations}
                        max={5}
                        min={2}
                        step={1}
                        className="w-full"
                        disabled={runing}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <Label>Nombre des trames pour chaque station</Label>
                    <div className="flex flex-col gap-4">
                        {stationsData.map((station,i)=>(
                            <div className="flex gap-2 items-center">
                                <Input 
                                    disabled
                                    placeholder="Nom" 
                                    value={station.name}
                                    onChange={(e)=>{
                                        const updated = [...stationsData]
                                        updated[i] = { ...updated[i], name: e.target.value }
                                        setStationsData(updated)
                                    }}/>
                                <Input 
                                    placeholder="Packets" 
                                    type='number' 
                                    value={station.packets} 
                                    onChange={(e)=>{
                                        const updated = [...stationsData]
                                        updated[i] = {
                                            ...updated[i],
                                            packets: Number(e.target.value),
                                        }
                                        setStationsData(updated)
                                    }}
                                    min={0} 
                                    max={5}
                                    disabled={runing}/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <Label>Unité de temps</Label>
                        <div className="flex items-center gap-2">
                        <span className="text-lg font-bold px-3 py-1 bg-primary/10 rounded-md">
                            {time[0] < 1000 ? time[0]+' ms' : time[0]/1000 + ' s'}
                        </span>
                        </div>
                    </div>
                    <Slider
                        value={time}
                        onValueChange={setTime}
                        max={2000}
                        min={100}
                        step={100}
                        disabled={runing}
                        className="w-full"
                    />
                </div>
            </CardContent>
            
            <CardFooter className="flex-col px-0 sticky bottom-0 bg-card">
                <Separator/>
                <div className="w-full p-4 flex gap-2">
                    <Button variant={runing ? 'destructive' : 'default'} className="flex-1" onClick={()=>setRuning(!runing)}>{
                        runing ? <><StopCircle/>Arreter la simulation</>
                        : <><Play/>Commencer la simulation</>
                    }</Button>
                    <Button size='icon' variant='outline' onClick={()=>{
                        if (dark === 'light') document.body.classList.add('dark')
                        else document.body.classList.remove('dark')
                        setDark(dark === 'light' ? 'dark' : 'light')
                    }}>{dark === 'light' ? <Moon/> : <Sun/>}</Button>
                </div>
            </CardFooter>
        </Card>
        <Card className="flex-1 px-6 overflow-y-auto flex-1">
            {runing && type === 'TDMA' && <TDMA 
                stations={stationsData}
                time={time[0]}/>}
        </Card>
    </div>
);
}

export default App;