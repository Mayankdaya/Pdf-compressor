FROM node:20

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build frontend
COPY . .
RUN npm run build

# Hugging Face Spaces expect the app on port 7860
ENV PORT=7860
EXPOSE 7860

# Start the Node server (serves both API and built frontend)
CMD ["node", "server.js"]
