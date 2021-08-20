import * as d3 from 'd3'
import { style } from 'd3'
import {drawChart, jumpToSection} from './index.js'

function drawDescriptions(height, width, section, dark){
    
    d3.selectAll(".descbox").style("font-size", "1vw");

    d3.select("#descworldindex").style("left", width*0.2+"px").style("top", height*0.4+"px").style("opacity", () => section===3 ? 1 : 0).style("visibility", () => section===3 ? "visible" : "hidden");

    let courses = ["mli", "bdi"]
    courses.forEach((el,i) => {
        d3.select("#desc"+el+"1").style("left", width*0.2+"px").style("top", height*(i+1)*0.3+"px").style("opacity", () => section===4 ? 1 : 0).style("visibility", () => section===4 ? "visible" : "hidden")
        .on("mouseover", function(e,d){
            d3.select("#yearline_"+el).transition().style("opacity", 1)
        })
        .on("mouseleave", function(e,d){
            d3.select("#yearline_"+el).transition().style("opacity", 0.1)
        })
    });

    d3.select("#descwinners").style("left", width*0.2+"px").style("top", height*0.25+"px").style("opacity", () => section===6 ? 1 : 0).style("visibility", () => section===6 ? "visible" : "hidden")
        .on("mouseover", function(e,d){
            d3.select(".yearlines").selectAll(".courseline").filter(function(d,i){return d[14]['Democracy index (EIU)'] > d[13]['Democracy index (EIU)']}).transition().style("opacity", 1).attr("stroke", "green")
        })
        .on("mouseleave", function(e,d){
            d3.select(".yearlines").selectAll(".courseline").transition().style("opacity", 0.1).attr("stroke", dark)
        });

    d3.select("#desclosers").style("left", width*0.2+"px").style("top", height*0.5+"px").style("opacity", () => section===6 ? 1 : 0).style("visibility", () => section===6 ? "visible" : "hidden")
        .on("mouseover", function(e,d){
            d3.select(".yearlines").selectAll(".courseline").filter(function(d,i){return d[14]['Democracy index (EIU)'] < d[13]['Democracy index (EIU)']}).transition().style("opacity", 1).attr("stroke", "red")
        })
        .on("mouseleave", function(e,d){
            d3.select(".yearlines").selectAll(".courseline").transition().style("opacity", 0.1).attr("stroke", dark)
        });

    d3.select("#descstagnate").style("left", width*0.2+"px").style("top", height*0.75+"px").style("opacity", () => section===6 ? 1 : 0).style("visibility", () => section===6 ? "visible" : "hidden")
        .on("mouseover", function(e,d){
            d3.select(".yearlines").selectAll(".courseline").filter(function(d,i){return d[14]['Democracy index (EIU)'] === d[13]['Democracy index (EIU)']}).transition().style("opacity", 1).attr("stroke", "black")
        })
        .on("mouseleave", function(e,d){
            d3.select(".yearlines").selectAll(".courseline").transition().style("opacity", 0.1).attr("stroke", dark)
        });

    let different_courses = ["tha", "tun", "lby"];
    different_courses.forEach((el,i) => {
        d3.select("#desc"+el).style("left", width*0.2+"px").style("top", height*(i+1)*0.25+"px").style("opacity", () => section===5 ? 1 : 0).style("visibility", () => section===5 ? "visible" : "hidden")
            .on("mouseover", function(e,d){
                d3.select("#yearline_"+el).transition().style("opacity", 1)
            })
            .on("mouseleave", function(e,d){
                d3.select("#yearline_"+el).transition().style("opacity", 0.1)
            })
    });

    let losers = ["mli", "kgz", "ben"];
    losers.forEach((el,i) => {
        d3.select("#desc"+el).style("left", width*0.2+"px").style("top", height*(i+1)*0.25+"px").style("opacity", () => section===7 ? 1 : 0).style("visibility", () => section===7 ? "visible" : "hidden")
            .on("mouseover", function(e,d){
                d3.select("#yearline_"+el).transition().style("opacity", 1)
            })
            .on("mouseleave", function(e,d){
                d3.select("#yearline_"+el).transition().style("opacity", 0.1)
            })
    });

    let winners = ["twn", "btn", "tur"];
    winners.forEach((el,i) => {
        d3.select("#desc"+el).style("left", width*0.2+"px").style("top", height*(i+1)*0.25+"px").style("opacity", () => section===8 ? 1 : 0).style("visibility", () => section===8 ? "visible" : "hidden")
            .on("mouseover", function(e,d){
                d3.select("#yearline_"+el).transition().style("opacity", 1)
            })
            .on("mouseleave", function(e,d){
                d3.select("#yearline_"+el).transition().style("opacity", 0.1)
            })
    });

    let summaries = ["courses", "decline", "ranks", "shapes"]
    summaries.forEach((el,i) => {
        d3.select("#summary"+el).style("left", width*0.2+"px").style("top", height*(i+1)*0.2+"px").style("opacity", () => section===16 ? 1 : 0).style("visibility", () => section===16 ? "visible" : "hidden")
            .on("mouseover", function(){d3.select(this).style("cursor", "pointer")})
            .on("click", function(){
                switch(el){
                    case "courses": jumpToSection(4); break;
                    case "decline": jumpToSection(6); break;
                    case "ranks": jumpToSection(10); break;
                    case "shapes": jumpToSection(13); break;
                }
            })
    });

    d3.select("#matrix").style("left", width*0.7+"px").style("top", height*0.5+"px").style("opacity", () => section===9 ? 1 : 0).style("visibility", () => section===9 ? "visible" : "hidden");
    d3.select("#matrix2").style("left", width*0.7+"px").style("top", height*0.5+"px").style("opacity", () => section===10 ? 1 : 0).style("visibility", () => section===10 ? "visible" : "hidden");
    d3.select("#matrix3").style("left", width*0.7+"px").style("top", height*0.5+"px").style("opacity", () => section===11 ? 1 : 0).style("visibility", () => section===11 ? "visible" : "hidden");
    d3.select("#matrix4").style("left", width*0.7+"px").style("top", height*0.5+"px").style("opacity", () => section===12 ? 1 : 0).style("visibility", () => section===12 ? "visible" : "hidden");
    d3.select("#shapes").style("left", width*0.7+"px").style("top", "20px").style("opacity", () => section===13 ? 1 : 0).style("visibility", () => section===13 ? "visible" : "hidden");
    d3.select("#weighted").style("left", width*0.7+"px").style("top", "20px").style("opacity", () => section===14 ? 1 : 0).style("visibility", () => section===14 ? "visible" : "hidden");

    d3.select("#credits").style("left", "5%").style("top", "10%").style("opacity", () => section===17 ? 1 : 0).style("visibility", () => section===17 ? "visible" : "hidden").style("width", width*0.9+"px");

    d3.selectAll("#link").on("click", () => jumpToSection(17));
}

export {drawDescriptions};