import * as d3 from 'd3';


function drawRadarChart(svg, section, currentData, radarScale, width, height, getFill, dark, tooltip, selected, brushSel, normvec){
    var radar_polys = svg.select(".radar_polys").selectAll("polygon")
            .data(currentData, d => d.geo)
            .join("polygon")
            .attr("stroke", dark)
            .style("fill", "none")
            .attr("stroke-width", "3px")
            .attr("stroke", d => getFill(d))
            .on("mouseenter", (e,d) => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: tooltip.style("opacity", 1).style("visibility", "visible")
                            .html("<img src='gif/" + d.geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d.name + "<br/>" + 
                                "Pluralism: " + d['Electoral pluralism index (EIU)'] + ", <br/>" + 
                                "Government: " + d['Government index (EIU)'] + ", <br/>" + 
                                "Participation: " + d['Political participation index(EIU)'] + ", <br/>" + 
                                "Culture: " + d['Political culture index (EIU)'] + ", <br/>" + 
                                "Liberties: " + d['Civil liberties index (EIU)'] + " <br/>" + 
                                "</text>");
                            d3.select(this).transition().attr("stroke-width", "5px")
                }
            })
            .on("mousemove", (e,d) => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: tooltip.style("left", e.pageX-250 + "px").style("top", e.pageY-50 + "px")
                }
            })
            .on("mouseleave", () => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: tooltip.style("opacity", 0).style("visibility", "hidden");
                            d3.select(this).transition().attr("stroke-width", "3px")
                }
            })
            .transition().duration(1000)
            .attr("points", (d,i) => 
                    Number(width*0.85+radarScale(Number(d['Electoral pluralism index (EIU)']))*normvec[0][0]) + " " + 
                    Number(height*0.8+radarScale(Number(d['Electoral pluralism index (EIU)']))*normvec[0][1]) + "," + 
                    Number(width*0.85+radarScale(Number(d['Government index (EIU)']))*normvec[1][0]) + " " + 
                    Number(height*0.8+radarScale(Number(d['Government index (EIU)']))*normvec[1][1]) + "," + 
                    Number(width*0.85+radarScale(Number(d['Political participation index(EIU)']))*normvec[2][0]) + " " + 
                    Number(height*0.8+radarScale(Number(d['Political participation index(EIU)']))*normvec[2][1]) + "," + 
                    Number(width*0.85+radarScale(Number(d['Political culture index (EIU)']))*normvec[3][0]) + " " + 
                    Number(height*0.8+radarScale(Number(d['Political culture index (EIU)']))*normvec[3][1]) + "," + 
                    Number(width*0.85+radarScale(Number(d['Civil liberties index (EIU)']))*normvec[4][0]) + " " + 
                    Number(height*0.8+radarScale(Number(d['Civil liberties index (EIU)']))*normvec[4][1]))
            .style("visibility", (d) => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: if(selected.includes(d.geo)){return "visible"}else{return "hidden"}
                    default: return "hidden"
                }
            })
            .style("opacity", (d) => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: if(selected.includes(d.geo)){if(Number(d['Democracy index (EIU)']) > brushSel[0] && Number(d['Democracy index (EIU)']) < brushSel[1]){return 1}else{return 0.1}}else{return 0}
                    default: return 0
                }
            });


            svg.select("#radarframe").transition().duration(1000)
            .style("visibility", () => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: return "visible"
                    default: return "hidden"
                }
            }).style("opacity", () => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: return 1
                    default: return 0
                }
            });

        svg.select(".radarlabels")
            .transition()
            .style("visibility", () => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: return "visible"
                    default: return "hidden"
                }
            })
            .style("opacity", () => {
                switch(section){
                    case 13: 
                    case 14: 
                    case 15: return 1
                    default: return 0
                }
            });

        d3.select(".radaraxis").attr("transform", "translate(" + width*0.85 + " " + height*0.8 + ")").style("visibility", () => (section > 12 && section < 16) ? "visible": "hidden");
        d3.select("#axis_pluralism").style("transform", "rotate(-18deg)").call(d3.axisBottom(radarScale));
        d3.select("#axis_government").style("transform", "rotate(54deg)").call(d3.axisBottom(radarScale));
        d3.select("#axis_participation").style("transform", "rotate(126deg)").call(d3.axisTop(radarScale)); 
        d3.select("#axis_culture").style("transform", "rotate(-90deg)").call(d3.axisBottom(radarScale));
        d3.select("#axis_culture").selectAll("text").style("rotate(90deg)");
        d3.select("#axis_liberties").style("transform", "rotate(-162deg)").call(d3.axisTop(radarScale));

        d3.select("#axis_culture").selectAll("text").attr("text-anchor", "start").style("transform", "rotate(90deg)").attr("transform", "translate(10 -20)");
        d3.select(".radaraxis").selectAll("g").selectAll(".tick").style("visibility", "hidden");
        d3.select("#axis_culture").selectAll(".tick").style("visibility", () => (section > 12 && section < 16) ? "visible": "hidden").attr("transfrom(10 50)");

}

export {drawRadarChart};