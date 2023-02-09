# Application

This is my first attempt at a NodeJS application

# Setup

This can be setup on Heroku using a private space and MongoDB.

1. Create a new app in your heroku private space
2. Deploy to Heroku in your chosen method
3. Add some buildpacks

   - https://github.com/timanovsky/subdir-heroku-buildpack.git
   - heroku/nodejs

4. Change the Config Vars in the settings
   - API_URL = /api/v1
   - CONNECTION_STRING = MongoDB Connection String
   - DB_NAME = MongoDB Name
   - PORT = 3000
   - PROJECT_PATH = backend
   - secret = somesecretyouwanttouse
5. Go to your private space network settings and add Space Outbound IPs to Mongo DB under Network Access
