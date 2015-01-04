"use strict";

var EasingHelpers = {
    /*
     * Use this to create a new easing function from 'start' to 'end'
     * based on an existing one
     * 
     * @f: the easing function to use
     * @start: the start value
     * @end: the end value
     */
    ease(f, start, end) {
        return t => start + f(t) * (end - start);   
    },
    /* Takes an easing function and reverses it, effectively creating an ease-out animation */
    toEaseOut(f) {
      return t => 1 - f(1 - t);
    },
    /* Takes an easing function and transforms it, creating an ease-in-out animation */
    toEaseInOut(f) {
      return t => 0.5 * (t < 0.5 ? f(2 * t) : (2 - f(2 - 2 * t)));
    },
    /*
     * Squeezes a function f to a new function f' that satisfies the easing function properties.
     *
     * @f: a function from Num -> Num
     * @x1: the left x coordinate that should become the new (0, 0), e.g. (x1, f(x1)) -> (0, 0)
     * @x2: the right x coordinate that should become the new (1, 1), e.g. (x2, f(x2)) -> (1, 1)
     * @return: a function f' that satisfies f'(0) = 0 and f'(1) = 1
     */
    squeeze(f, x1, x2) {
        return t => (f(x1 + t*(x2-x1)) - f(x1)) / (f(x2) - f(x1));
    }
};


/*
 * This is a collection of nice easing functions
 *
 * The functions that start with 'make' are functions that
 * take a configuration parameters and return a new easing function.
 */
var Easing = {
    /* Linear interpolation. DON'T use, ugly! */
    linear(t) {
        return t;
    },
    /* t^2 */
    quadIn(t) {
        return t * t;
    },
    quadOut(t) { return EasingHelpers.toEaseOut(Easing.quadIn)(t); },
    quadInOut(t) { return EasingHelpers.toEaseInOut(Easing.quadIn)(t); },

    /* t^3 */
    cubicIn(t) {
        return Math.pow(t, 3);
    },
    cubicOut(t) { return EasingHelpers.toEaseOut(Easing.cubicIn)(t); },
    cubicInOut(t) { return EasingHelpers.toEaseInOut(Easing.cubicIn)(t); },

    /* returns f(t) = t^e */
    makePolyIn(exponent) {
        return t => Math.pow(t, exponent);
    },

    /* 1 - cos(t * Pi/2) */
    sinIn(t) {
        return 1 - Math.cos(t * Math.PI/2);
    },
    sinOut(t) { return EasingHelpers.toEaseOut(Easing.sinIn)(t); },
    sinInOut(t) { return EasingHelpers.toEaseInOut(Easing.sinIn)(t); },

    /* 2^(10(t-1)) . Note that expIn(0)!=0, but it's close enough */
    expIn(t) {
        return Math.pow(2, 10 * (t - 1));
    },
    expOut(t) { return EasingHelpers.toEaseOut(Easing.expIn)(t); },
    expInOut(t) { return EasingHelpers.toEaseInOut(Easing.expIn)(t); },

    /* 1 - sqrt(1-t^2) */
    circleIn(t) {
        return 1 - Math.sqrt(1 - t * t);
    },
    circleOut(t) { return EasingHelpers.toEaseOut(Easing.circleIn)(t); },
    circleInOut(t) { return EasingHelpers.toEaseInOut(Easing.circleIn)(t); },

    /* a comic style function, going backwards first */
    makeBackIn(amplitude) {
        return x => x*x*((1+amplitude)*x-amplitude);
    },
    backIn(t) {
        return Easing.makeBackIn(1.70158)(t);
    },
    backOut(t) { return EasingHelpers.toEaseOut(Easing.backIn)(t); },
    /* DON'T use, ugly! */
    backInOut(t) { return EasingHelpers.toEaseInOut(Easing.backIn)(t); },


    /* 
     * returns a spring like function
     * Thanks @Microsoft
     * 
     * @springiness: how much it swings, 7 seems to be a nice value.
     * @numberOfSwings: how many swings, Integer.
     */
    makeElasticIn(springiness, numberOfSwings) {
        var s = springiness;
        var n = Math.round(numberOfSwings);
        return x => (Math.exp(s*x)-1.0)/(Math.exp(s)-1.0)*(Math.sin((Math.PI * 2.0 * n + Math.PI * 0.5) * x));
    },
    elasticIn(t) {
        // return Easing.makeElasticIn(7, 3)(t);
        return Math.sin(13.0 * t * Math.PI/2) * Math.pow(2.0, 10.0 * (t - 1.0));
    },
    elasticOut(t) { return EasingHelpers.toEaseOut(Easing.elasticIn)(t); },
    /* DON'T use, ugly! */
    elasticInOut(t) { return EasingHelpers.toEaseInOut(Easing.elasticIn)(t); },

    /*
     * returns a cartoony bounce function.
     * Thanks @Microsoft
     *
     * @bounces: the number of bounces, Integer
     * @bounciness: how damped the bounces are, should be bigger than 1.
     *     2 will result in bounces of half the height
     */
    makeBounceIn(bounces, bounciness) {
        // Clamp the bounciness so we don't hit a divide by zero
        if (bounciness <= 1) {
            bounciness = 1.001;
        }
    
        var pow = Math.pow(bounciness, bounces);
        var oneMinusBounciness = 1.0 - bounciness;
    
        // 'unit' space calculations.
        var sumOfUnits = (1.0 - pow) / oneMinusBounciness + pow * 0.5; // geometric series with only half the last sum
        return t => {
            var unitAtT = t * sumOfUnits;
            
            // 'bounce' space calculations.
            var bounceAtT = Math.log(-unitAtT * (1.0-bounciness) + 1.0) / Math.log(bounciness);
            var start = Math.floor(bounceAtT);
            var end = start + 1.0;
            
            // 'time' space calculations.
            var startTime = (1.0 - Math.pow(bounciness, start)) / (oneMinusBounciness * sumOfUnits);
            var endTime = (1.0 - Math.pow(bounciness, end)) / (oneMinusBounciness * sumOfUnits);
            
            // Curve fitting for bounce.
            var midTime = (startTime + endTime) * 0.5;
            var timeRelativeToPeak = t - midTime;
            var radius = midTime - startTime;
            var amplitude = Math.pow(1.0 / bounciness, (bounces - start));
            
            // Evaluate a quadratic that hits (startTime,0), (endTime, 0), and peaks at amplitude.
            return (-amplitude / (radius * radius)) * (timeRelativeToPeak - radius) * (timeRelativeToPeak + radius);
        };
    },
    /* a bouncy function */
    bounceIn(t) {
        // return Easing.makeBounceIn(2, 3)(t);
        return EasingHelpers.toEaseOut(Easing.bounceOut)(t);
    },
    bounceOut(t) { 
        return t < 1 / 2.75 ? 7.5625 * t * t
            : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
            : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
            : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
    /* DON'T use, ugly! */
    bounceInOut(t) { return EasingHelpers.toEaseInOut(Easing.bounceIn)(t); },
};

module.exports = {
    Easing: Easing,
    EasingHelpers: EasingHelpers,
};