var ProtoBuf = require('protobufjs');
var path = require('path');

module.exports = function(res) {
    // Initialize from .proto file
    // Requires nyct-subway.proto and gtfs-realtime.proto
    const file = path.resolve(__dirname + '/../data/proto/nyct-subway.proto');

    return ProtoBuf.load(file).then(root => {
        const FeedMessage = root.lookupType('transit_realtime.FeedMessage');
        return new Promise(function(resolve, reject) {
            var data = [];

            res.body.on('data', function(chunk) {
                data.push(chunk);
            });

            res.body.on('error', function(error) {
                reject(error);
            });

            res.body.on('end', function() {
                var decodedData;
                data = Buffer.concat(data);

                if (data.length < 1) {
                    return reject(new Error('Empty response.'));
                }
                try {
                    decodedData = FeedMessage.decode(data);
                } catch (error) {
                    reject(error);
                }
                resolve(decodedData);
            });
        });
    });
};
