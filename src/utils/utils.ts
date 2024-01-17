import * as d3Shape from 'd3-shape';
import WheelPath from "../shared/intarface/wheelIntarface";
const { width } = Dimensions.get('screen');
import color from 'randomcolor';
import {Dimensions} from "react-native";
export const makeWheel = (numberOfSegments: number): WheelPath[] => {
    const data = Array.from({ length: numberOfSegments }).fill(1);
    const arcs = d3Shape.pie()(data);
    const colors = color({
        luminosity: 'dark',
        count: numberOfSegments
    });

    return arcs.map((arc, index) => {
        const instance = d3Shape
            .arc()
            .padAngle(0.01)
            .outerRadius(width / 2)
            .innerRadius(20);

        return {
            path: instance(arc),
            color: colors[index],
            value: Math.round(Math.random() * 10 + 1) * 200, //[200, 2200]
            centroid: instance.centroid(arc)
        };
    });
};