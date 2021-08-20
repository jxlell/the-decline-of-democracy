import * as d3 from 'd3';
import { drawChart } from './index.js';

function drawGlyphs(svg, section, currentData, indexScaleHorizontal, diffArrScale, polyScale, height, getFill, getX, getY, dark, light, tooltip, selected, brushSel, x_horizontalTransform, x_linechart_transform, y_linechart_transform, radius, normvec, showDiffGlyphs, showNumberGlyphs, showShapeGlyphs){
    var strokes = d3.select(".strokegroup").selectAll("circle")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("circle").attr("radius", 0).attr("stroke", "#353537").attr("cx", (d,i) => getX(d,i)).attr("cy", (d,i) => getY(d,i)).style("fill", light))
            .transition("render").duration(1000)
            .attr("r", () => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: return radius
                    default: return 0
                }
            })
            .attr("id", d => "stroke_"+d.geo)
            .attr("stroke-width", "2px")
            .attr("cx", (d,i) => getX(d,i))
            .attr("cy", (d,i) => getY(d,i))

        var hovercircles = d3.select(".hovercircles").selectAll("circle")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("circle").attr("r", 0).attr("cx", (d,i) => getX(d,i)).attr("cy", (d,i) => getY(d,i)).style("fill", "#fff").style("opacity", 0))
            .on("mouseenter", function(e,d){
                //images from https://github.com/adamoliver/Country-Flags-ISO-3
                tooltip.style("opacity", 1).html("<img src='gif/" + d.geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d.name + ", " + d['Democracy index (EIU)'] + "</text>")
                d3.select("#stroke_"+d.geo).transition("highlight").attr("stroke-width", "5px")
                switch(section){
                    case 13: 
                    case 14: tooltip.style("opacity", 1).html("# " + (currentData.indexOf(d)+1) + "<img src='gif/" + d.geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d.name + ", " + d['Democracy index (EIU)'] + "<br/>" + "weighted index: " + d.weightedIndex +  "</text>")
                    case 15: d3.select("#yearline_"+d.geo).transition().style("opacity", 1);
                            tooltip.style("opacity", 1).style("visibility", "visible").html("# " + (currentData.indexOf(d)+1) + "<img src='gif/" + d.geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d.name + ", " + d['Democracy index (EIU)'] + "<br/>" + "weighted index: " + d.weightedIndex +  "</text>");
                    default: tooltip.style("opacity", 1).style("visibility", "visible").html("# " + (currentData.indexOf(d)+1) + "<img src='gif/" + d.geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d.name + ", " + d['Democracy index (EIU)'] + "<br/>" + "weighted index: " + d.weightedIndex +  "</text>")
                }
            })
            .on("mousemove", function(e,d){
                tooltip.style("left", d3.max([e.pageX-150, 50]) + "px").style("top", e.pageY-100 + "px")
            })
            .on("mouseleave", function(e,d){
                tooltip.style("opacity", 0)
                tooltip.style("visibility", "hidden")
                d3.select("#stroke_"+d.geo).transition("highlight").attr("stroke-width", "2px")  
                switch(section){
                    case 15: //d3.select(".yearlines").selectAll("path").transition("lines").style("opacity", 0.1)
                            if(!selected.includes(d.geo)){d3.select("#yearline_"+d.geo).transition().style("opacity", 0.1)}
                }              
            })
            .on("click", function(e,d){
                if(!selected.includes(d.geo)){
                    selected.push(d.geo)
                }else{
                    selected.splice(selected.indexOf(d.geo), 1)
                }
                drawChart()
            })
            .transition().duration(1000)
            .attr("cx", (d,i) => getX(d,i))
            .attr("cy", (d,i) => getY(d,i))
            .attr("r", radius)
            .style("visibility", () => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: return "visible"
                    default: return "hidden"
                }
            })
            

            

        var labels = svg.select(".labels").selectAll("text")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("text").attr("transform", (d,i) =>  "translate("+getX(d,i) +"," + (getY(d,i)+20) + ")"))
            .text(d => d.geo.toUpperCase())
            .attr("font-size", "0.7em")
            .attr("font-weight", "bold")
            .attr("letter-spacing", "2")
            .attr("font-family", "RubikBold")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("fill", d => !selected.includes(d.geo) ? dark : light)
            .transition()
            .duration(1000)
            .attr("transform", (d,i) => "translate("+getX(d,i)+","+(getY(d,i)+radius+10)+")")
            .attr("opacity", (d) => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: return 1
                    case 15: if(Number(d['Democracy index (EIU)']) > brushSel[0] && Number(d['Democracy index (EIU)']) < brushSel[1]){return 1}else{return 0.1}
                    default: return 0
                }
            })
            .style("visibility", () => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: return "visible"
                    default: return "hidden"
                }
            })

        var numbers = svg.select(".numbers")
            .selectAll("text")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("text").attr("transform", (d,i) => "translate("+getX(d,i)+","+getY(d,i)+")").attr("text-anchor", "middle").attr("alignment-baseline", "middle"))
            .text(d => d['Democracy index (EIU)'].slice(0,4))
            .attr("font-size", "0.7em")
            .attr("font-weight", "bold")
            .style("fill", "#353637")
            .attr("font-family", "RubikBold")
            .transition().duration(1000)
            .attr("opacity", d => {
                switch(section){
                    case 10: 
                    case 11: return 1
                    case 15: if(showNumberGlyphs){return 1}else{return 0}
                    default: return 0
                }
            })
            .style("visibility", () => {
                switch(section){
                    case 10: 
                    case 11: return "visible"
                    case 15: if(showNumberGlyphs){return "visible"}else{return "hidden"}
                    default: return "hidden"
                }
            })
            
            .attr("transform", (d,i) => "translate("+getX(d,i)+","+getY(d,i)+")")


        var labelbgs = d3.select(".labelbgs").selectAll("rect")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("rect")
                .attr("x", (d,i) => getX(d,i)+radius)
                .attr("y", (d,i) => getY(d,i)+radius)
                .attr("opacity", 0)
                .attr("id", d => "bg_"+d.geo))
            .attr("class", "bg")
            .transition().duration(1000)
            .style("fill", d => !selected.includes(d.geo) ? light : dark)
            .attr("x", (d,i) => getX(d,i)-radius)
            .attr("y", (d,i) => getY(d,i)+radius)
            .attr("height", "20")
            .attr("width", radius*2)
            
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("stroke", dark)
            .attr("stroke-width", "3px")
            .attr("visibility", () => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: return "visible"
                    default: return "hidden"
                }
            })
            .style("opacity", () => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: return 1
                    default: return 0;
                }
            })

        var lines = svg.select(".linegroup").selectAll("line")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("line").attr("stroke", dark)
                .style("visibility", "hidden")
                .attr("id", d => "line_"+d.geo)
                .attr("stroke-width", "2px").style("opacity", 1)
                .attr("stroke", dark))
            .style("visibility", () => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: return "visible"
                    default: return "hidden"
                }
            })
            .transition()
            .duration(1000)
            .attr("stroke-width", d => selected.includes(d.geo) ? "2px" : "0px")
            .style("opacity", d => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: if(selected.includes(d.geo) ? 1 : 0){return 1}
                    default: return 0
                }               
            })
            .attr("x1", (d,i) => getX(d,i))
            .attr("y1", (d,i) => getY(d,i))
            .attr("x2", (d,i) => selected.includes(d.geo) ? indexScaleHorizontal(Number(d['Democracy index (EIU)'])) * 0.7 + x_horizontalTransform : getX(d,i))
            .attr("y2", (d,i) => selected.includes(d.geo) ? height*0.96 : getY(d,i))
            

        var colorstrokes = svg.select("g.colorstrokes").selectAll("circle")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("circle")
                .attr("cx", (d,i) => getX(d,i))
                .attr("cy", (d,i) => getY(d,i))
                .style("fill", "none")
                .attr("r", radius)
                .attr("stroke", d => getFill(d))
                .attr("stroke-width", "10px"))
            .transition().duration(1000)
            .attr("stroke", d => getFill(d))
            .attr("cx", (d,i) => getX(d,i))
            .attr("cy", (d,i) => getY(d,i))
            .attr("r", () => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: return radius
                    default: return 0
                }
            })
            .attr("opacity", (d) => {
                switch(section){
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: return 1
                    case 15: if(Number(d['Democracy index (EIU)']) > brushSel[0] && Number(d['Democracy index (EIU)']) < brushSel[1]){return 1}else{return 0.1}
                    default: return 0
                }
            })

        var diff_arrows = svg.select(".diff_arrows")
            .selectAll("polygon")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("polygon")
                .attr("points", (d,i) => Number(getX(d,i)-radius) + " " + getY(d,i) + "," + Number(getX(d,i)+radius) + " " + getY(d,i) + "," + getX(d,i) + " " + Number(getY(d,i))))
            .transition().duration(1000)
            .attr("stroke", dark)
            .attr("stroke-width", "1px")
            .attr("points", (d,i) => 
                Number(getX(d,i)-radius) + " " + getY(d,i) + "," + 
                Number(getX(d,i)+radius) + " " + getY(d,i) + "," + 
                getX(d,i) + " " + Number(getY(d,i)-diffArrScale(Number(d['Change in democracy index (EIU)']))))
            .attr("fill", dark)
            .attr("visibility", () => {
                switch(section){
                    case 12: return "visible"
                    case 15: if(showDiffGlyphs){return "visible"}else{return "hidden"}
                    default: return "hidden"
                }
            })
            .style("opacity", () => {
                switch(section){
                    case 12: return 1
                    case 15: if(showDiffGlyphs){return 1}else{return 0}
                    default: return 0
                }
            })

        var polys = d3.select(".polys").selectAll("polygon")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("polygon").attr("stroke", "#353637").attr("stroke-width", "2").attr("fill", "none").attr("points", (d,i) => getX(d,i) + " " + getY(d,i) + "," + getX(d,i) + " " + getY(d,i) + "," + getX(d,i) + " " + getY(d,i) + "," + getX(d,i) + " " + getY(d,i) + "," + getX(d,i) + " " + getY(d,i)))
            .transition().duration(1000)
            .attr("points", (d,i) => 
                Number(getX(d,i)+polyScale(Number(d['Electoral pluralism index (EIU)']))*normvec[0][0]) + " " + 
                Number(getY(d,i)+polyScale(Number(d['Electoral pluralism index (EIU)']))*normvec[0][1]) + "," + 
                Number(getX(d,i)+polyScale(Number(d['Government index (EIU)']))*normvec[1][0]) + " " + 
                Number(getY(d,i)+polyScale(Number(d['Government index (EIU)']))*normvec[1][1]) + "," + 
                Number(getX(d,i)+polyScale(Number(d['Political participation index(EIU)']))*normvec[2][0]) + " " + 
                Number(getY(d,i)+polyScale(Number(d['Political participation index(EIU)']))*normvec[2][1]) + "," + 
                Number(getX(d,i)+polyScale(Number(d['Political culture index (EIU)']))*normvec[3][0]) + " " + 
                Number(getY(d,i)+polyScale(Number(d['Political culture index (EIU)']))*normvec[3][1]) + "," + 
                Number(getX(d,i)+polyScale(Number(d['Civil liberties index (EIU)']))*normvec[4][0]) + " " + 
                Number(getY(d,i)+polyScale(Number(d['Civil liberties index (EIU)']))*normvec[4][1]))
            .attr("stroke", dark).attr("stroke-width", "2").attr("fill", d => getFill(d))
            .style("visibility", () => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: if(showShapeGlyphs){ return "visible"}else {return "hidden"}
                    default: return "hidden"
                }
            })
            .style("opacity", (d) => {
                switch(section){
                    case 13: 
                    case 14: return 1
                    case 15: if(Number(d['Democracy index (EIU)']) > brushSel[0] && Number(d['Democracy index (EIU)']) < brushSel[1]){return 1}else{return 0.1}
                    default: return 0
                }
            })
        var polybgs = d3.select(".polybgs").selectAll("polygon")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("polygon").attr("stroke", "#353637").attr("stroke-width", "2").attr("fill", "none"))
            .transition().duration(1000)
            .attr("points", (d,i) => 
                Number(getX(d,i)+radius*normvec[0][0]) + " " + 
                Number(getY(d,i)+radius*normvec[0][1]) + "," + 
                Number(getX(d,i)+radius*normvec[1][0]) + " " + 
                Number(getY(d,i)+radius*normvec[1][1]) + "," + 
                Number(getX(d,i)+radius*normvec[2][0]) + " " + 
                Number(getY(d,i)+radius*normvec[2][1]) + "," + 
                Number(getX(d,i)+radius*normvec[3][0]) + " " + 
                Number(getY(d,i)+radius*normvec[3][1]) + "," + 
                Number(getX(d,i)+radius*normvec[4][0]) + " " + 
                Number(getY(d,i)+radius*normvec[4][1]))
            .attr("stroke", "black").attr("stroke-width", "1").attr("fill", "none")
            .style("visibility", () => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: if(showShapeGlyphs){ return "visible"}else {return "hidden"}
                    default: return "hidden"
                }
            })
            .style("opacity", 0.2)
}

export {drawGlyphs};