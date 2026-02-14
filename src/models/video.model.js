//src/models/video.model.js

import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // for pagination in MongoDB queries

const videoSchema = new Schema(
    {
        videoFile : {
            type : String, // cloudinary url of the video
            required : true
        },
        thumbnail : {
            type : String, // cloudinary url of the thumbnail image
            required : true
        },
        title : {
            type : String,
            required : true
        },
        duration : {
            type : Number, // duration of the video in seconds, will be extracted from the video file using ffmpeg from cloudinary
            required : true
        },
        view : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {
        timestamps : true
    }
)

videoSchema.plugin(mongooseAggregatePaginate); // we are adding the mongooseAggregatePaginate plugin to our videoSchema so that we can use the pagination features provided by the plugin in our aggregate queries on the Video model

export const Video = mongoose.model("Video", videoSchema);

// mongoose-agregate-paginate-v2 is a mongoose plugin that provides pagination for mongoose aggregate queries, it is used to paginate the results of an aggregate query, it takes care of the pagination logic and returns the paginated results along with the total number of pages and the current page number, it is useful when we want to paginate the results of an aggregate query that involves multiple stages and we want to return a subset of the results based on the page number and the page size.
// npm i mongoose-aggregate-paginate-v2 for installing mongoose-aggregate-paginate-v2 package, it is a mongoose plugin that provides pagination for mongoose aggregate queries, it is used to paginate the results of an aggregate query, it takes care of the pagination logic and returns the paginated results along with the total number of pages and the current page number, it is useful when we want to paginate the results of an aggregate query that involves multiple stages and we want to return a subset of the results based on the page number and the page size.
/*
  "dependencies": {
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^17.2.4",
    "express": "^5.2.1",
    "mongoose": "^9.2.1",
    "mongoose-aggregate-paginate-v2": "^1.1.4" // For pagination in MongoDB queries
  }
*/

//mongoose aggregation pipeline is a framework for data aggregation in MongoDB, it allows us to perform complex data transformations and computations on the data stored in our MongoDB database, it consists of a series of stages that are executed in order, each stage takes the output of the previous stage as input and performs a specific operation on the data, the stages can be used to filter, group, sort, project and perform various other operations on the data, it is a powerful tool for data analysis and manipulation in MongoDB.