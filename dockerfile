FROM python:3.12

# set working directory
WORKDIR /app

# copy project files into container
COPY . .

# install required libraries
RUN pip install --no-cache-dir -r requirements.txt

# expose application port
EXPOSE 5000

# command to run FastAPI app
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "5000"]