import * as d3 from 'd3';
import { drawChart } from './index.js';

function drawLineChart(svg, section, width, height, yearScale, yearScaleZoom, indexScale, indexScaleHalf, tooltip, selected, zoom, x_horizontalTransform, indexScaleHorizontal, indexScaleHorizontalShrunk, x_linechart_transform, y_linechart_transform, countries){
    svg.select(".yearlines").selectAll("path")
    .data(countries, d => d[0].geo)
    .join(enter => enter.append("path").style("opacity", 0).attr("id", d => "yearline_"+d[0].geo).attr("class", "courseline"))
    .on("mouseenter", function(e,d){
        switch(section){
            case 3: 
            case 4:
            case 5: tooltip.style("opacity", 1).style("visibility", "visible").html("<img src='gif/" + d[0].geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d[0].name + "</text>");
                d3.select(this).transition("hover").style("opacity", 1)    
                break;
            case 6: tooltip.style("opacity", 1).style("visibility", "visible").html("<img src='gif/" + d[0].geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d[0].name + ", change: " + d[14]['Change in democracy index (EIU)'] + "</text>"); 
                d3.select(this).transition("hover").style("opacity", 1)
                break;
            case 7: 
            case 8: 
            case 15:d3.select(this).transition("hover").style("opacity", 1)
                    tooltip.style("opacity", 1).style("visibility", "visible").html("<img src='gif/" + d[0].geo +  ".gif' style='height: 17px; float: left'/> <text style='float: right; padding-left: 5px'>" + d[0].name + "</text>")/* .text(d.name.toUpperCase() + ", " + d['Democracy index (EIU)']) */
                    break;
        }
    })
    .on("mousemove", function(e,d){
        switch(section){
            case 3: 
            case 4:
            case 5:  
            case 6: 
            case 7: 
            case 8: 
            case 15:tooltip.style("left", e.pageX-150 + "px").style("top", e.pageY-50 + "px");break;
        }
    })
    .on("mouseleave", function(e,d){
        switch(section){
            case 3:
            case 4:
            case 5:  
            case 6: 
            case 7: 
            case 8: 
            case 15:if(!selected.includes(d[0].geo)){d3.select(this).transition("hover").style("opacity", 0.1)}
                    tooltip.style("opacity", 0).style("visibility", "hidden")
                    break;
        }
    })
    .on("click", function(e,d){
        switch(section){
            case 15: if(!selected.includes(d[0].geo)){selected.push(d[0].geo);}else{
                selected.splice(selected.indexOf(d.geo), 1)
            }; drawChart(); break;
        }
    })
    .transition("render").duration(1000)
    .attr("fill", "none")
    .attr("stroke", "#353637")
    .attr("stroke-width", "3px")
    .style("opacity", (d) => {
        switch(section){
            case 3: return 0.1
            case 4: {
                if(d[0].geo==="mli" || d[0].geo==="bdi"){return 0.1}else{return 0}
            }
            case 5: 
            case 6: 
            case 7: 
            case 8: return 0.1
            case 15: if(selected.includes(d[0].geo)){return 1}else{return 0.1}
            default: return 0
        }
    })
    .style("visibility", (d) => {
        switch(section){
            case 3: return "visible"
            case 4: {
                if(d[0].geo==="mli"|| d[0].geo==="bdi"){return "visible"}else{return "hidden"}
            }
            case 5: if(d[0].geo==="tun" || d[0].geo==="lby" || d[0].geo==="tha"){return "visible"}else{return "hidden"}
            case 6: return "visible"
            case 7: if(d[0].geo==="mli" || d[0].geo==="kgz" || d[0].geo==="ben"){return "visible"}else{return "hidden"}
            case 8: if(d[0].geo==="twn" || d[0].geo==="tur" || d[0].geo==="btn"){return "visible"}else{return "hidden"}
            case 15: return "visible"
            default: return "hidden"
        }
    })
    .attr("d", d3.line()
        .x(d => {
            if(!zoom){
                return yearScale(Number(d.time))
            }
            else{
                if(Number(d.time) < 2019){return yearScaleZoom(2019)}
                else{return yearScaleZoom(Number(d.time))}
            }
        })
        .y(d => {
            switch(section){
                case 15: return indexScale(Number(d['Democracy index (EIU)']))*0.5
                default: return indexScale(Number(d['Democracy index (EIU)']))
            }
    }));

    if(section<10){
        d3.select("#horizontalAxis").attr("transform", "translate("+ x_horizontalTransform +","+ height*0.7 +")")
                .call(d3.axisBottom(indexScaleHorizontal))
                .style("visibility", () => {
                    switch(section){
                        case 1: return "visible";
                        case 2: return "visible";
                        default: return "hidden";
                    }
                });
    }else{
        d3.select("#horizontalAxis").attr("transform", "translate("+ x_horizontalTransform +","+ (height*0.97) +")")
                .call(d3.axisBottom(indexScaleHorizontalShrunk))
                .style("visibility", () => section < 16 ? "visible": "hidden");
    }
    
    
    
    let currentScale;
    let currentTicks;
    if(zoom){
        currentScale = yearScaleZoom;
        currentTicks = ['2019', '2020'];
    }else{
        currentScale = yearScale;
        currentTicks = ['2006','2007','2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020'];
    }
            
    d3.select("#yearAxis")
        .attr("transform",() => {
            switch(section){
                case 15: return "translate(" + x_linechart_transform + "," + (indexScale(0)/2+y_linechart_transform) + ")"
                default: return "translate(" + x_linechart_transform + "," + (indexScale(0)+y_linechart_transform) + ")"
            }
        } )
        .transition().duration(1500)
        .call(d3.axisBottom(currentScale).tickValues(currentTicks, '.f').tickFormat(d3.format("d")))
        .attr("visibility", () => {
            switch(section){
                case 3:
                case 4:
                case 5:
                case 6: 
                case 7: 
                case 8: return "visible";
                case 15: return "visible";
                default: return "hidden";
            }
        });

    if(section!==15){
       d3.select("#verticalAxis")
        .call(d3.axisLeft(indexScale))
        .attr("transform", "translate(" + (width*0.7+x_linechart_transform) + "," + y_linechart_transform + ")")
        .attr("visibility", () => {
            switch(section){
                case 3:
                case 4:
                case 5:
                case 6: 
                case 7: 
                case 8: return "visible";
                default: return "hidden";
            }
        }); 
    }
    

    if(section===15){
        d3.select("#verticalAxis")
        .call(d3.axisLeft(indexScaleHalf))
        .attr("transform", "translate(" + (width*0.7+x_linechart_transform) + "," + y_linechart_transform + ")")
        .attr("visibility", "visible");
    }
    

    let rects = ["#redrect", "#yellowrect", "#greenrect", "#bluerect"]
    rects.forEach(el => {
        let currentX
        let currentY
        let currentWidth
        let currentHeight
        if(el === "#redrect"){currentX = x_horizontalTransform; if(section!==15){currentY = indexScale(40)+y_linechart_transform;}else{currentY  = indexScale(40)/2+y_linechart_transform}; currentHeight = indexScale(60)-indexScale(100); currentWidth = indexScaleHorizontal(40)}
        else if(el === "#yellowrect"){currentX = x_horizontalTransform+indexScaleHorizontal(40); if(section!==15){currentY = indexScale(60)+y_linechart_transform;}else{currentY = indexScale(60)/2+y_linechart_transform}; currentHeight = indexScale(20)-indexScale(40); currentWidth = indexScaleHorizontal(20)}
        else if(el === "#greenrect"){currentX = x_horizontalTransform+indexScaleHorizontal(60); if(section!==15){currentY = indexScale(80)+y_linechart_transform;}else{currentY = indexScale(80)/2+y_linechart_transform;} currentHeight = indexScale(20)-indexScale(40); currentWidth = indexScaleHorizontal(20)}
        else if(el === "#bluerect"){currentX = x_horizontalTransform+indexScaleHorizontal(80); if(section!==15){currentY = indexScale(100)+y_linechart_transform;}else{currentY = indexScale(100)/2+y_linechart_transform}; currentHeight = indexScale(20)-indexScale(40); currentWidth = indexScaleHorizontal(20)}

        svg.select(el).transition().duration(1000)
        .attr("x", () => {            
            switch(section){
                case 1: 
                case 2: return currentX;
                case 3: 
                case 4: 
                case 5: 
                case 6: 
                case 7: 
                case 8: return width*0.7+x_linechart_transform;
                case 15: return width*0.7+x_linechart_transform; 
                default: return width*0.7+x_linechart_transform;
            }
        })
        .attr("y", () => {
            switch(section){
                case 1: 
                case 2: return height*0.7+50;
                case 3: 
                case 4: 
                case 5: 
                case 6: 
                case 7: 
                case 8: return currentY;
                case 15: return currentY; 
                default: return currentY;
            }
        }).attr("width", () => {
            switch(section){
                case 1: 
                case 2: return currentWidth;
                case 3: 
                case 4: 
                case 5: 
                case 6: 
                case 7: 
                case 8: return yearScale(2020) - yearScale(2006);
                case 15: return yearScale(2020) - yearScale(2006); 
                default: return yearScale(2020) - yearScale(2006);
            }
        })
        .attr("height", () => {
            switch(section){
                case 1: 
                case 2: return "20";
                case 3: 
                case 4: 
                case 5: 
                case 6: 
                case 7: 
                case 8: return currentHeight;
                case 15: return currentHeight/2; 
                default: return currentHeight;
            }
        })
        .style("opacity", () => {
            switch(section){
                case 1: 
                case 2: return 1;
                case 3: 
                case 4: 
                case 5: 
                case 6: 
                case 7: 
                case 8: return 0.2;
                case 15: return 0.2; 
                default: return 0;
            }
        });
    });

    svg.select(".categoryrects").selectAll("text").style("visibility", () => section < 3 ? "visible" : "hidden").style("opacity", () => section < 3 ? 1 : 0);

}

export {drawLineChart};