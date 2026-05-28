#!/bin/bash
set -e

# Path to the wrapper jar
JAR_PATH="android/gradle/wrapper/gradle-wrapper.jar"

echo "Checking Gradle Wrapper JAR..."

if [ -f "$JAR_PATH" ]; then
    echo "Replacing existing JAR..."
    rm "$JAR_PATH"
fi

# We can regenerate the wrapper using the official gradle command if available,
# or download it. Since we are in GitHub actions, downloading might be faster.
# Using a known stable URL for 8.14.3 wrapper
# Actually, the best way is to let gradle command generate it.
# Assuming gradle is installed or we use the wrapper (which might fail)
# Let's try downloading from a known trusted source or just regenerate.
# Since we have the wrapper properties, we can use the `gradle wrapper` task
# to regenerate it.
# However, ./gradlew itself requires the jar!
# So we MUST download a valid jar first.

# Downloading a known-good gradle-wrapper.jar for 8.x
# Source: https://github.com/gradle/gradle/raw/v8.14.3/gradle/wrapper/gradle-wrapper.jar
curl -L -o "$JAR_PATH" https://github.com/gradle/gradle/raw/v8.14.3/gradle/wrapper/gradle-wrapper.jar

echo "Gradle Wrapper JAR replaced successfully."
