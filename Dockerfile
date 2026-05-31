# Use a lightweight NGINX image to serve the frontend
FROM nginx:alpine

# Copy the pre-built Angular files from the GitHub Actions runner into the NGINX HTML folder.
# Note: Adjust the path below if your Angular app outputs differently
COPY ./cardekho.web/cardekho.web/dist/cardekho.web/browser /usr/share/nginx/html

# Expose port 80 inside the container
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
