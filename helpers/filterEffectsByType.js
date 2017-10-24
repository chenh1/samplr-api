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

const settingTypes = {
    delay: {
        feedback: 'feedback',
        time: 'time',
        mix: 'mix'
    },
    flanger: {
        feedback: 'feedback',
        time: 'time',
        mix: 'mix',
        speed: 'speed',
        depth: 'depth'
    },
    distortion: {
        gain: 'gain',
        lowGain: 'lowGain',
        midLowGain: 'midLowGain',
        midHighGain: 'midHighGain',
        highGain: 'highGain',
        mix: 'mix'
    },
    fuzz: {
        gain: 'gain',
        lowGain: 'lowGain',
        midLowGain: 'midLowGain',
        midHighGain: 'midHighGain',
        highGain: 'highGain',
        mix: 'mix'
    },
    reverb: {
        decay: 'decay',
        reverse: 'reverse',
        mix: 'mix'
    },
    filter: {
        frequency: 'frequency',
        peak: 'peak',
        mix: 'mix'
    },
    ringmod: {
        distortion: 'distortion',
        mix: 'mix'
    },
    compressor: {
        threshold: 'threshold',
        ratio: 'ratio'
    },
    stereopanner: {
        pan: 'pan'
    }
};

export const formatEffectSettings = (effectsEntries) => {
    return effectsEntries.map(entry => {
        let entryParameters = Object.entries(settingTypes[entry.type]);
        entry.settings = {};

        entryParameters.forEach(setting => {
            entry.settings[setting] = entry[setting];
        });

        return entry;
    });
}