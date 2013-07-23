var bignum = require('bignum');
var _ = require('underscore');

function readPart(offset, buffer) {
    var part = {
        type: buffer.readUInt16BE(offset + 0),
        length: buffer.readUInt16BE(offset + 2),
        data: null
    };
    if (part.type === 6) {
        // Values part
        var numberOfValues = buffer.readUInt16BE(offset + 4);
        var o = offset+6;
        part.data = [];
        for (var i = 0; i < numberOfValues; i++) {
            part.data.push({
                type: buffer.readUInt8(o)
            });
            o++;
        }
        for (var c = 0; c < numberOfValues; c++) {
            switch (part.data[c].type) {
                case 0: part.data[c].value = bignum.fromBuffer(buffer.slice(o, o+8), {size: 8}); break;
                case 1: part.data[c].value = buffer.readDoubleLE(o); break;
                case 2: part.data[c].value = bignum.fromBuffer(buffer.slice(o, o+8), {size: 8}); break;
                case 3: part.data[c].value = bignum.fromBuffer(buffer.slice(o, o+8), {size: 8}); break;
            }
            o += 8;
        }

    } else if ([0,2,3,4,5,100].indexOf(part.type) !== -1) {
        part.data = buffer.toString('utf-8', offset + 4, offset + part.length - 1);
    } else if ([1,8,7,9,101].indexOf(part.type) !== -1) {
        part.data = bignum.fromBuffer(buffer.slice(offset + 4, offset + 4 + 8));
    }
    return part;
}

var decode = function(b) {
    var packet = {
        host: null,
        time: null,
        plugin: null,
        pluginInstance: null,
        type: null,
        typeInstance: null,
        interval: null,
        message: null,
        values: null
    };

    var packets = [];

    var offset = 0;
    while (offset < b.length) {
        // Read 4 bytes
        var part = readPart(offset, b);
        offset += part.length;
        switch (part.type) {
            case 0:
                packet.host = part.data;
                break;
            case 1:
                packet.time = part.data;
                break;
            case 2:
                packet.plugin = part.data;
                break;
            case 3:
                packet.pluginInstance = part.data;
                break;
            case 4:
                packet.type = part.data;
                break;
            case 5:
                packet.typeInstance = part.data;
                break;
            case 6:
                packet.values = part.data;
                packets.push(_.clone(packet));
                break;
            case 7:
                packet.interval = part.data;
                break;
        }
    }
    return packets;
};

exports.decode = decode;
