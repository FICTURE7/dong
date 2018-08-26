Chart.defaults.global.defaultColor = 'rgba(0,0,0,0)';
Chart.defaults.global.defaultFontFamily = 'Roboto,' + Chart.defaults.global.defaultFontFamily;
//Chart.defaults.global.defaultFontSize = 12

fetch('data.json').then(res => {
    res.json().then(json => {
        const res = 1000;

        let totalData = [];
        let datasets = [];
        let channels = {};
        for (let data of json.values()) {
            if (!channels[data.channel]) {
                channels[data.channel] = [];
            }

            channels[data.channel].push(data);
        }

        let step = res !== 0 ? Math.floor((json[json.length - 1].t - json[0].t) / res) : 0;
        let colors = {
            "offtopic": '#FF1654',
            "offtopic2": '#FA7921',
            "bots": '#B2DBBF',
            "redshift-chat": '#70C1B3',
            'project-updates': '#247BA0',
        }

        for (let channelName in channels) {
            let last = undefined;

            let data = [];
            let label = '#' + channelName;
            let count = 0;

            for (let message of channels[channelName].values()) {
                if (last) {
                    if (message.t - last.t >= step) {
                        data.push({
                            t: new Date(message.t),
                            y: count
                        });

                        last = message;
                    }
                } else {
                    last = message;
                }

                count++;
            }

            datasets.push({
                label: label,
                data: data,
                borderColor: colors[channelName] === undefined ? '#E6EBE0' : colors[channelName],
                fill: false
            });
        }

        /*
        datasets.push({
            label: 'all',
            data: totalData,
        })
        */

        datasets.sort((a, b) => {
            let result = a.label.localeCompare(b.label);
            if (a.borderColor === '#E6EBE0') {
                result += 2;
            }
            if (b.borderColor === '#E6EBE0') {
                result -= 2;
            }
            return result;
        });

        let canvas = document.getElementById('chart');
        let chart = new Chart(canvas, {
            type: 'line',
            data: {
                /*
                datasets: [{
                    label: 'Total Messages Sent',
                    data: data
                }]
                */
               datasets: datasets
            },
            options: {
                responsive: true,
                elements: {
                    line: {
                        tension: 0,
                    },
                    point: {
                        radius: 0
                    }
                },
                animation: {
                    onComplete: e => {
                        /*
                        let imgHref = canvas.toDataURL('image/png');
                        let win = window.open('about:blank', 'canvas')
                        win.document.write("<img src='"+imgHref+"' alt='from canvas'/>");
                        */
                    }
                },
                hover: {
                    intersect: false,
                    mode: 'nearest'
                },
                tooltips: {
                    intersect: false
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'month'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Time'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Total Messages'
                        }
                    }]
                },
                title: {
                    display: true,
                    fontSize: 20,
                    text: 'North Earth Studios'
                }
            }
        });
    });
});