# Use the official Node.js image as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copy the rest of the application code to the working directory
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Set environment variables
ENV PORT=4000

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
