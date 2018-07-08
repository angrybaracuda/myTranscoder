var mongodb = require('mongodb');
const assert = require('assert');
MongoClient = mongodb.MongoClient;
var ffmpeg = require('fluent-ffmpeg');
var ffmpegBinaries = require("ffmpeg-binaries")
var fs = require('fs');
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myvod'

function createStreams(dir, source) {
    function callback() { // do something when encoding is done 
    }
    console.log("################################################ Begining stream creation for " + dir + "################################################");
    //ffmpeg -i input.mp4 
    //ffmpeg -i filename.mp4 -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls filename.m3u8

    var proc = ffmpeg(source, { timeout: 432000 }).addOptions([
        '-codec: copy', // baseline profile (level 3.0) for H264 video codec
        '-level 3.0',
        '-s 640x360',          // 640px width, 360px height output video dimensions
        '-start_number 0',     // start the first .ts segment at index 0
        '-hls_time 10',        // 10 second segment duration
        '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
        '-f hls'               // HLS format
    ]);
    proc.setFfmpegPath("E:\\MyProject\\ffmpeg\\bin\\ffmpeg.exe"); //I forgot to include "ffmpeg.exe"
    proc.output(dir + '/360p.m3u8').on('end', callback).run()

    proc = ffmpeg(source, { timeout: 432000 }).addOptions([
        '-codec: copy', // baseline profile (level 3.0) for H264 video codec
        '-level 3.0',
        '-s 842x480',          // 640px width, 360px height output video dimensions
        '-start_number 0',     // start the first .ts segment at index 0
        '-hls_time 10',        // 10 second segment duration
        '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
        '-f hls'               // HLS format
    ]);
    proc.setFfmpegPath("E:\\MyProject\\ffmpeg\\bin\\ffmpeg.exe"); //I forgot to include "ffmpeg.exe"
    proc.output(dir + '/480p.m3u8').on('end', callback).run()


    proc = ffmpeg(source, { timeout: 432000 }).addOptions([
        '-codec: copy', // baseline profile (level 3.0) for H264 video codec
        '-level 3.0',
        '-s 1280x720',          // 640px width, 360px height output video dimensions
        '-start_number 0',     // start the first .ts segment at index 0
        '-hls_time 10',        // 10 second segment duration
        '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
        '-f hls'               // HLS format
    ]);
    proc.setFfmpegPath("E:\\MyProject\\ffmpeg\\bin\\ffmpeg.exe"); //I forgot to include "ffmpeg.exe"
    proc.output(dir + '/720p.m3u8').on('end', callback).run()

    proc = ffmpeg(source, { timeout: 432000 }).addOptions([
        '-codec: copy', // baseline profile (level 3.0) for H264 video codec
        '-level 3.0',
        '-s 1920x1080',          // 640px width, 360px height output video dimensions
        '-start_number 0',     // start the first .ts segment at index 0
        '-hls_time 10',        // 10 second segment duration
        '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
        '-f hls'               // HLS format
    ]);
    proc.setFfmpegPath("E:\\MyProject\\ffmpeg\\bin\\ffmpeg.exe"); //I forgot to include "ffmpeg.exe"
    proc.output(dir + '/1080.m3u8').on('end', callback).run()

    fs.appendFile(dir+'/index.m3u8', '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n360p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=842x480\n480p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080\n1080p.m3u8', function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    console.log("################################################ Ending stream creation for " + dir + "################################################");
}

function onCollection(err, collection) {
    var cursor = collection.find({}, { tailable: true, awaitdata: true }),
        cursorStream = cursor.stream(),
        itemsProcessed = 0;

    cursorStream.on('data', function (data) {
        if (data != null) {

            console.log(data._id);
            var dir = '../../myMediaServer/videos/' + data._id;

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
                console.log(JSON.parse(data.VideoMetadata).SourceFile);
                createStreams(dir, JSON.parse(data.VideoMetadata).SourceFile);
            }
            else {
                console.log("Video already transcoded so skipping");
            }

        }
    }
    );

    setInterval(function () {
        console.log('itemsProcessed', itemsProcessed);
    }, 1000);
}

MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    db.collection('videos', onCollection);
});