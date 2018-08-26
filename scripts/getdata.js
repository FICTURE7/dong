const influx = require('influx');
const fs = require('fs');

let db = new influx.InfluxDB({
    database: 'dong',
    host: 'localhost',
    port: 8086,
});

let data = [];
let cf = 0;

db.query('SELECT "time","author_id","channel" FROM "messages"').then(results => {
    for (let result of results.values()) {
        data.push({
            y: ++cf,
            t: Math.floor(parseInt(result.time.getNanoTime())),
            channel: result.channel
        });
    }

    fs.writeFileSync('./data.json', JSON.stringify(data));
});
