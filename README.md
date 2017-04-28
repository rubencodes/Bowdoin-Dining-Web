#Bowdoin Dining

##Deployment Instructions
In the command line:

    meteor-now -e MONGO_URL=mongodb://<db-username>:<db-password>@ds023570.mlab.com:23570/bowdoindining -e ROOT_URL=https://app.bowdoin.menu -e NODE_ENV=production
    now alias <url> app.bowdoin.menu
