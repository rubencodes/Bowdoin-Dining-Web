# Bowdoin Dining

## Deployment Instructions
In the command line:

    meteor-now -e MONGO_URL=mongodb://<db-username>:<db-password>@ds023570.mlab.com:23570/bowdoindining -e ROOT_URL=https://app.bowdoin.menu -e NODE_ENV=production
    now alias <url> app.bowdoin.menu

## Build for Android
First, ensure the Android SDK and Java JDK are installed. Make sure to expose `JAVA_HOME` and `ANDROID_HOME` in `.bash_profile`.

In the command line:

    meteor build <output-directory> --server=https://app.bowdoin.menu

Then, in the android directory:

    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 release-unsigned.apk Bowdoin-Dining
    <android-sdk-directory>/build-tools/25.0.3/zipalign 4 release-unsigned.apk BowdoinDining.apk
