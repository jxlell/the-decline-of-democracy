import * as d3 from 'd3';
import { drawChart } from './index.js';

function drawCircles(svg, section, currentData, indexScaleHorizontal, yearScale, indexScale, height, getFill, getX, getY, dark, tooltip, selected, brushSel, x_horizontalTransform, x_linechart_transform, y_linechart_transform){
    svg.select("#gcirc")
            .selectAll("circle")
            .data(currentData, d => d.geo)
            .join(enter => enter.append("circle").attr("cx", (d,i) => indexScaleHorizontal(Number(d['Democracy index (EIU)']))).attr("cy", d => height).style("opacity", 0))
            .attr("r", 5)
            .style("fill", d => getFill(d))
            .attr("stroke", dark)
            .attr("stroke-width", "1px")
            .on("mouseenter", function(e,d){
                switch(section){
                    case 3: d3.select(this).transition("size").attr("r", 10).style("opacity", 1);
                            d3.select(".yearlines").select("#yearline_"+d.geo).transition().style("opacity", 1);
                            break;
                    default: d3.select(this).transition("size").attr("r", 10).style("opacity", 1);
                }
                tooltip.style("opacity", 1).style("visibility", "visible").html("# " + (currentData.indexOf(d)+1) + "<img src='gif/" + d.geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d.name + ", " + d['Democracy index (EIU)'] + "%</text>");
            })
            .on("mousemove", function(e,d){
                tooltip.style("left", d3.max([50,e.pageX-150]) + "px").style("top", e.pageY-50 + "px");
            })
            .on("mouseleave", function(e,d){
                switch(section){
                    case 3: d3.select(this).transition("radius").attr("r", 5);
                            d3.select(".yearlines").selectAll("path").transition().style("opacity", 0.1);
                            break;
                    default: d3.select(this).transition("radius").attr("r", 5);
                }
                tooltip.style("opacity", 0).style("visibility", "hidden");
            })
            .on("click", function(e,d){
                switch(section){
                    case 8: if(!selected.includes(d.geo)){
                        selected.push(d.geo);
                        }else{
                            selected.splice(selected.indexOf(d.geo), 1);
                        };break;
                }
                if(section===15){drawChart()}
            })
            .transition("position")
            .delay((d,i) => section === 9 ? i*20 : 0)
            .duration(1000)
            .style("opacity", d => {
                if(section < 16){
                    if(Number(d['Democracy index (EIU)']) > brushSel[0] && Number(d['Democracy index (EIU)']) < brushSel[1]){return 1}
                else{return 0.1}
                }
                else{return 0}
            })
            .style("visibility", (d) => {
                switch(section){
                    case 1:
                    case 2:
                    case 3: return "visible";
                    case 4: if(d.geo==="mli" || d.geo==="bdi"){return "visible"}else{return "hidden"};
                    case 5: if(d.geo==="tha" || d.geo==="tun" || d.geo==="lby"){return "visible"}else{return "hidden"};
                    case 7: if(d.geo==="mli" || d.geo==="kgz" || d.geo==="ben"){return "visible"}else{return "hidden"};
                    case 8: if(d.geo==="twn" || d.geo==="btn" || d.geo==="tur"){return "visible"}else{return "hidden"};
                    default: return "visible";
                }
            })
            .attr("cx", (d,i) => {
                switch(section){
                    case 1:
                    case 2: return indexScaleHorizontal(Number(d['Democracy index (EIU)'])) + x_horizontalTransform;
                    case 3: 
                    case 4: 
                    case 5: 
                    case 6: 
                    case 7: 
                    case 8: return yearScale(2020) + x_linechart_transform;
                    case 9: return getX(d,i);
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: 
                    case 16: return indexScaleHorizontal(Number(d['Democracy index (EIU)'])) * 0.7 + x_horizontalTransform;
                }
            })
            .attr("cy", (d,i) => {
                switch(section){
                    case 1: return height*0.7;
                    case 2: return height*0.7;
                    case 3: 
                    case 4: 
                    case 5: 
                    case 6: 
                    case 7: 
                    case 8: return indexScale(Number(d['Democracy index (EIU)'])) + y_linechart_transform;            
                    case 9: return getY(d,i);
                    case 10: 
                    case 11: 
                    case 12: 
                    case 13: 
                    case 14: 
                    case 15: 
                    case 16: return height*0.96;
                }
            });
}

export {drawCircles}