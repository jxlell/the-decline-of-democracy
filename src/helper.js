import * as d3 from 'd3';

function getAttributes(section, sel){
    let currentYear = 2020
    let selected = []
    let weightedMap = [1,1,1,1,1]
    if(section===1){currentYear = 2006}
    if(section===2){currentYear = 2020}
    if(section===3){currentYear = 2020}
    if(section===10){selected=["mli", "twn"]; currentYear = 2020}
    if(section===11){selected=["mli", "twn"]; currentYear = 2019}
    if(section===12){selected=["mli", "twn", "tgo"]; currentYear = 2020}
    if(section===13){selected=["sgp", "nor"]; weightedMap=[1,1,1,1,1]}
    if(section===14){weightedMap=[0,1,0,1,1]; currentYear = 2020;selected=["sgp", "nor"];}
    if(section===15){selected = sel}
    if(section>15){selected = sel}
    return [currentYear, selected, weightedMap]
}

function getFill(d){
    if(Number(d['Democracy index (EIU)'])<40){return "#e94548"}
    else if(Number(d['Democracy index (EIU)'])<60){return "#f9ae4d"}
    else if(Number(d['Democracy index (EIU)'])<80){return "#90bf6d"}
    else if(Number(d['Democracy index (EIU)'])<100){return "#577591"}
    else{return "#fff"}
}

function getCurrentData(demData, currentYear, weightedMap, showSorted){
    var TMPcurrentData = demData[currentYear-2006][1].slice().sort((a,b) => 
        d3.descending(Number(a['Democracy index (EIU)']), Number(b['Democracy index (EIU)'])))

        var weightedData = []
        TMPcurrentData.forEach(el => {
            var weighted = ""
            if(weightedMap===[0,0,0,0,0]||weightedMap===[1,1,1,1,1]){weighted = el['Democracy index (EIU)']}
            else{
                //noch runden!
                weighted = (Math.round(Number(
                (weightedMap[0]*Number(el['Electoral pluralism index (EIU)'])+
                weightedMap[1]*Number(el['Government index (EIU)'])+
                weightedMap[2]*Number(el['Political participation index(EIU)'])+
                weightedMap[3]*Number(el['Political culture index (EIU)'])+
                weightedMap[4]*Number(el['Civil liberties index (EIU)'])) / 
                (d3.max([1, (weightedMap[0]*1+weightedMap[1]*1+weightedMap[2]*1+weightedMap[3]*1+weightedMap[4]*1)]))*10))/10).toString().slice(0,4)
            } 
            el.weightedIndex = weighted; 
            weightedData.push(el)})
        if(!showSorted){return weightedData.sort((a,b) => d3.descending(Number(a.weightedIndex), Number(b.weightedIndex)))} 
        else{return weightedData.sort((a,b) => d3.ascending(a.name, b.name))}
}


export {getAttributes, getFill, getCurrentData};