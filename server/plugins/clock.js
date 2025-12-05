export const meta = {
    id: 'clock',
    name: 'Clock',
    description: 'Displays current time',
    defaultW: 2,
    defaultH: 2
};

export const init = async (io) => {
    console.log('Plugin loaded: clock');
};

export const getData = async () => {
    return {
        type: 'clock',
        data: {
            time: new Date().toISOString()
        }
    };
};
