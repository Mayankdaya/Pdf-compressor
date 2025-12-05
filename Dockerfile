FROM node:20

WORKDIR /app

# Install system dependencies (Ghostscript for PDF compression)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ghostscript \
  && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
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
