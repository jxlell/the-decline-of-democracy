

import * as d3 from 'd3';
import { drawCircles } from './points.js';
import { drawGlyphs } from './glyphs.js';
import { drawRadarChart } from './radar.js';
import { drawLineChart } from './linechart.js';
import {getAttributes, getFill, getCurrentData} from './helper.js';
import { drawDescriptions } from './descriptions.js';

var currentYear = 2006;
var currentSlider = 2020
var geoData;
var demData;
var worldData = [];
var countries = [];
var selected = [];

var width = window.innerWidth-50;
var height = window.innerHeight-50;

var dark = "#353537";
var light = "#dde0e7";

var x_linechart_transform = 0;
var y_linechart_transform = 25;
var x_horizontalTransform = 50;

//pentagon normvectors
var normvec1 = [0,-1];
var normvec2 = [0.951,-0.309];
var normvec3 = [0.587,0.809];
var normvec4 = [-0.587,0.809];
var normvec5 = [-0.951,-0.309];
var normvec = [normvec1, normvec2, normvec3, normvec4, normvec5];

var section = 1;
var dir = "down";
var zoom = false;

var showSorted = false;
var showDiffGlyphs = false;
var showNumberGlyphs = false;
var showShapeGlyphs = true;

//handle scrolling
var handleWheel = (e) => {
    if(e.deltaY > 0){
        if(section < 17){section = section + 1; dir="down"}
    }
    if(e.deltaY < 0){
        if(section > 1){
            section = section - 1; dir="up";
        }
        else{
            return
        }
    }
    if(section===6||section===7||section===8){zoom = true}else{zoom=false}
    if(section!==15){showSorted=false; showDiffGlyphs = false; showNumberGlyphs = false; showShapeGlyphs=true;}
    drawChart();
}

// handle navigation button press
var handleNav = (direction) => {
    if(direction==="up"){
        if(section>1){
            section = section - 1;
        }else{return}        
    }
    if(direction==="down"){
        if(section<17){
            section = section + 1;
        }
    }
    if(section===6||section===7||section===8){zoom = true}else{zoom=false}
    if(section!==15){showSorted=false; showDiffGlyphs = false; showNumberGlyphs = false; showShapeGlyphs=true;}
    drawChart();
}

function jumpToSection(num){
    section = num;
    if(num === 6){zoom = true}
    drawChart()
}

var cols = 19;

if(width/height < 1){cols = 10}
var rows = Math.floor((167/cols)+1);
var xpadding = (width*0.7)/(cols+1);
var ypadding = (height)/(rows+1);
var svg = d3.select("#viz_svg")
        .attr("width", width+50)
        .attr("height", height)
        .style("margin", 0)
        .style("padding", 0);

window.addEventListener("wheel", (e) => handleWheel(e))

// radius mindestens 5px, niemals negativ
var radius = d3.min([d3.max([5, xpadding/2-10]), d3.max([5, ypadding/2-20])]);


var getX = (d,i) => {
    var col = 1 + i % cols;
    return col * xpadding;
}
var getY = (d,i) => {
    return ypadding * (1 + Math.floor(i/cols));
}


//init scales

var yearScale = d3.scaleLinear().domain([2006,2020]).range([width*0.7,width*0.98]);
var yearScaleZoom = d3.scaleLinear().domain([2019,2020]).range([width*0.7,width*0.98]);
var indexScale = d3.scaleLinear().domain([0,100]).range([height*0.95,0]);
var indexScaleHalf = d3.scaleLinear().domain([0,100]).range([indexScale(0)/2, indexScale(100)]);
var indexScaleHorizontal = d3.scaleLinear().domain([0,100]).range([0, width-x_horizontalTransform*2]);
var indexScaleHorizontalShrunk = d3.scaleLinear().domain([0,100]).range([0, (width-x_horizontalTransform*2)*0.7]);
var polyScale = d3.scaleLinear().domain([0,100]).range([0,radius]);
var radarScale = d3.scaleLinear().domain([0,100]).range([0,0.2*height]);
var diffArrScale = d3.scaleLinear().domain([0,17]).range([0,radius]);

var tooltip = d3.select("div#tooltip").style("position", "absolute").style("opacity", 0);

var brushSel = [0,100];

var weightedMap = [1,1,1,1,1];

//main drawing function

function drawChart(){
   if(demData !== undefined && geoData !== undefined){
        if(section!==15){[currentYear, selected, weightedMap] = getAttributes(section, selected)}
        if(section===15){currentYear = currentSlider}

        let currentData = getCurrentData(demData, currentYear, weightedMap, showSorted)

        svg.select("#title").transition().duration(1000)
            .attr("x", () => {
                switch(section){
                    case 1: 
                    case 2: return width/2 + "px"
                    case 3: 
                    case 4: return width*0.4 + "px"
                    case 15: return "50px"
                    case 16:
                    case 17: return width*0.5 + "px"
                    default: return width*0.4 + "px"
                }
            })
            .attr("y", () => {
                switch(section){
                    case 1: return height/2-100+"px"
                    case 2: return height/2-100+"px"
                    case 3: 
                    case 4: return height*0.05+"px"
                    default: return height*0.05+"px"
                }
            })
            .style("font-family", "RubikBlack")
            .style("opacity", 1)
            .attr("text-anchor", () => section!==15 ?  "middle": "start")
            .attr("dominant-baseline", "middle")
            .attr("font-size", "2vw")
            .style("fill", "#353537")
            .text(() => {switch(section){
                case 1: 
                case 2: return "The Decline Of Democracy"
                case 3: return "A Negative Trend"
                case 4: 
                case 5: return "Countries show very different courses"
                case 6: return "Most countries declined recently"
                case 7: return "The people off Mali slip off into authoritarianism"
                case 8: return "Bright Future For Taiwan?"
                case 9: return "Ranking the countries in a matrix"
                case 10:
                case 11: 
                case 12: return "Changes in position"
                case 13:
                case 14: return "Different Shapes Of Democracy"
                case 15: return "Democracy Index"
                case 16: return "What we learned"
                case 17: return "Credits"
                default: return ""
            }});


        
        // path attribute from https://upload.wikimedia.org/wikipedia/commons/f/f9/Antu_arrow-right.svg
        svg.select(".arrow").selectAll("path")
            .data([1])
            .join(enter => enter.append("path").attr("transform", "translate(" + (width/2 + 20) + ", " + height*0.8 + ") rotate(90) scale(0.1)").style("opacity", 0))
            .attr("fill", dark)
            .transition().duration(2000)
            .style("opacity", () => section === 1 ? 1 : 0)
            .attr("d", "m345.44 248.29l-194.29 194.28c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744l171.91-171.91-171.91-171.9c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.29 194.28c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373")
            .attr("transform", "translate(" + (width/2 + 20) + ", " + height*0.9 + ") rotate(90) scale(0.1)")
            .attr("width", "100px");
        
        svg.select(".arrow").selectAll("text")
            .data([1])
            .join(enter => enter.append("text")
                .attr("x", width/2+"px")
                .attr("y", height*0.6+"px")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle").style("opacity", 0))
            .transition().duration(2000)
            .style("opacity", () => section === 1 ? 0.7 : 0)
            .attr("y", height*0.85+"px")
            .style("font-family", "RubikBold")
            .style("fill", dark)
            .text("scroll down step by step to explore morem or press the buttons on the top right and bottom right");

        svg.select(".progress").selectAll("rect")
            .data([1])
            .join("rect")
            .transition().duration(1000)
            .attr("x", width+50-10)
            .attr("y", "0")
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", "5")
            .style("fill", dark)
            .attr("height", section*(height/17));

        
        //main drawing functions
        drawDescriptions(height, width, section, dark);

        drawCircles(svg, section, currentData, indexScaleHorizontal, yearScale, indexScale, height, getFill, getX, getY, dark, tooltip, selected, brushSel, x_horizontalTransform, x_linechart_transform, y_linechart_transform);

        drawGlyphs(svg, section, currentData, indexScaleHorizontal, diffArrScale, polyScale, height, getFill, getX, getY, dark, light, tooltip, selected, brushSel, x_horizontalTransform, x_linechart_transform, y_linechart_transform, radius, normvec, showDiffGlyphs, showNumberGlyphs, showShapeGlyphs);
        
        drawRadarChart(svg, section, currentData, radarScale, width, height, getFill, dark, tooltip, selected, brushSel, normvec);
        
        drawLineChart(svg, section, width, height, yearScale, yearScaleZoom, indexScale, indexScaleHalf, tooltip, selected, zoom, x_horizontalTransform, indexScaleHorizontal, indexScaleHorizontalShrunk, x_linechart_transform, y_linechart_transform, countries);
        
            

        var worldline = d3.select(".world").selectAll("path")
            .data([worldData])
            .join("path")
            .attr("fill", "none")
            .attr("stroke", dark)
            .attr("stroke-width", "5px")
            .attr("d", d3.line()
                .x(d => yearScale(Number(d.time))+x_linechart_transform)
                .y(d => indexScale(Number(d['Democracy index (EIU)']))+y_linechart_transform));
        
        var worldlinelength = worldline.node().getTotalLength();

        worldline
            .attr("stroke-dasharray", worldlinelength + " " + worldlinelength)
            .attr("stroke-dashoffset", worldlinelength)
            .transition().duration(2500)
            .attr("stroke-dashoffset", () => {
                switch(section){
                    case 3: return 0
                    default: return worldlinelength
                }
            })
            .style("opacity", () => section != 3 ? 0 : 1);

            
            
            d3.selectAll(".descbox").style("max-width", width*0.4+"px");
            d3.selectAll(".descbox_sm").style("max-width", width*0.25+"px");

            d3.select("#pluralism")
            .on("click", function(e,d){
                switch(section){
                    case 15: if(weightedMap[0] === 0){weightedMap[0] = 1}else{weightedMap[0] = 0}; console.log(weightedMap); drawChart()
                }
            })
            .transition()
            .attr("text-decoration", () => weightedMap[0] === 0 ? "line-through" : "none")
            .style("opacity", () => weightedMap[0] === 0 ? 0.1 : 1);

            d3.select("#government")
            .on("click", function(e,d){
                switch(section){
                    case 15: if(weightedMap[1] === 0){weightedMap[1] = 1}else{weightedMap[1] = 0}; console.log(weightedMap); drawChart()
                }
            })
            .transition()
            .attr("text-decoration", () => weightedMap[1] === 0 ? "line-through" : "none")
            .style("opacity", () => weightedMap[1] === 0 ? 0.1 : 1);

            d3.select("#participation")
            .on("click", function(e,d){
                switch(section){
                    case 15: if(weightedMap[2] === 0){weightedMap[2] = 1}else{weightedMap[2] = 0}; console.log(weightedMap); drawChart()
                }
            })
            .transition()
            .attr("text-decoration", () => weightedMap[2] === 0 ? "line-through" : "none")
            .style("opacity", () => weightedMap[2] === 0 ? 0.1 : 1);

            d3.select("#culture")
            .on("click", function(e,d){
                switch(section){
                    case 15: if(weightedMap[3] === 0){weightedMap[3] = 1}else{weightedMap[3] = 0}; console.log(weightedMap); drawChart()
                }
            })
            .transition()
            .attr("text-decoration", () => weightedMap[3] === 0 ? "line-through" : "none")
            .style("opacity", () => weightedMap[3] === 0 ? 0.1 : 1);

            d3.select("#liberties")
            .on("click", function(e,d){
                switch(section){
                    case 15: if(weightedMap[4] === 0){weightedMap[4] = 1}else{weightedMap[4] = 0}; console.log(weightedMap); drawChart()
                }
            })
            .transition()
            .attr("text-decoration", () => weightedMap[4] === 0 ? "line-through" : "none")
            .style("opacity", () => weightedMap[4] === 0 ? 0.1 : 1);

            d3.select("#yearslider")
                .on("input", function(e,d){
                    switch(section){
                        case 15: currentYear = Number(e.target.value); currentSlider = Number(e.target.value); drawChart();
                    }
                })
                .transition()
                .style("visibility", () => {
                    switch(section){
                        case 15: return "visible"
                        default: return "hidden"
                    }
                })
                .style("opacity", () => {
                    switch(section){
                        case 15: return 1
                        default: return 0
                    }
                });

                svg.select(".indexBrush").style("visibility", () => {
                    switch(section){
                        case 15: return "visible"
                        default: return "hidden"
                    }
                });

            svg.select(".buttons").style("visibility", () => {
                switch(section){
                    case 15: return "visible"
                    default: return "hidden"
                }
            });

            svg.select("#sort_rect").transition().attr("stroke-width", () => showSorted ? "6px" : "3px")
            svg.select("#numbers_rect").transition().attr("stroke-width", () => showNumberGlyphs ? "6px" : "3px")
            svg.select("#diff_rect").transition().attr("stroke-width", () => showDiffGlyphs ? "6px" : "3px")
            svg.select("#shape_rect").transition().attr("stroke-width", () => showShapeGlyphs ? "6px" : "3px")

            svg.select(".lollipop").style("visibility", () => {
                switch(section){
                    case 1: 
                    case 2: return "visible"
                    default: return "hidden"
                }
            })
            .style("opacity", () => {
                switch(section){
                    case 1: 
                    case 2: return 1
                    default: return 0
                }
            });

            svg.select("#lolliline")
                .transition()
                .duration(1000)
                .attr("x1", () => {
                    switch(section){
                        case 1: return indexScaleHorizontal(54.7)+x_horizontalTransform
                        case 2: return indexScaleHorizontal(49.89)+x_horizontalTransform
                    }
                })
                .attr("x2", () => {
                    switch(section){
                        case 1: return indexScaleHorizontal(54.7)+x_horizontalTransform
                        case 2: return indexScaleHorizontal(49.89)+x_horizontalTransform
                    }
                });

            svg.select("#lollicircle")
                .transition()
                    .duration(1000)
                    .attr("cx", () => {
                        switch(section){
                            case 1: return indexScaleHorizontal(54.7)+x_horizontalTransform
                            case 2: return indexScaleHorizontal(49.89)+x_horizontalTransform
                        }
                    });

            svg.select("#lollitext")
                .transition()
                        .duration(1000)
                        .attr("x", () => {
                            switch(section){
                                case 1: return indexScaleHorizontal(54.7)+x_horizontalTransform
                                case 2: return indexScaleHorizontal(49.89)+x_horizontalTransform
                            }
                        })
                .text(() => {
                    switch(section){
                        case 1: return "54.7"
                        case 2: return "49.89"
                    }
                });

                d3.select("#desc54").style("visibility", () => section===1 ? "visible" : "hidden")
                d3.select("#desc49").style("visibility", () => section===2 ? "visible" : "hidden")
                svg.select("#hovertut").attr("text-anchor", "middle").transition().duration(1000).style("visibility", () => (section>3 && section<9) ? "visible" : "hidden").style("opacity", () => (section>3 && section<9) ? 1: 0).attr("x", () => width/2).attr("y", () => height*0.95)
                svg.select("#clicktut").attr("text-anchor", "middle").transition().duration(1000).style("visibility", () => section===16 ? "visible" : "hidden").style("opacity", () => section===16 ? 1: 0).attr("x", () => width/2).attr("y", () => height*0.95)

                
   }
}     

svg.select(".radarframe").append("polygon").attr("id", "radarframe").attr("stroke", dark).attr("stroke-width", "1px").style("opacity", 0).style("visibility", "hidden").style("fill", "none").attr("transform", "translate(0,0)").attr("points", 
        Number(width*0.85+radarScale(100)*normvec1[0]) + " " + 
        Number(height*0.8+radarScale(100)*normvec1[1]) + "," + 
        Number(width*0.85+radarScale(100)*normvec2[0]) + " " + 
        Number(height*0.8+radarScale(100)*normvec2[1]) + "," + 
        Number(width*0.85+radarScale(100)*normvec3[0]) + " " + 
        Number(height*0.8+radarScale(100)*normvec3[1]) + "," + 
        Number(width*0.85+radarScale(100)*normvec4[0]) + " " + 
        Number(height*0.8+radarScale(100)*normvec4[1]) + "," + 
        Number(width*0.85+radarScale(100)*normvec5[0]) + " " + 
        Number(height*0.8+radarScale(100)*normvec5[1]));

svg.select(".radarlabels").style("opacity", 0);
svg.select(".radarlabels").append("text").attr("class", "radLabel").attr("id", "pluralism").text("PLURALISM").style("opacity", 1).attr("text-anchor", "middle").attr("dominant-baseline", "central").attr("x", width*0.85+radarScale(100)*normvec1[0]).attr("y", height*0.8+radarScale(105)*normvec1[1]).style("font-family", "RubikBold").style("fill", dark).on("mouseover", function(){d3.select(this).style("cursor", "pointer")});
svg.select(".radarlabels").append("text").attr("class", "radLabel").attr("id", "government").text("GOVERNMENT").style("opacity", 1).attr("text-anchor", "start").attr("dominant-baseline", "central").attr("x", width*0.85+radarScale(100)*normvec2[0]).attr("y", height*0.8+radarScale(110)*normvec2[1]).style("font-family", "RubikBold").style("fill", dark).on("mouseover", function(){d3.select(this).style("cursor", "pointer")});//.attr("transform", "rotate(45," + Number(width*0.85+radarScale(100)*normvec2[0]) + "," + Number(height*0.8+radarScale(100)*normvec2[1]) + ")")
svg.select(".radarlabels").append("text").attr("class", "radLabel").attr("id", "participation").text("PARTICIPATION").style("opacity", 1).attr("text-anchor", "start").attr("dominant-baseline", "central").attr("x", width*0.85+radarScale(100)*normvec3[0]).attr("y", height*0.8+radarScale(110)*normvec3[1]).style("font-family", "RubikBold").style("fill", dark).on("mouseover", function(){d3.select(this).style("cursor", "pointer")});
svg.select(".radarlabels").append("text").attr("class", "radLabel").attr("id", "culture").text("CULTURE").style("opacity", 1).attr("text-anchor", "end").attr("dominant-baseline", "central").attr("x", width*0.85+radarScale(100)*normvec4[0]).attr("y", height*0.8+radarScale(110)*normvec4[1]).style("font-family", "RubikBold").style("fill", dark).on("mouseover", function(){d3.select(this).style("cursor", "pointer")});
svg.select(".radarlabels").append("text").attr("class", "radLabel").attr("id", "liberties").text("LIBERTIES").style("opacity", 1).attr("text-anchor", "end").attr("dominant-baseline", "central").attr("x", width*0.85+radarScale(100)*normvec5[0]).attr("y", height*0.8+radarScale(110)*normvec5[1]).style("font-family", "RubikBold").style("fill", dark).on("mouseover", function(){d3.select(this).style("cursor", "pointer")});
d3.selectAll(".radLabel").attr("text-decoration-thickness", "5px");

svg.select(".buttons").append("text").attr("id", "sort_text").attr("text-anchor", "middle").text("sort by name".toUpperCase()).attr("x", width*0.25+80).attr("y", 20+20).style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central");
svg.select(".buttons").append("rect").attr("id", "sort_rect").attr("width", "150").attr("height", "40").attr("x", width*0.25).attr("y", 20).style("stroke", dark).style("fill", dark).attr("rx", "10").attr("ry", "10").attr("stroke-width", "3px").attr("fill-opacity", 0).style("cursor", "pointer")
    .on("click", () => {showSorted = !showSorted; drawChart()});
svg.select(".buttons").append("text").attr("id", "numbers_text").attr("text-anchor", "middle").text("numbers".toUpperCase()).attr("x", width*0.35+55).attr("y", 20+20).style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central");
svg.select(".buttons").append("rect").attr("id", "numbers_rect").attr("width", "100").attr("height", "40").attr("x", width*0.35).attr("y", 20).style("stroke", dark).style("fill", dark).attr("rx", "10").attr("ry", "10").attr("stroke-width", "3px").attr("fill-opacity", 0).style("cursor", "pointer")
    .on("click", () => {if(!showNumberGlyphs){showDiffGlyphs = false; showShapeGlyphs = false; showNumberGlyphs = true}; drawChart()});
svg.select(".buttons").append("text").attr("id", "diff_text").attr("text-anchor", "middle").text("differences".toUpperCase()).attr("x", width*0.45+55).attr("y", 20+20).style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central");
svg.select(".buttons").append("rect").attr("id", "diff_rect").attr("width", "120").attr("height", "40").attr("x", width*0.45).attr("y", 20).style("stroke", dark).style("fill", dark).attr("rx", "10").attr("ry", "10").attr("stroke-width", "3px").attr("fill-opacity", 0).style("cursor", "pointer")
    .on("click", () => {if(!showDiffGlyphs){showDiffGlyphs = true; showShapeGlyphs = false; showNumberGlyphs = false}; drawChart()});
svg.select(".buttons").append("text").attr("id", "shape_text").attr("text-anchor", "middle").text("shapes".toUpperCase()).attr("x", width*0.55+55).attr("y", 20+20).style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central");
svg.select(".buttons").append("rect").attr("id", "shape_rect").attr("width", "100").attr("height", "40").attr("x", width*0.55).attr("y", 20).style("stroke", dark).style("fill", dark).attr("rx", "10").attr("ry", "10").attr("stroke-width", "3px").attr("fill-opacity", 0).style("cursor", "pointer")
    .on("click", () => {if(!showShapeGlyphs){showDiffGlyphs = false; showShapeGlyphs = true; showNumberGlyphs = false}; drawChart()});

svg.select(".lollipop")
    .append("line")
    .attr("id", "lolliline")
    .attr("stroke", dark)
    .attr("stroke-width", "3px")
    .attr("x1", indexScaleHorizontal(49.89)+x_horizontalTransform)
    .attr("x2", indexScaleHorizontal(49.89)+x_horizontalTransform)
    .attr("y1", height*0.7)
    .attr("y2", height*0.7-height/10);

svg.select(".lollipop")
    .append("circle")
    .attr("id", "lollicircle")
    .attr("stroke", dark)
    .attr("stroke-width", "3px")
    .style("fill", "none")
    .attr("cx", indexScaleHorizontal(49.89)+x_horizontalTransform)
    .attr("cy", height*0.7-height/10-25)
    .attr("r", 50);

svg.select(".lollipop")
    .append("text")
    .attr("id", "lollitext")
    .style("fill", dark)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("x", indexScaleHorizontal(49.89)+x_horizontalTransform)
    .attr("y", height*0.7-height/10-25)
    .style("font-family", "RubikBold")
    .text("49.89");

svg.select(".categoryrects").append("rect").attr("id", "redrect").style("fill", '#e94548').attr("x", x_horizontalTransform).attr("y", height*0.7+50).attr("width", indexScaleHorizontal(40)).attr("height", "20").style("opacity", 0)
svg.select(".categoryrects").append("rect").attr("id", "yellowrect").style("fill", '#f9ae4d').attr("x", x_horizontalTransform+indexScaleHorizontal(40)).attr("y", height*0.7+50).attr("width", indexScaleHorizontal(20)).attr("height", "20").style("opacity", 0)
svg.select(".categoryrects").append("rect").attr("id", "greenrect").style("fill", '#90bf6d').attr("x", x_horizontalTransform+indexScaleHorizontal(60)).attr("y", height*0.7+50).attr("width", indexScaleHorizontal(20)).attr("height", "20").style("opacity", 0)
svg.select(".categoryrects").append("rect").attr("id", "bluerect").style("fill", '#577591').attr("x", x_horizontalTransform+indexScaleHorizontal(80)).attr("y", height*0.7+50).attr("width", indexScaleHorizontal(20)).attr("height", "20").style("opacity", 0)
svg.select(".categoryrects").append("text").text("AUTHORITARIAN REGIME").style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central").attr("text-anchor", "middle").attr("x", x_horizontalTransform+indexScaleHorizontal(20)).attr("y", height*0.7+100).style("opacity", 0)
svg.select(".categoryrects").append("text").text("HYBRID REGIME").style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central").attr("text-anchor", "middle").attr("x", x_horizontalTransform+indexScaleHorizontal(50)).attr("y", height*0.7+100).style("opacity", 0)
svg.select(".categoryrects").append("text").text("FLAWED DEMOCRACY").style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central").attr("text-anchor", "middle").attr("x", x_horizontalTransform+indexScaleHorizontal(70)).attr("y", height*0.7+100).style("opacity", 0)
svg.select(".categoryrects").append("text").text("FULL DEMOCRACY").style("font-family", "RubikBold").style("fill", dark).attr("dominant-baseline", "central").attr("text-anchor", "middle").attr("x", x_horizontalTransform+indexScaleHorizontal(90)).attr("y", height*0.7+100).style("opacity", 0)

svg.select("#desc54").attr("x", indexScaleHorizontal(54.7)+x_horizontalTransform).attr("y", height*0.7-height/10-100).style("font-family", "RubikBold").attr("text-anchor", "middle").style("fill", dark)
svg.select("#desc49").attr("x", indexScaleHorizontal(49.89)+x_horizontalTransform).attr("y", height*0.7-height/10-100).style("font-family", "RubikBold").attr("text-anchor", "middle").style("fill", dark)
svg.select("#hovertut").style("font-family", "RubikBold").style("fill", dark)
svg.select("#clicktut").style("font-family", "RubikBold").style("fill", dark)

var indexBrush = d3.brushX()
    .extent([[indexScaleHorizontal(0)+x_horizontalTransform,height-20],[indexScaleHorizontal(100)*0.7+x_horizontalTransform,height]])
    .on("start brush end", e => {
        if(e.selection !== null){brushSel = e.selection.map(d => d - x_horizontalTransform).map(indexScaleHorizontal.invert).map(d => d*(1/0.7));
        drawChart()}
        
    })
    

svg.select(".indexBrush").call(indexBrush).call(indexBrush.move, [indexScaleHorizontal(brushSel[0])+x_horizontalTransform, indexScaleHorizontal(brushSel[1])*0.7+x_horizontalTransform]);

d3.select(".yearlines").attr("transform", "translate(" + x_linechart_transform + ", " + y_linechart_transform + ")");

d3.select("#yearslider").style("opacity", 0).style("position", "absolute").style("width", (yearScale(2020)-yearScale(2006))+"px").style("top", Number(indexScale(0)/2+2*y_linechart_transform)+"px").style("left", width*0.7+ "px").style("background", dark);


svg.append("circle").attr("r", 20).style("fill", dark).attr("cx", width).attr("cy", height*0.05).on("click", () => handleNav("up")).on("mouseover", function(){d3.select(this).style("cursor", "pointer")})
svg.append("text").attr("text-anchor", "middle").style("fill", light).text("^").attr("x", width).attr("y", height*0.05).style("font-family", "RubikBold").style("font-size", "200%").attr("dominant-baseline", "central").on("click", () => handleNav("up")).on("mouseover", function(){d3.select(this).style("cursor", "pointer")})
svg.append("circle").attr("r", 20).style("fill", dark).attr("cx", width).attr("cy", height*0.95).on("click", () => handleNav("down")).on("mouseover", function(){d3.select(this).style("cursor", "pointer")})
svg.append("text").attr("text-anchor", "middle").style("fill", light).text("v").attr("x", width).attr("y", height*0.95).style("font-family", "RubikBold").on("click", () => handleNav("down")).on("mouseover", function(){d3.select(this).style("cursor", "pointer")})


d3.csv('data/eiu2020clean.csv').then(data => {
    geoData = Array.from(d3.group(data, d => d.geo).entries());
    demData = Array.from(d3.group(data, d => d.time).entries());
    geoData.forEach(d => countries.push(d[1]));

    d3.csv('data/world.csv').then(worlddata => {
        worldData = worlddata;
        drawChart();
    })
})

export {drawChart, jumpToSection};