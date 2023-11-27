const cron = require('node-cron')
const Blog = require('../models/Blog')

// want to run cleanup function everyday
const cleanUpBin = () => {
    cron.schedule("0 0 1 * * *", async () => {
        console.log("cron is running")

        // find all the blogs where isDeleted - true
        const deletedBlogs = await Blog.find({ isDeleted: true });

        if(deletedBlogs.length > 0){
            // check if the blog is deleted 30 days before  then only delete it permanently
            deletedBlogs.forEach(async (blog) => {
                const diff = (blog.deletionDateTime - blog.creationDateTime)/
                (1000 * 60 * 60 * 24);
                // seconds * minutes * hours * days

                if(diff >= 30){
                    try{
                        await Blog.findByIdAndDelete(blog._id);
                    }catch(err){
                        console.log(err);
                    }
                }
            });
        }
    }, 
    {
        schedule: true,
        timezone: "Asia/Kolkata",
    });
};

module.exports = { cleanUpBin };