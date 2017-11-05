const types = {
    delay: 'delay',
    flanger: 'flanger',
    distortion: 'distortion',
    fuzz: 'fuzz',
    reverb: 'reverb',
    filter: 'filter',
    ringmod: 'ringmod',
    compressor: 'compressor',
    stereopanner: 'stereopanner'
};

const params = {
    feedback: 'feedback',
    time: 'time',
    mix: 'mix',
    speed: 'speed',
    depth: 'depth',
    lowGain: 'lowGain',
    midLowGain: 'midLowGain',
    midHighGain: 'midHighGain',
    highGain: 'highGain',
    gain: 'gain',
    decay: 'decay',
    reverse: 'reverse',
    frequency: 'frequency',
    peak: 'peak',
    distortion: 'distortion',
    threshold: 'threshold',
    ratio: 'ratio',
    pan: 'pan'
};

const settingTypes = {
    delay: [
        params.feedback, params.time, params.mix
    ],
    flanger: [
        params.feedback, params.time, params.mix, params.speed, params.depth
    ],
    distortion: [
        params.gain, params.lowGain, params.midLowGain, params.midHighGain, params.highGain, params.mix
    ],
    fuzz: [ 
        params.gain, params.lowGain, params.midLowGain, params.midHighGain, params.highGain, params.mix
    ],
    reverb: [ 
        params.decay, params.reverse, params.mix
    ],
    filter: [ 
        params.frequency, params.peak, params.mix
    ],
    ringmod: [ 
        params.distortion, params.mix
    ],
    compressor: [ 
        params.threshold, params.ratio
    ],
    stereopanner: [ 
        params.pan
    ]
};

export const formatEffectSettings = (effectsEntries) => {
    return effectsEntries.map(entry => {
        let entryParameters = settingTypes[entry.type];
        entry.settings = {};

        entryParameters.forEach(setting => {
            entry.settings[setting] = entry[setting];
        });

        return entry;
    });
}

export const getDefaultParams = (effectType) => {
    const defaultParams = {
        keyString: '',
        valueString: ''
    };

    settingTypes[effectType].forEach((type, index) => {
        let value = effectType === params.reverse ? 'false' : '0';
        defaultParams.keyString += index !== settingTypes[effectType].length-1 ? type + ', ': type;
        defaultParams.valueString += index !== settingTypes[effectType].length-1 ? `${value}, `: value;
    });

    return defaultParams;
}